package lk.terminal.health.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("doctors")
public class Doctor {
    @Id public String id;
    @Indexed public String hospitalId;
    public String name;
    public String specialization;
    public int fee; // LKR
}
