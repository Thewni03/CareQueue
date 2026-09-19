package lk.terminal.health.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;
import lk.terminal.health.model.Role;
import lk.terminal.health.model.User;
import lk.terminal.health.repo.UserRepo;
import lk.terminal.health.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class AuthController {
    public record RegisterReq(@NotBlank String name, @Email @NotBlank String email,
                              @Size(min = 6) String password, String phone) {}
    public record LoginReq(@NotBlank String email, @NotBlank String password) {}
    public record AuthRes(String token, Map<String, Object> user) {}

    private final UserRepo users; private final PasswordEncoder encoder; private final JwtService jwt;
    public AuthController(UserRepo users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.encoder = encoder; this.jwt = jwt;
    }

    private static Map<String, Object> view(User u) {
        Map<String, Object> m = new java.util.HashMap<>();
        m.put("id", u.id); m.put("name", u.name); m.put("email", u.email); m.put("role", u.role.name());
        m.put("organizationId", u.organizationId);
        return m;
    }

    /** Public registration always creates a PATIENT. Staff / pharmacy accounts are provisioned by admins. */
    @PostMapping("/auth/register")
    public AuthRes register(@Valid @RequestBody RegisterReq r) {
        if (users.findByEmail(r.email().toLowerCase()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        User u = new User();
        u.name = r.name(); u.email = r.email().toLowerCase(); u.phone = r.phone();
        u.passwordHash = encoder.encode(r.password()); u.role = Role.PATIENT;
        users.save(u);
        return new AuthRes(jwt.issue(u), view(u));
    }

    @PostMapping("/auth/login")
    public AuthRes login(@Valid @RequestBody LoginReq r) {
        User u = users.findByEmail(r.email().toLowerCase())
                .filter(x -> encoder.matches(r.password(), x.passwordHash))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong email or password"));
        return new AuthRes(jwt.issue(u), view(u));
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication a) {
        return view(users.findById(a.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED)));
    }

    @PutMapping("/me/fcm-token")
    public void fcm(Authentication a, @RequestBody Map<String, String> body) {
        User u = users.findById(a.getName()).orElseThrow();
        u.fcmToken = body.get("token"); users.save(u);
    }
}
