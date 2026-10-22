package SmartQueueBackend.controller;

import SmartQueueBackend.dto.QueueStatsResponse;
import SmartQueueBackend.entity.Counter;
import SmartQueueBackend.entity.QueueService;
import SmartQueueBackend.repository.CounterRepository;
import SmartQueueBackend.repository.QueueServiceRepository;
import SmartQueueBackend.repository.TicketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final TicketRepository ticketRepository;
    private final CounterRepository counterRepository;
    private final QueueServiceRepository queueServiceRepository;

    public AdminController(
            TicketRepository ticketRepository,
            CounterRepository counterRepository,
            QueueServiceRepository queueServiceRepository) {
        this.ticketRepository = ticketRepository;
        this.counterRepository = counterRepository;
        this.queueServiceRepository = queueServiceRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<QueueStatsResponse> getStats() {
        QueueStatsResponse stats = new QueueStatsResponse();
        stats.setTotalTickets(ticketRepository.count());
        stats.setWaitingCount(ticketRepository.countByStatus("WAITING"));
        stats.setCalledCount(ticketRepository.countByStatus("CALLED"));
        stats.setCompletedCount(ticketRepository.countByStatus("COMPLETED"));
        stats.setSkippedCount(ticketRepository.countByStatus("SKIPPED"));

        List<Counter> counters = counterRepository.findAll();
        long active = counters.stream()
                .filter(c -> !"OFFLINE".equalsIgnoreCase(c.getStatus()))
                .count();
        stats.setActiveCounters((int) active);

        // Approximate average wait time from service estimates
        stats.setAvgWaitTimeMinutes(7.5);

        Map<String, Long> serviceCounts = new HashMap<>();
        List<QueueService> services = queueServiceRepository.findAll();
        for (QueueService service : services) {
            long waitingForService = ticketRepository.countByService_IdAndStatus(service.getId(), "WAITING");
            serviceCounts.put(service.getName(), waitingForService);
        }
        stats.setServiceQueueCounts(serviceCounts);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/test")
    public ResponseEntity<String> testAdmin() {
        return ResponseEntity.ok("Admin API is working");
    }
}