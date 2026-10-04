package lk.terminal.health.repo;
import java.util.List;
import lk.terminal.health.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface DoctorRepo extends MongoRepository<Doctor, String> { List<Doctor> findByHospitalId(String hospitalId); }
