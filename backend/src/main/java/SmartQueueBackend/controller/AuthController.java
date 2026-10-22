package SmartQueueBackend.controller;

import SmartQueueBackend.dto.AuthResponse;
import SmartQueueBackend.dto.LoginRequest;
import SmartQueueBackend.entity.User;
import SmartQueueBackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        User saved = userService.saveUser(user);
        return ResponseEntity.ok(new AuthResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getRole(),
                "mock-token-" + saved.getId()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        User authenticated = userService.authenticate(request);
        return ResponseEntity.ok(new AuthResponse(
                authenticated.getId(),
                authenticated.getName(),
                authenticated.getEmail(),
                authenticated.getRole(),
                "mock-token-" + authenticated.getId()
        ));
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<User> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}