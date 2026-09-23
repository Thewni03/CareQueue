package lk.terminal.health.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import lk.terminal.health.model.*;
import lk.terminal.health.repo.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookingService {
    public static final ZoneId ZONE = ZoneId.of("Asia/Colombo");
    public static final long HOLD_MS = 10 * 60_000L;

    public record SessionView(String id, String hospitalId, String doctorId, String doctorName, String specialization,
                              int fee, String date, String startTime, int maxTokens, int taken, Integer nextToken, int nowServing) {}
    public record TokenBoard(String sessionId, int maxTokens, List<Integer> taken, Integer nextToken, int nowServing) {}
    public record Tracker(Appointment appointment, int nowServing, int ahead, Integer etaMinutes, boolean etaFromAi) {}

    private final MongoTemplate mongo;
    private final SessionRepo sessions;
    private final AppointmentRepo appts;
    private final HospitalRepo hospitals;
    private final PaymentRepo payments;
    private final UserRepo users;
    private final NotificationService notifier;
    private final AiService ai;
    private final int notifyAhead;

    public BookingService(MongoTemplate mongo, SessionRepo sessions, AppointmentRepo appts, HospitalRepo hospitals,
                          PaymentRepo payments, UserRepo users, NotificationService notifier, AiService ai,
                          @Value("${app.queue.notify-ahead}") int notifyAhead) {
        this.mongo = mongo; this.sessions = sessions; this.appts = appts; this.hospitals = hospitals;
        this.payments = payments; this.users = users; this.notifier = notifier; this.ai = ai; this.notifyAhead = notifyAhead;
    }

    public static String today() { return LocalDate.now(ZONE).toString(); }
    private static ResponseStatusException err(HttpStatus s, String m) { return new ResponseStatusException(s, m); }
    private DoctorSession session(String id) { return sessions.findById(id).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Session not found")); }

    // ---------- browsing ----------
    public List<SessionView> availability(String hospitalId, String specialization) {
        return sessions.findByHospitalIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(hospitalId, today()).stream()
                .filter(s -> s.active)
                .filter(s -> specialization == null || specialization.isBlank() || s.specialization.equalsIgnoreCase(specialization))
                .map(this::view).toList();
    }

    public SessionView view(DoctorSession s) {
        int taken = (int) appts.findBySessionId(s.id).stream().filter(a -> a.status != AppointmentStatus.CANCELLED).count();
        return new SessionView(s.id, s.hospitalId, s.doctorId, s.doctorName, s.specialization, s.fee, s.date, s.startTime,
                s.maxTokens, taken, s.lastIssued < s.maxTokens ? s.lastIssued + 1 : null, s.nowServing);
    }

    public TokenBoard tokenBoard(String sessionId) {
        DoctorSession s = session(sessionId);
        List<Integer> taken = appts.findBySessionId(sessionId).stream().filter(a -> a.status != AppointmentStatus.CANCELLED)
                .map(a -> a.tokenNumber).sorted().toList();
        return new TokenBoard(s.id, s.maxTokens, taken, s.lastIssued < s.maxTokens ? s.lastIssued + 1 : null, s.nowServing);
    }

    // ---------- booking ----------
    /** Assigns the next free token atomically and holds it for 10 minutes while the patient pays. */
    public Appointment book(String userId, String sessionId) {
        DoctorSession s = session(sessionId);
        if (s.date.compareTo(today()) < 0) throw err(HttpStatus.GONE, "This session has already finished");
        Optional<Appointment> existing = appts.findFirstByPatientIdAndSessionIdAndStatusIn(userId, sessionId,
                List.of(AppointmentStatus.HELD, AppointmentStatus.BOOKED));
        if (existing.isPresent()) return existing.get();

        DoctorSession upd = mongo.findAndModify(
                Query.query(Criteria.where("id").is(sessionId).and("lastIssued").lt(s.maxTokens)),
                new Update().inc("lastIssued", 1), FindAndModifyOptions.options().returnNew(true), DoctorSession.class);
        if (upd == null) throw err(HttpStatus.CONFLICT, "All tokens for this session are booked");

        User u = users.findById(userId).orElseThrow();
        Hospital h = hospitals.findById(s.hospitalId).orElseThrow();
        Appointment a = new Appointment();
        a.sessionId = s.id; a.patientId = userId; a.patientName = u.name; a.phone = u.phone;
        a.hospitalId = h.id; a.hospitalName = h.name; a.doctorId = s.doctorId; a.doctorName = s.doctorName;
        a.specialization = s.specialization; a.date = s.date; a.startTime = s.startTime; a.fee = s.fee;
        a.tokenNumber = upd.lastIssued; a.status = AppointmentStatus.HELD;
        a.heldUntil = new Date(System.currentTimeMillis() + HOLD_MS);
        a.expireAt = Date.from(LocalDate.parse(s.date).plusDays(2).atStartOfDay(ZONE).toInstant());
        return appts.save(a);
    }

    public void cancel(String userId, String appointmentId) {
        Appointment a = appts.findById(appointmentId).filter(x -> x.patientId.equals(userId))
                .orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (a.status == AppointmentStatus.SERVED) throw err(HttpStatus.CONFLICT, "This appointment is already complete");
        if (a.status == AppointmentStatus.CANCELLED) return;
        if (a.paymentStatus == PaymentStatus.PAID) {
            a.paymentStatus = PaymentStatus.REFUND_PENDING;
            for (Payment p : payments.findByAppointmentId(a.id)) { p.status = PaymentStatus.REFUND_PENDING; payments.save(p); }
        }
        a.status = AppointmentStatus.CANCELLED;
        appts.save(a);
    }

    /** Releases tokens whose 10-minute payment hold ran out. */
    @Scheduled(fixedDelay = 30_000)
    public void releaseExpiredHolds() {
        for (Appointment a : appts.findByStatusAndHeldUntilBefore(AppointmentStatus.HELD, new Date())) {
            a.status = AppointmentStatus.CANCELLED; appts.save(a);
        }
    }

    // ---------- live tracking ----------
    public Tracker tracker(Appointment a) {
        DoctorSession s = sessions.findById(a.sessionId).orElse(null);
        if (s == null) return new Tracker(a, 0, 0, null, false);
        int ahead = 0; Integer eta = null; boolean fromAi = false;
        if (a.status == AppointmentStatus.BOOKED && a.tokenNumber > s.nowServing) {
            ahead = (int) appts.findBySessionIdAndStatus(s.id, AppointmentStatus.BOOKED).stream()
                    .filter(x -> x.tokenNumber > s.nowServing && x.tokenNumber < a.tokenNumber).count();
            Integer aiEta = ai.estimateWait(a.doctorName, ahead + 1, s.avgMinutesPerPatient, s.recentMinutes);
            fromAi = aiEta != null;
            eta = fromAi ? aiEta : (int) Math.round((ahead + 1) * s.avgMinutesPerPatient);
        } else if (a.status == AppointmentStatus.BOOKED) { eta = 0; }
        return new Tracker(a, s.nowServing, ahead, eta, fromAi);
    }

    // ---------- hospital counter ----------
    /** "Next token": jumps to the next paid/confirmed patient, learns pacing, and pushes alerts. */
    public DoctorSession advance(String hospitalId, String sessionId) {
        DoctorSession s = session(sessionId);
        if (!s.hospitalId.equals(hospitalId)) throw err(HttpStatus.FORBIDDEN, "Not your hospital's session");
        List<Appointment> all = appts.findBySessionId(sessionId);
        Appointment next = all.stream().filter(a -> a.status == AppointmentStatus.BOOKED && a.tokenNumber > s.nowServing)
                .min(Comparator.comparingInt(a -> a.tokenNumber))
                .orElseThrow(() -> err(HttpStatus.CONFLICT, "No patients waiting"));
        for (Appointment a : all)
            if (a.status == AppointmentStatus.BOOKED && a.tokenNumber <= s.nowServing) { a.status = AppointmentStatus.SERVED; appts.save(a); }

        long now = System.currentTimeMillis();
        Update up = new Update().set("nowServing", next.tokenNumber).set("lastAdvancedAt", now);
        if (s.lastAdvancedAt > 0) {
            double minutes = (now - s.lastAdvancedAt) / 60000.0;
            if (minutes > 0.1 && minutes < 120) {
                List<Double> r = new ArrayList<>(s.recentMinutes); r.add(Math.round(minutes * 10) / 10.0);
                if (r.size() > 20) r = new ArrayList<>(r.subList(r.size() - 20, r.size()));
                double avg = r.stream().mapToDouble(Double::doubleValue).average().orElse(s.avgMinutesPerPatient);
                up.set("recentMinutes", r).set("avgMinutesPerPatient", Math.round(avg * 10) / 10.0);
            }
        }
        DoctorSession updated = mongo.findAndModify(Query.query(Criteria.where("id").is(sessionId)), up,
                FindAndModifyOptions.options().returnNew(true), DoctorSession.class);

        List<Appointment> waiting = all.stream().filter(a -> a.status == AppointmentStatus.BOOKED && a.tokenNumber > next.tokenNumber)
                .sorted(Comparator.comparingInt(a -> a.tokenNumber)).toList();
        for (int i = 0; i < waiting.size(); i++) {
            Appointment a = waiting.get(i);
            if (a.notified || i > notifyAhead) continue;
            User u = users.findById(a.patientId).orElse(null);
            String msg = i == 0 ? "You're next to see " + a.doctorName + ". Please head to the clinic."
                    : i + " patients ahead of you with " + a.doctorName + ". Time to head over.";
            notifier.push(u == null ? null : u.fcmToken, "Your turn is near", msg);
            a.notified = true; appts.save(a);
        }
        return updated;
    }
}
