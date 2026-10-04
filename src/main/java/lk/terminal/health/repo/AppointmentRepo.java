package lk.terminal.health.repo;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import lk.terminal.health.model.Appointment;
import lk.terminal.health.model.AppointmentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface AppointmentRepo extends MongoRepository<Appointment, String> {
    List<Appointment> findBySessionId(String sessionId);
    List<Appointment> findBySessionIdAndStatus(String sessionId, AppointmentStatus status);
    List<Appointment> findByPatientIdOrderByCreatedAtDesc(String patientId);
    Optional<Appointment> findFirstByPatientIdAndSessionIdAndStatusIn(String patientId, String sessionId, Collection<AppointmentStatus> s);
    List<Appointment> findByStatusAndHeldUntilBefore(AppointmentStatus status, Date date);
}
