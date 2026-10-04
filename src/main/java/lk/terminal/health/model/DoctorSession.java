package lk.terminal.health.model;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

/** One clinic session (doctor + date + start time) with its own live queue counters. */
@Document("doctor_sessions")
@CompoundIndex(def = "{'hospitalId':1,'date':1}")
public class DoctorSession {
    @Id public String id;
    public String hospitalId;
    public String doctorId;
    public String doctorName;
    public String specialization;
    public int fee;
    public String date;        // yyyy-MM-dd (Asia/Colombo)
    public String startTime;   // HH:mm
    public int maxTokens;
    public int lastIssued;
    public int nowServing;
    public double avgMinutesPerPatient = 8;
    public List<Double> recentMinutes = new ArrayList<>();
    public long lastAdvancedAt;
    public boolean active = true;
}
