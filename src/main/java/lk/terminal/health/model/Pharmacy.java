package lk.terminal.health.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("pharmacies")
public class Pharmacy {
    @Id public String id;
    public String name;
    public String address;
    public String phone;
    public boolean verified = true;
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE) public GeoJsonPoint location;
}
