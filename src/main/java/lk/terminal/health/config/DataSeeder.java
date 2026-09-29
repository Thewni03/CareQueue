package lk.terminal.health.config;

import java.time.LocalDate;
import java.util.Date;
import lk.terminal.health.model.*;
import lk.terminal.health.repo.*;
import lk.terminal.health.service.BookingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Seeds demo data on first run (empty hospitals collection). Demo password for all accounts: demo1234 */
@Component
public class DataSeeder implements CommandLineRunner {
    private final HospitalRepo hospitals; private final DoctorRepo doctors; private final SessionRepo sessions;
    private final AppointmentRepo appts; private final PharmacyRepo pharmacies; private final PharmacyStockRepo stock;
    private final UserRepo users; private final PasswordEncoder enc;

    public DataSeeder(HospitalRepo h, DoctorRepo d, SessionRepo s, AppointmentRepo a, PharmacyRepo p,
                      PharmacyStockRepo st, UserRepo u, PasswordEncoder e) {
        hospitals = h; doctors = d; sessions = s; appts = a; pharmacies = p; stock = st; users = u; enc = e;
    }

    private Hospital hospital(String name, String city, String addr) {
        Hospital h = new Hospital(); h.name = name; h.city = city; h.address = addr; return hospitals.save(h);
    }
    private Doctor doctor(Hospital h, String name, String spec, int fee) {
        Doctor d = new Doctor(); d.hospitalId = h.id; d.name = name; d.specialization = spec; d.fee = fee; return doctors.save(d);
    }
    private DoctorSession session(Doctor d, String date, String start, int max) {
        DoctorSession s = new DoctorSession(); s.hospitalId = d.hospitalId; s.doctorId = d.id; s.doctorName = d.name;
        s.specialization = d.specialization; s.fee = d.fee; s.date = date; s.startTime = start; s.maxTokens = max;
        return sessions.save(s);
    }
    private void prebook(DoctorSession s, Hospital h, int count) {
        for (int i = 1; i <= count; i++) {
            Appointment a = new Appointment();
            a.sessionId = s.id; a.patientId = "seed"; a.patientName = "Booked patient " + i;
            a.hospitalId = h.id; a.hospitalName = h.name; a.doctorId = s.doctorId; a.doctorName = s.doctorName;
            a.specialization = s.specialization; a.date = s.date; a.startTime = s.startTime; a.fee = s.fee;
            a.tokenNumber = i; a.status = AppointmentStatus.BOOKED;
            a.paymentMethod = i % 2 == 0 ? PaymentMethod.COUNTER : PaymentMethod.CARD;
            a.paymentStatus = i % 2 == 0 ? PaymentStatus.PAY_AT_COUNTER : PaymentStatus.PAID;
            a.expireAt = new Date(System.currentTimeMillis() + 2 * 86400_000L);
            appts.save(a);
        }
        s.lastIssued = count; sessions.save(s);
    }
    private Pharmacy pharmacy(String name, String addr, String phone, double lat, double lng) {
        Pharmacy p = new Pharmacy(); p.name = name; p.address = addr; p.phone = phone; p.location = new GeoJsonPoint(lng, lat);
        return pharmacies.save(p);
    }
    private void add(Pharmacy p, String brand, String generic, int qty) {
        PharmacyStock s = new PharmacyStock(); s.pharmacyId = p.id; s.brandName = brand; s.genericName = generic; s.quantity = qty; stock.save(s);
    }
    private void user(String name, String email, Role role, String org) {
        User u = new User(); u.name = name; u.email = email; u.role = role; u.organizationId = org;
        u.phone = "0770000000"; u.passwordHash = enc.encode("demo1234"); users.save(u);
    }

    @Override
    public void run(String... args) {
        if (hospitals.count() > 0) return;
        // clear anything left by the earlier (v1) schema so demo accounts can be recreated
        users.deleteAll(); pharmacies.deleteAll(); stock.deleteAll();

        String today = BookingService.today();
        String tomorrow = LocalDate.parse(today).plusDays(1).toString();

        Hospital nh = hospital("National Hospital of Sri Lanka", "Colombo", "Regent St, Colombo 08");
        Hospital ng = hospital("Negombo District General Hospital", "Negombo", "Colombo Rd, Negombo");

        Doctor d1 = doctor(nh, "Dr. Nimali Perera", "Cardiology", 3500);
        Doctor d2 = doctor(nh, "Dr. Ruwan Jayasuriya", "Pediatrics", 2500);
        Doctor d3 = doctor(nh, "Dr. Kamal Fernando", "General Medicine", 1800);
        Doctor d4 = doctor(ng, "Dr. Sanduni Silva", "General Medicine", 1500);
        Doctor d5 = doctor(ng, "Dr. Hasitha Abeywickrama", "Pediatrics", 2200);

        prebook(session(d1, today, "16:00", 20), nh, 5);   // "Tokens 1-5 already booked"
        session(d1, tomorrow, "09:00", 20);
        session(d2, today, "17:30", 15);
        session(d3, today, "18:00", 30);
        session(d4, today, "16:30", 25);
        session(d5, tomorrow, "10:00", 15);

        Pharmacy a = pharmacy("City Pharmacy", "Regent St, Colombo 08", "0112000001", 6.9186, 79.8772);
        Pharmacy b = pharmacy("Health Plus Pharmacy", "Borella Junction, Colombo 08", "0112000002", 6.9147, 79.8776);
        Pharmacy c = pharmacy("Lanka Care Pharmacy", "Main St, Negombo", "0312000003", 7.2095, 79.8352);
        add(a, "Panadol", "paracetamol", 120); add(a, "Augmentin 625", "amoxicillin clavulanate", 0); add(a, "Glucophage", "metformin", 40);
        add(b, "Panadol", "paracetamol", 60); add(b, "Augmentin 625", "amoxicillin clavulanate", 12); add(b, "Ventolin", "salbutamol", 8);
        add(c, "Lantus", "insulin glargine", 5); add(c, "Ventolin", "salbutamol", 20); add(c, "Glucophage", "metformin", 55);

        user("Demo Patient", "patient@demo.lk", Role.PATIENT, null);
        user("NHSL Clinic Desk", "staff@demo.lk", Role.HOSPITAL, nh.id);
        user("Negombo Clinic Desk", "staff.negombo@demo.lk", Role.HOSPITAL, ng.id);
        user("Health Plus Manager", "pharmacy@demo.lk", Role.PHARMACY, b.id);
        user("Super Admin", "admin@demo.lk", Role.ADMIN, null);
    }
}
