package lk.terminal.health.web;

import java.util.List;
import lk.terminal.health.model.Doctor;
import lk.terminal.health.repo.DoctorRepo;
import lk.terminal.health.repo.HospitalRepo;
import lk.terminal.health.service.BookingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CatalogController {
    public record HospitalView(String id, String name, String city, String address, List<String> specializations) {}

    private final HospitalRepo hospitals; private final DoctorRepo doctors; private final BookingService booking;
    public CatalogController(HospitalRepo h, DoctorRepo d, BookingService b) { hospitals = h; doctors = d; booking = b; }

    @GetMapping("/hospitals")
    public List<HospitalView> hospitals() {
        return hospitals.findAll().stream().filter(h -> h.verified).map(h -> new HospitalView(h.id, h.name, h.city, h.address,
                doctors.findByHospitalId(h.id).stream().map((Doctor d) -> d.specialization).distinct().sorted().toList())).toList();
    }

    @GetMapping("/doctors/availability")
    public List<BookingService.SessionView> availability(@RequestParam String hospitalId, @RequestParam(required = false) String specialization) {
        return booking.availability(hospitalId, specialization);
    }

    @GetMapping("/sessions/{id}/tokens")
    public BookingService.TokenBoard tokens(@PathVariable String id) { return booking.tokenBoard(id); }
}
