package lk.terminal.health.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.Date;
import java.util.List;
import lk.terminal.health.model.PharmacyStock;
import lk.terminal.health.model.User;
import lk.terminal.health.repo.PharmacyStockRepo;
import lk.terminal.health.repo.UserRepo;
import lk.terminal.health.service.PharmacyService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class PharmacyController {
    public record StockReq(@NotBlank String brandName, @NotBlank String genericName, @Min(0) int quantity) {}

    private final PharmacyService service; private final PharmacyStockRepo stock; private final UserRepo users;
    public PharmacyController(PharmacyService service, PharmacyStockRepo stock, UserRepo users) {
        this.service = service; this.stock = stock; this.users = users;
    }

    /** Public: patients search by brand, generic, or misspelled name. */
    @GetMapping("/pharmacies/search")
    public PharmacyService.SearchResponse search(@RequestParam String q, @RequestParam(required = false) Double lat,
                                                 @RequestParam(required = false) Double lng) {
        return service.search(q, lat, lng);
    }

    private String pharmacyId(Authentication a) {
        User u = users.findById(a.getName()).orElseThrow();
        if (u.organizationId == null) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No pharmacy assigned");
        return u.organizationId;
    }

    @GetMapping("/pharmacies/stock")
    @PreAuthorize("hasRole('PHARMACY')")
    public List<PharmacyStock> myStock(Authentication a) { return stock.findByPharmacyId(pharmacyId(a)); }

    @PutMapping("/pharmacies/stock")
    @PreAuthorize("hasRole('PHARMACY')")
    public PharmacyStock upsert(Authentication a, @Valid @RequestBody StockReq r) {
        String pid = pharmacyId(a);
        PharmacyStock s = stock.findByPharmacyId(pid).stream()
                .filter(x -> x.brandName.equalsIgnoreCase(r.brandName())).findFirst().orElseGet(PharmacyStock::new);
        s.pharmacyId = pid; s.brandName = r.brandName().trim(); s.genericName = r.genericName().trim();
        s.quantity = r.quantity(); s.updatedAt = new Date();
        return stock.save(s);
    }

    @DeleteMapping("/pharmacies/stock/{id}")
    @PreAuthorize("hasRole('PHARMACY')")
    public void delete(Authentication a, @PathVariable String id) {
        stock.findById(id).filter(s -> s.pharmacyId.equals(pharmacyId(a))).ifPresent(stock::delete);
    }
}
