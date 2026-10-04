package lk.terminal.health.repo;
import java.util.Collection;
import java.util.List;
import lk.terminal.health.model.PharmacyStock;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface PharmacyStockRepo extends MongoRepository<PharmacyStock, String> {
    List<PharmacyStock> findByPharmacyId(String pharmacyId);
    List<PharmacyStock> findByGenericNameInIgnoreCaseAndQuantityGreaterThan(Collection<String> names, int qty);
}
