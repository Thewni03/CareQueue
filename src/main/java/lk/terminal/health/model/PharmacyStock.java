package lk.terminal.health.model;

import java.util.Date;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("pharmacy_stock")
@CompoundIndex(def = "{'pharmacyId':1,'genericName':1}")
public class PharmacyStock {
    @Id public String id;
    public String pharmacyId;
    public String brandName;
    public String genericName;
    public int quantity;
    public Date updatedAt = new Date();
}
