package lk.terminal.health.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("hospitals")
public class Hospital {
    @Id public String id;
    public String name;
    public String city;
    public String address;
    public boolean verified = true;
}
