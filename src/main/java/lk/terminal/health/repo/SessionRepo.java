package lk.terminal.health.repo;
import java.util.List;
import lk.terminal.health.model.DoctorSession;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface SessionRepo extends MongoRepository<DoctorSession, String> {
    List<DoctorSession> findByHospitalIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(String hospitalId, String date);
}
