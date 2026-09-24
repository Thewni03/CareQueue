package lk.terminal.health.service;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.YearMonth;
import java.util.Date;
import lk.terminal.health.model.*;
import lk.terminal.health.repo.*;
import lk.terminal.health.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentService {
    public record PayReq(@NotBlank String appointmentId, @NotNull PaymentMethod method,
                         String cardNumber, String expiry, String cvc, String cardName) {}

    private final AppointmentRepo appts; private final PaymentRepo payments;
    private final PaymentGateway gateway; private final JwtService jwt;

    public PaymentService(AppointmentRepo appts, PaymentRepo payments, PaymentGateway gateway, JwtService jwt) {
        this.appts = appts; this.payments = payments; this.gateway = gateway; this.jwt = jwt;
    }

    private static ResponseStatusException bad(String m) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, m); }

    public Appointment process(String userId, PayReq r) {
        Appointment a = appts.findById(r.appointmentId()).filter(x -> x.patientId.equals(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (a.status == AppointmentStatus.BOOKED) return a; // already paid / confirmed
        if (a.status != AppointmentStatus.HELD)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Your token hold expired. Please book again.");

        Payment p = new Payment();
        p.appointmentId = a.id; p.patientId = userId; p.patientName = a.patientName;
        p.hospitalId = a.hospitalId; p.hospitalName = a.hospitalName; p.amount = a.fee; p.method = r.method();

        if (r.method() == PaymentMethod.COUNTER) {
            a.paymentStatus = PaymentStatus.PAY_AT_COUNTER; p.status = PaymentStatus.PAY_AT_COUNTER; p.reference = "COUNTER";
        } else {
            String digits = "";
            if (r.method() == PaymentMethod.CARD) {
                digits = r.cardNumber() == null ? "" : r.cardNumber().replaceAll("[\\s-]", "");
                validateCard(digits, r.expiry(), r.cvc());
                p.cardLast4 = digits.substring(digits.length() - 4);
            }
            PaymentGateway.Result res = gateway.charge(r.method().name(), a.fee, digits);
            if (!res.ok()) throw bad(res.message());
            a.paymentStatus = PaymentStatus.PAID; p.status = PaymentStatus.PAID; p.reference = res.reference();
        }
        a.paymentMethod = r.method(); a.status = AppointmentStatus.BOOKED; a.heldUntil = null;
        a.receipt = jwt.issueReceipt(a);
        payments.save(p);
        return appts.save(a);
    }

    private void validateCard(String d, String expiry, String cvc) {
        if (!d.matches("\\d{13,19}") || !luhn(d)) throw bad("That card number doesn't look right. Check it and try again.");
        try {
            String[] e = expiry.split("/");
            int m = Integer.parseInt(e[0].trim()), y = 2000 + Integer.parseInt(e[1].trim());
            if (m < 1 || m > 12 || YearMonth.of(y, m).isBefore(YearMonth.now())) throw new IllegalArgumentException();
        } catch (Exception ex) { throw bad("The expiry date is invalid or in the past. Use MM/YY."); }
        if (cvc == null || !cvc.matches("\\d{3,4}")) throw bad("Enter the 3 or 4 digit security code.");
    }

    static boolean luhn(String n) {
        int sum = 0; boolean alt = false;
        for (int i = n.length() - 1; i >= 0; i--) {
            int x = n.charAt(i) - '0';
            if (alt) { x *= 2; if (x > 9) x -= 9; }
            sum += x; alt = !alt;
        }
        return sum % 10 == 0;
    }
}
