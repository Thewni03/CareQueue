package lk.terminal.health.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import lk.terminal.health.model.Appointment;
import lk.terminal.health.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expiryMs;

    public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiry-hours}") long hours) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiryMs = hours * 3600_000L;
    }

    public String issue(User u) {
        return Jwts.builder().subject(u.id).claim("role", u.role.name())
                .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + expiryMs))
                .signWith(key).compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    /** Signed, tamper-proof receipt shown on the patient's ticket and checked at the counter. */
    public String issueReceipt(Appointment a) {
        return Jwts.builder().subject(a.id).claim("type", "receipt").claim("token", a.tokenNumber)
                .claim("doctor", a.doctorName).claim("hospital", a.hospitalName).claim("date", a.date)
                .claim("pay", a.paymentStatus.name()).issuedAt(new Date()).signWith(key).compact();
    }
}
