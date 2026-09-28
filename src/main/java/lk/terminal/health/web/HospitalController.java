package lk.terminal.health.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import lk.terminal.health.model.*;
import lk.terminal.health.repo.*;
import lk.terminal.health.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Hospital / clinic staff. No doctor login: staff run schedules and counters for all doctors. */
@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('HOSPITAL')")
public class HospitalController {
    public record DoctorReq(@NotBlank String name, @NotBlank String specialization, @Min(0) int fee) {}
    public record SessionReq(@NotBlank String doctorId, @NotBlank String date, @NotBlank String startTime, @Min(1) @Max(200) int maxTokens) {}
    public record IncrementReq(@NotBlank String sessionId) {}
    public record PatientRow(String appointmentId, int tokenNumber, String patientName, AppointmentStatus status,
                             PaymentStatus paymentStatus, PaymentMethod method) {}
    public record SessionDetail(DoctorSession session, int waiting, List<PatientRow> patients) {}

    private final UserRepo users; private final DoctorRepo doctors; private final SessionRepo sessions;
    private final AppointmentRepo appts; private final PaymentRepo payments; private final BookingService booking;

    public HospitalController(UserRepo u, DoctorRepo d, SessionRepo s, AppointmentRepo a, PaymentRepo p, BookingService b) {
        users = u; doctors = d; sessions = s; appts = a; payments = p; booking = b;
    }

    private String hospitalId(Authentication a) {
        User u = users.findById(a.getName()).orElseThrow();
        if (u.organizationId == null) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No hospital assigned to this account");
        return u.organizationId;
    }

    @GetMapping("/hospital/doctors")
    public List<Doctor> doctors(Authentication a) { return doctors.findByHospitalId(hospitalId(a)); }

    @PostMapping("/hospital/doctors")
    public Doctor addDoctor(Authentication a, @Valid @RequestBody DoctorReq r) {
        Doctor d = new Doctor(); d.hospitalId = hospitalId(a); d.name = r.name().trim();
        d.specialization = r.specialization().trim(); d.fee = r.fee(); return doctors.save(d);
    }

    @GetMapping("/hospital/sessions")
    public List<BookingService.SessionView> sessions(Authentication a) {
        return sessions.findByHospitalIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(hospitalId(a), BookingService.today())
                .stream().map(booking::view).toList();
    }

    @PostMapping("/hospital/sessions")
    public BookingService.SessionView addSession(Authentication a, @Valid @RequestBody SessionReq r) {
        String hid = hospitalId(a);
        Doctor d = doctors.findById(r.doctorId()).filter(x -> x.hospitalId.equals(hid))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
        try { LocalDate.parse(r.date()); LocalTime.parse(r.startTime()); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a valid date and start time"); }
        if (r.date().compareTo(BookingService.today()) < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pick today or a future date");
        DoctorSession s = new DoctorSession();
        s.hospitalId = hid; s.doctorId = d.id; s.doctorName = d.name; s.specialization = d.specialization; s.fee = d.fee;
        s.date = r.date(); s.startTime = r.startTime(); s.maxTokens = r.maxTokens();
        return booking.view(sessions.save(s));
    }

    @GetMapping("/hospital/sessions/{id}/patients")
    public SessionDetail patients(Authentication a, @PathVariable String id) {
        DoctorSession s = sessions.findById(id).filter(x -> x.hospitalId.equals(hospitalId(a)))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
        List<Appointment> list = appts.findBySessionId(id).stream().filter(x -> x.status != AppointmentStatus.CANCELLED)
                .sorted(Comparator.comparingInt(x -> x.tokenNumber)).toList();
        int waiting = (int) list.stream().filter(x -> x.status == AppointmentStatus.BOOKED && x.tokenNumber > s.nowServing).count();
        return new SessionDetail(s, waiting, list.stream().map(x -> new PatientRow(x.id, x.tokenNumber, x.patientName,
                x.status, x.paymentStatus, x.paymentMethod)).toList());
    }

    /** Staff presses "Next token" during a clinic session. */
    @PostMapping("/queue/increment")
    public SessionDetail increment(Authentication a, @Valid @RequestBody IncrementReq r) {
        booking.advance(hospitalId(a), r.sessionId());
        return patients(a, r.sessionId());
    }

    /** Cash received at the counter. */
    @PostMapping("/hospital/appointments/{id}/collect")
    public PatientRow collect(Authentication a, @PathVariable String id) {
        Appointment x = appts.findById(id).filter(y -> y.hospitalId.equals(hospitalId(a)))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (x.paymentStatus != PaymentStatus.PAY_AT_COUNTER) throw new ResponseStatusException(HttpStatus.CONFLICT, "Nothing to collect for this booking");
        x.paymentStatus = PaymentStatus.PAID; appts.save(x);
        for (Payment p : payments.findByAppointmentId(id)) { p.status = PaymentStatus.PAID; p.reference = "COUNTER-CASH"; payments.save(p); }
        return new PatientRow(x.id, x.tokenNumber, x.patientName, x.status, x.paymentStatus, x.paymentMethod);
    }
}
