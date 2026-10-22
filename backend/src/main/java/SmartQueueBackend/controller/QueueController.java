package SmartQueueBackend.controller;

import SmartQueueBackend.dto.JoinQueueRequest;
import SmartQueueBackend.dto.QueueBoardResponse;
import SmartQueueBackend.dto.TicketStatusResponse;
import SmartQueueBackend.entity.Ticket;
import SmartQueueBackend.service.QueueTicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
public class QueueController {

    private final QueueTicketService queueTicketService;

    public QueueController(QueueTicketService queueTicketService) {
        this.queueTicketService = queueTicketService;
    }

    @PostMapping("/join")
    public ResponseEntity<Ticket> joinQueue(@RequestBody JoinQueueRequest request) {
        return ResponseEntity.ok(queueTicketService.joinQueue(request));
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<TicketStatusResponse> getTicketStatus(@PathVariable Long ticketId) {
        return ResponseEntity.ok(queueTicketService.getTicketStatus(ticketId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getUserTickets(@PathVariable Long userId) {
        return ResponseEntity.ok(queueTicketService.getUserTickets(userId));
    }

    @GetMapping("/board")
    public ResponseEntity<QueueBoardResponse> getQueueBoard() {
        return ResponseEntity.ok(queueTicketService.getQueueBoard());
    }

    @GetMapping("/waiting")
    public ResponseEntity<List<Ticket>> getWaitingTickets(
            @RequestParam(required = false) Long serviceId) {
        return ResponseEntity.ok(queueTicketService.getWaitingTickets(serviceId));
    }
}