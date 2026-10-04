package lk.terminal.health.repo;
import java.util.List;
import lk.terminal.health.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface PaymentRepo extends MongoRepository<Payment, String> {
    List<Payment> findByAppointmentId(String appointmentId);
    List<Payment> findTop100ByOrderByCreatedAtDesc();
}
