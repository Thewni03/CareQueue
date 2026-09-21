package lk.terminal.health.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/** Claude API calls over REST. Every method has a non-AI fallback so the app works without a key. */
@Service
public class AiService {
    private static final Logger log = LoggerFactory.getLogger(AiService.class);
    private final ObjectMapper mapper = new ObjectMapper();
    private final RestClient http = RestClient.create("https://api.anthropic.com");
    private final String apiKey, model;
    private final Map<String, Object[]> cache = new ConcurrentHashMap<>();

    public AiService(@Value("${app.ai.api-key}") String apiKey, @Value("${app.ai.model}") String model) {
        this.apiKey = apiKey; this.model = model;
    }

    public boolean enabled() { return apiKey != null && !apiKey.isBlank(); }

    private String ask(String system, String user) {
        try {
            String body = mapper.writeValueAsString(Map.of(
                "model", model, "max_tokens", 300, "system", system,
                "messages", List.of(Map.of("role", "user", "content", user))));
            String res = http.post().uri("/v1/messages")
                .header("x-api-key", apiKey).header("anthropic-version", "2023-06-01")
                .contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(String.class);
            JsonNode n = mapper.readTree(res);
            return n.path("content").path(0).path("text").asText("");
        } catch (Exception e) {
            log.warn("AI call failed: {}", e.getMessage());
            return null;
        }
    }

    /** Maps a brand name / misspelling to likely generic names. Returns lowercase terms (empty if AI unavailable). */
    public List<String> resolveDrug(String query) {
        if (!enabled()) return List.of();
        String key = "drug:" + query.toLowerCase().trim();
        Object[] hit = cache.get(key);
        if (hit != null && (long) hit[0] > System.currentTimeMillis()) { @SuppressWarnings("unchecked") List<String> l = (List<String>) hit[1]; return l; }
        String out = ask("You resolve medicine names for pharmacies in Sri Lanka. The user may give a brand name, "
            + "generic name, or a badly misspelled name. Reply with ONLY a JSON array of up to 5 lowercase strings: "
            + "the most likely generic (INN) name first, then common brand names. No prose. If it is not a medicine, reply [].",
            query);
        List<String> terms = new ArrayList<>();
        try {
            if (out != null) {
                String json = out.substring(out.indexOf('['), out.lastIndexOf(']') + 1);
                for (JsonNode n : mapper.readTree(json)) terms.add(n.asText().toLowerCase().trim());
            }
        } catch (Exception e) { log.warn("Bad AI drug JSON: {}", out); }
        cache.put(key, new Object[]{System.currentTimeMillis() + 3600_000L, terms});
        return terms;
    }

    /** Wait estimate in minutes using recent pacing. Returns null if AI unavailable. Cached 60s. */
    public Integer estimateWait(String hospitalName, int ahead, double avg, List<Double> recent) {
        if (!enabled() || ahead <= 0) return null;
        String key = "wait:" + hospitalName + ":" + ahead;
        Object[] hit = cache.get(key);
        if (hit != null && (long) hit[0] > System.currentTimeMillis()) return (Integer) hit[1];
        String out = ask("You estimate outpatient waiting time. Given recent minutes-per-patient samples, "
            + "weigh recent samples more, allow for variance, and reply with ONLY an integer: total minutes until the patient is seen.",
            "Hospital: " + hospitalName + "\nPatients ahead: " + ahead + "\nAverage minutes/patient: " + avg
                + "\nRecent samples: " + recent);
        Integer v = null;
        try { if (out != null) v = Integer.parseInt(out.replaceAll("[^0-9]", "")); } catch (Exception ignored) {}
        if (v != null && (v < ahead || v > ahead * 60)) v = null; // sanity check
        cache.put(key, new Object[]{System.currentTimeMillis() + 60_000L, v});
        return v;
    }
}
