package lk.terminal.health.model;

import java.util.Date;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Contains patient phone, so it is auto-deleted by a TTL index after the session day. */
@Document("appointments")
public class Appointment {
    @Id public String id;
    @Indexed public String sessionId;
    @Indexed public String patientId;
    public String hospitalId, hospitalName, doctorId, doctorName, specialization, date, startTime;
    public String patientName, phone;
    public int tokenNumber;
    public int fee;
    public AppointmentStatus status = AppointmentStatus.HELD;
    public PaymentMethod paymentMethod;
    public PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    public String receipt;      // signed JWT receipt
    public boolean notified;
    public Date createdAt = new Date();
    public Date heldUntil;
    @Indexed(expireAfterSeconds = 0) public Date expireAt;
}
