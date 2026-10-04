package lk.terminal.health.model;

import java.util.Date;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Payment log for admins. Stores only the last 4 card digits, never full card data. */
@Document("payments")
public class Payment {
    @Id public String id;
    @Indexed public String appointmentId;
    public String patientId, patientName, hospitalId, hospitalName;
    public int amount;
    public PaymentMethod method;
    public PaymentStatus status;
    public String reference;
    public String cardLast4;
    public Date createdAt = new Date();
}
