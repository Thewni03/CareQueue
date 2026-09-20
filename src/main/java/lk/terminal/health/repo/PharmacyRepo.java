package lk.terminal.health.repo;
import lk.terminal.health.model.Pharmacy;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface PharmacyRepo extends MongoRepository<Pharmacy, String> {}
