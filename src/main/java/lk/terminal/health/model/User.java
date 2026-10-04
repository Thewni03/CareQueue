package lk.terminal.health.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("users")
public class User {
    @Id public String id;
    public String name;
    @Indexed(unique = true) public String email;
    public String passwordHash;
    public Role role;
    public String phone;
    /** FCM device token (optional). */
    public String fcmToken;
    /** Hospital (STAFF) or pharmacy (PHARMACY) this user manages. */
    public String organizationId;
}
