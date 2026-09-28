package lk.terminal.health.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import lk.terminal.health.model.*;
import lk.terminal.health.repo.*;
import lk.terminal.health.service.BookingService;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    public record OrgReq(@NotBlank String name, String city, String address, Double lat, Double lng, String phone,
                         @NotBlank String staffName, @Email @NotBlank String staffEmail, @Size(min = 6) String staffPassword) {}
    public record UserRow(String id, String name, String email, Role role, String organizationId) {}
    public record Stats(long patients, long hospitals, long pharmacies, long payments, long revenue,
                        Map<String, Long> byMethod, Map<String, Long> revenueByDay) {}

    private final UserRepo users; private final HospitalRepo hospitals; private final PharmacyRepo pharmacies;
    private final PaymentRepo payments; private final PasswordEncoder enc;
    public AdminController(UserRepo u, HospitalRepo h, PharmacyRepo p, PaymentRepo pay, PasswordEncoder e) {
        users = u; hospitals = h; pharmacies = p; payments = pay; enc = e;
    }

    @GetMapping("/stats")
    public Stats stats() {
        List<Payment> all = payments.findAll();
        List<Payment> paid = all.stream().filter(p -> p.status == PaymentStatus.PAID).toList();
        Map<String, Long> byMethod = all.stream().collect(Collectors.groupingBy(p -> p.method.name(), TreeMap::new, Collectors.counting()));
        Map<String, Long> byDay = new LinkedHashMap<>();
        LocalDate today = LocalDate.now(BookingService.ZONE);
        for (int i = 6; i >= 0; i--) byDay.put(today.minusDays(i).toString(), 0L);
        for (Payment p : paid) {
            String d = p.createdAt.toInstant().atZone(BookingService.ZONE).toLocalDate().toString();
            byDay.computeIfPresent(d, (k, v) -> v + p.amount);
        }
        return new Stats(users.findAll().stream().filter(u -> u.role == Role.PATIENT).count(), hospitals.count(), pharmacies.count(),
                all.size(), paid.stream().mapToLong(p -> p.amount).sum(), byMethod, byDay);
    }

    // ----- users -----
    @GetMapping("/users")
    public List<UserRow> users() {
        return users.findAll().stream().map(u -> new UserRow(u.id, u.name, u.email, u.role, u.organizationId)).toList();
    }

    @PutMapping("/users/{id}/role")
    public UserRow setRole(Authentication a, @PathVariable String id, @RequestBody Map<String, String> body) {
        if (id.equals(a.getName())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can't change your own role");
        User u = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        try { u.role = Role.valueOf(body.get("role")); } catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown role"); }
        users.save(u);
        return new UserRow(u.id, u.name, u.email, u.role, u.organizationId);
    }

    private User staff(OrgReq r, Role role, String orgId) {
        if (users.findByEmail(r.staffEmail().toLowerCase()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That staff email is already registered");
        User u = new User(); u.name = r.staffName(); u.email = r.staffEmail().toLowerCase(); u.role = role;
        u.organizationId = orgId; u.passwordHash = enc.encode(r.staffPassword()); return users.save(u);
    }

    // ----- hospitals -----
    @GetMapping("/hospitals")
    public List<Hospital> hospitals() { return hospitals.findAll(); }

    @PostMapping("/hospitals")
    public Hospital onboardHospital(@Valid @RequestBody OrgReq r) {
        if (users.findByEmail(r.staffEmail().toLowerCase()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That staff email is already registered");
        Hospital h = new Hospital(); h.name = r.name(); h.city = r.city(); h.address = r.address(); h.verified = true;
        hospitals.save(h); staff(r, Role.HOSPITAL, h.id); return h;
    }

    @PutMapping("/hospitals/{id}/verified")
    public Hospital verifyHospital(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        Hospital h = hospitals.findById(id).orElseThrow(); h.verified = Boolean.TRUE.equals(body.get("verified")); return hospitals.save(h);
    }

    // ----- pharmacies -----
    @GetMapping("/pharmacies")
    public List<Pharmacy> pharmacies() { return pharmacies.findAll(); }

    @PostMapping("/pharmacies")
    public Pharmacy onboardPharmacy(@Valid @RequestBody OrgReq r) {
        if (users.findByEmail(r.staffEmail().toLowerCase()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That staff email is already registered");
        Pharmacy p = new Pharmacy(); p.name = r.name(); p.address = r.address(); p.phone = r.phone(); p.verified = true;
        p.location = new GeoJsonPoint(r.lng() == null ? 79.8612 : r.lng(), r.lat() == null ? 6.9271 : r.lat());
        pharmacies.save(p); staff(r, Role.PHARMACY, p.id); return p;
    }

    @PutMapping("/pharmacies/{id}/verified")
    public Pharmacy verifyPharmacy(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        Pharmacy p = pharmacies.findById(id).orElseThrow(); p.verified = Boolean.TRUE.equals(body.get("verified")); return pharmacies.save(p);
    }

    // ----- payment log -----
    @GetMapping("/payments")
    public List<Payment> payments() { return payments.findTop100ByOrderByCreatedAtDesc(); }
}
