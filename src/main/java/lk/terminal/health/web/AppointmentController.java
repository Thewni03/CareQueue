package lk.terminal.health.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lk.terminal.health.model.Appointment;
import lk.terminal.health.model.AppointmentStatus;
import lk.terminal.health.repo.AppointmentRepo;
import lk.terminal.health.service.BookingService;
import lk.terminal.health.service.PaymentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('PATIENT')")
public class AppointmentController {
    public record BookReq(@NotBlank String sessionId) {}

    private final BookingService booking; private final PaymentService payments; private final AppointmentRepo appts;
    public AppointmentController(BookingService b, PaymentService p, AppointmentRepo a) { booking = b; payments = p; appts = a; }

    @PostMapping("/appointments/book")
    public Appointment book(Authentication a, @Valid @RequestBody BookReq r) { return booking.book(a.getName(), r.sessionId()); }

    @PostMapping("/payments/process")
    public Appointment pay(Authentication a, @Valid @RequestBody PaymentService.PayReq r) { return payments.process(a.getName(), r); }

    @GetMapping("/appointments/mine")
    public List<BookingService.Tracker> mine(Authentication a) {
        return appts.findByPatientIdOrderByCreatedAtDesc(a.getName()).stream()
                .filter(x -> x.status != AppointmentStatus.CANCELLED).map(booking::tracker).toList();
    }

    @DeleteMapping("/appointments/{id}")
    public void cancel(Authentication a, @PathVariable String id) { booking.cancel(a.getName(), id); }
}
