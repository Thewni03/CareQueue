package lk.terminal.health.repo;
import lk.terminal.health.model.Hospital;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface HospitalRepo extends MongoRepository<Hospital, String> {}
