package lk.terminal.health.repo;
import java.util.Optional;
import lk.terminal.health.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface UserRepo extends MongoRepository<User, String> { Optional<User> findByEmail(String email); }
