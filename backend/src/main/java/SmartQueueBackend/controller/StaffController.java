package SmartQueueBackend.controller;

import SmartQueueBackend.entity.Ticket;
import SmartQueueBackend.service.QueueTicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final QueueTicketService queueTicketService;

    public StaffController(QueueTicketService queueTicketService) {
        this.queueTicketService = queueTicketService;
    }

    @PostMapping("/next")
    public ResponseEntity<Ticket> callNext(
            @RequestParam Long serviceId,
            @RequestParam Long counterId) {
        return ResponseEntity.ok(queueTicketService.callNext(serviceId, counterId));
    }

    @PostMapping("/complete/{ticketId}")
    public ResponseEntity<Ticket> completeTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(queueTicketService.completeTicket(ticketId));
    }

    @PostMapping("/skip/{ticketId}")
    public ResponseEntity<Ticket> skipTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(queueTicketService.skipTicket(ticketId));
    }

    @PostMapping("/recall/{ticketId}")
    public ResponseEntity<Ticket> recallTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(queueTicketService.recallTicket(ticketId));
    }

    @GetMapping("/test")
    public ResponseEntity<String> testStaff() {
        return ResponseEntity.ok("Staff API is working");
    }
}