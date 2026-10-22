package SmartQueueBackend.controller;

import SmartQueueBackend.dto.CreateCounterRequest;
import SmartQueueBackend.entity.Counter;
import SmartQueueBackend.service.CounterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/counters")
public class CounterController {

    private final CounterService counterService;

    public CounterController(CounterService counterService) {
        this.counterService = counterService;
    }

    @GetMapping
    public ResponseEntity<List<Counter>> getAllCounters() {
        return ResponseEntity.ok(counterService.getAllCounters());
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<Counter>> getCountersByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(counterService.getCountersByService(serviceId));
    }

    @PostMapping
    public ResponseEntity<Counter> createCounter(@RequestBody CreateCounterRequest request) {
        return ResponseEntity.ok(counterService.createCounter(request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Counter> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(counterService.updateCounterStatus(id, status));
    }
}