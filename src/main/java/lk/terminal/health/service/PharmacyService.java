package lk.terminal.health.service;

import java.util.*;
import java.util.stream.Collectors;
import lk.terminal.health.model.*;
import lk.terminal.health.repo.*;
import org.springframework.stereotype.Service;

@Service
public class PharmacyService {
    public record Match(String brandName, String genericName, int quantity) {}
    public record Result(Pharmacy pharmacy, List<Match> matches, Double distanceKm) {}
    public record SearchResponse(String query, List<String> interpretedAs, List<Result> results) {}

    private final PharmacyRepo pharmacies;
    private final PharmacyStockRepo stock;
    private final AiService ai;

    public PharmacyService(PharmacyRepo pharmacies, PharmacyStockRepo stock, AiService ai) {
        this.pharmacies = pharmacies; this.stock = stock; this.ai = ai;
    }

    public SearchResponse search(String q, Double lat, Double lng) {
        String query = q == null ? "" : q.toLowerCase().trim();
        List<PharmacyStock> inStock = stock.findAll().stream().filter(s -> s.quantity > 0).toList();

        // 1) AI resolves brand/generic/misspelling; 2) fuzzy fallback against names we actually stock
        Set<String> terms = new LinkedHashSet<>(ai.resolveDrug(query));
        terms.add(query);
        Set<String> known = new HashSet<>();
        inStock.forEach(s -> { known.add(s.brandName.toLowerCase()); known.add(s.genericName.toLowerCase()); });
        for (String k : known) if (!query.isEmpty() && (k.contains(query) || distance(k, query) <= Math.max(1, k.length() / 4))) terms.add(k);

        Map<String, List<Match>> byPharmacy = new HashMap<>();
        for (PharmacyStock s : inStock) {
            if (terms.contains(s.brandName.toLowerCase()) || terms.contains(s.genericName.toLowerCase()))
                byPharmacy.computeIfAbsent(s.pharmacyId, k -> new ArrayList<>()).add(new Match(s.brandName, s.genericName, s.quantity));
        }
        List<Result> out = new ArrayList<>();
        for (Pharmacy p : pharmacies.findAllById(byPharmacy.keySet())) {
            if (!p.verified) continue;
            Double d = (lat != null && lng != null && p.location != null)
                    ? Math.round(haversine(lat, lng, p.location.getY(), p.location.getX()) * 10) / 10.0 : null;
            out.add(new Result(p, byPharmacy.get(p.id), d));
        }
        out.sort(Comparator.comparing(r -> r.distanceKm() == null ? Double.MAX_VALUE : r.distanceKm()));
        return new SearchResponse(q, terms.stream().filter(t -> !t.equals(query)).limit(4).collect(Collectors.toList()), out);
    }

    static double haversine(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1), dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    static int distance(String a, String b) {
        int[] prev = new int[b.length() + 1], cur = new int[b.length() + 1];
        for (int j = 0; j <= b.length(); j++) prev[j] = j;
        for (int i = 1; i <= a.length(); i++) {
            cur[0] = i;
            for (int j = 1; j <= b.length(); j++)
                cur[j] = Math.min(Math.min(cur[j - 1] + 1, prev[j] + 1), prev[j - 1] + (a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1));
            int[] t = prev; prev = cur; cur = t;
        }
        return prev[b.length()];
    }
}
