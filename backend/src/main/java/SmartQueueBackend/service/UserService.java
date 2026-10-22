package SmartQueueBackend.service;

import SmartQueueBackend.dto.LoginRequest;
import SmartQueueBackend.entity.User;
import SmartQueueBackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User saveUser(User user) {
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Email already registered: " + user.getEmail());
        }
        return userRepository.save(user);
    }

    public User authenticate(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User findOrCreateUser(String name, String email) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setName(name != null && !name.isBlank() ? name : "Visitor");
            newUser.setEmail(email);
            newUser.setPassword("guest123");
            newUser.setRole("CUSTOMER");
            return userRepository.save(newUser);
        });
    }
}