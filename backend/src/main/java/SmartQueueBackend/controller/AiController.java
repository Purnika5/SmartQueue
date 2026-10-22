package SmartQueueBackend.controller;

import SmartQueueBackend.dto.AiChatRequest;
import SmartQueueBackend.dto.AiChatResponse;
import SmartQueueBackend.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(aiService.processQuery(request));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("SmartQueue AI Copilot is operational");
    }
}
