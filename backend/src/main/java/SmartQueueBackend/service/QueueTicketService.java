package SmartQueueBackend.service;

import SmartQueueBackend.dto.JoinQueueRequest;
import SmartQueueBackend.dto.QueueBoardResponse;
import SmartQueueBackend.dto.TicketStatusResponse;
import SmartQueueBackend.entity.Counter;
import SmartQueueBackend.entity.QueueService;
import SmartQueueBackend.entity.Ticket;
import SmartQueueBackend.entity.User;
import SmartQueueBackend.repository.CounterRepository;
import SmartQueueBackend.repository.QueueServiceRepository;
import SmartQueueBackend.repository.TicketRepository;
import SmartQueueBackend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class QueueTicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final QueueServiceRepository queueServiceRepository;
    private final CounterRepository counterRepository;

    public QueueTicketService(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            QueueServiceRepository queueServiceRepository,
            CounterRepository counterRepository) {

        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.queueServiceRepository = queueServiceRepository;
        this.counterRepository = counterRepository;
    }

    // User joins a queue
    @Transactional
    public Ticket joinQueue(JoinQueueRequest request) {
        User user;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));
        } else if (request.getUserEmail() != null && !request.getUserEmail().isBlank()) {
            user = userRepository.findByEmail(request.getUserEmail()).orElseGet(() -> {
                User u = new User();
                u.setName(request.getUserName() != null && !request.getUserName().isBlank() ? request.getUserName() : "Visitor");
                u.setEmail(request.getUserEmail());
                u.setPassword("pass123");
                u.setRole("CUSTOMER");
                return userRepository.save(u);
            });
        } else {
            user = userRepository.findByEmail("guest@smartqueue.com").orElseGet(() -> {
                User guest = new User();
                guest.setName("Guest Visitor");
                guest.setEmail("guest@smartqueue.com");
                guest.setPassword("guest123");
                guest.setRole("CUSTOMER");
                return userRepository.save(guest);
            });
        }

        QueueService service = queueServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + request.getServiceId()));

        long existingTickets = ticketRepository.countByService_Id(service.getId());

        String prefix = service.getName().substring(0, 1).toUpperCase();
        String token = prefix + String.format("%03d", existingTickets + 1);

        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setService(service);
        ticket.setTokenNumber(token);
        ticket.setStatus("WAITING");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setPriority(
                request.getPriority() == null || request.getPriority().isBlank()
                        ? "NORMAL"
                        : request.getPriority().toUpperCase()
        );

        return ticketRepository.save(ticket);
    }

    // Staff calls the next customer
    @Transactional
    public Ticket callNext(Long serviceId, Long counterId) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new RuntimeException("Counter not found with id: " + counterId));

        Ticket ticket = ticketRepository
                .findNextWaitingTicket(serviceId)
                .orElseThrow(() -> new RuntimeException("No waiting tickets for service"));

        ticket.setCounter(counter);
        ticket.setStatus("CALLED");
        ticket.setCalledAt(LocalDateTime.now());

        counter.setStatus("BUSY");
        counterRepository.save(counter);

        return ticketRepository.save(ticket);
    }

    // Staff marks ticket completed
    @Transactional
    public Ticket completeTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        ticket.setStatus("COMPLETED");
        ticket.setCompletedAt(LocalDateTime.now());

        if (ticket.getCounter() != null) {
            Counter counter = ticket.getCounter();
            counter.setStatus("AVAILABLE");
            counterRepository.save(counter);
        }

        return ticketRepository.save(ticket);
    }

    // Staff skips ticket
    @Transactional
    public Ticket skipTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        ticket.setStatus("SKIPPED");
        ticket.setCompletedAt(LocalDateTime.now());

        if (ticket.getCounter() != null) {
            Counter counter = ticket.getCounter();
            counter.setStatus("AVAILABLE");
            counterRepository.save(counter);
        }

        return ticketRepository.save(ticket);
    }

    // Staff recalls ticket (announces again)
    @Transactional
    public Ticket recallTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        ticket.setCalledAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    // Get live status of a single ticket with AI/rule-based wait time estimation
    public TicketStatusResponse getTicketStatus(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        if (!"WAITING".equalsIgnoreCase(ticket.getStatus())) {
            return new TicketStatusResponse(ticket, 0, 0);
        }

        long positionAhead = ticketRepository.countByService_IdAndStatusAndIdLessThan(
                ticket.getService().getId(), "WAITING", ticket.getId());

        int avgServiceTime = (ticket.getService().getAverageServiceTime() != null && ticket.getService().getAverageServiceTime() > 0)
                ? ticket.getService().getAverageServiceTime()
                : 5;

        List<Counter> counters = counterRepository.findByService_Id(ticket.getService().getId());
        long activeCounters = counters.stream()
                .filter(c -> !"OFFLINE".equalsIgnoreCase(c.getStatus()))
                .count();

        if (activeCounters <= 0) {
            activeCounters = 1;
        }

        // Waiting time prediction calculation:
        // Position ahead * average service time divided by active counters handling the service
        int estimatedWaitMinutes = (int) Math.ceil((double) (positionAhead + 1) * avgServiceTime / activeCounters);

        // Adjust slightly if ticket has priority
        if ("URGENT".equalsIgnoreCase(ticket.getPriority())) {
            estimatedWaitMinutes = Math.max(1, (int) (estimatedWaitMinutes * 0.4));
        } else if ("HIGH".equalsIgnoreCase(ticket.getPriority())) {
            estimatedWaitMinutes = Math.max(2, (int) (estimatedWaitMinutes * 0.7));
        }

        return new TicketStatusResponse(ticket, positionAhead, estimatedWaitMinutes);
    }

    // Get tickets for a specific user
    public List<Ticket> getUserTickets(Long userId) {
        return ticketRepository.findByUser_IdOrderByIdDesc(userId);
    }

    // Get waiting tickets for staff queue terminal
    public List<Ticket> getWaitingTickets(Long serviceId) {
        if (serviceId != null) {
            return ticketRepository.findByService_IdAndStatusOrderByIdAsc(serviceId, "WAITING");
        }
        return ticketRepository.findTop15ByStatusOrderByIdAsc("WAITING");
    }

    // Get live public display board data
    public QueueBoardResponse getQueueBoard() {
        QueueBoardResponse board = new QueueBoardResponse();

        List<QueueBoardResponse.NowServingItem> nowServingList = new ArrayList<>();
        List<Counter> allCounters = counterRepository.findAllByOrderByIdAsc();

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

        for (Counter counter : allCounters) {
            Optional<Ticket> currentTicket = ticketRepository
                    .findTopByCounter_IdAndStatusOrderByIdDesc(counter.getId(), "CALLED");

            if (currentTicket.isPresent()) {
                Ticket t = currentTicket.get();
                String calledTime = t.getCalledAt() != null ? t.getCalledAt().format(timeFormatter) : "";
                nowServingList.add(new QueueBoardResponse.NowServingItem(
                        counter.getId(),
                        counter.getName(),
                        t.getTokenNumber(),
                        t.getService() != null ? t.getService().getName() : "General",
                        calledTime
                ));
            }
        }

        // If no active counter tickets found, fall back to recent CALLED tickets
        if (nowServingList.isEmpty()) {
            List<Ticket> recentCalled = ticketRepository.findTop10ByStatusOrderByCalledAtDesc("CALLED");
            for (Ticket t : recentCalled) {
                String calledTime = t.getCalledAt() != null ? t.getCalledAt().format(timeFormatter) : "";
                nowServingList.add(new QueueBoardResponse.NowServingItem(
                        t.getCounter() != null ? t.getCounter().getId() : 0L,
                        t.getCounter() != null ? t.getCounter().getName() : "Counter",
                        t.getTokenNumber(),
                        t.getService() != null ? t.getService().getName() : "General",
                        calledTime
                ));
            }
        }

        board.setNowServing(nowServingList);
        board.setWaitingTickets(ticketRepository.findTop15ByStatusOrderByIdAsc("WAITING"));
        board.setTotalWaiting(ticketRepository.countByStatus("WAITING"));
        board.setTotalServedToday(ticketRepository.countByStatus("COMPLETED"));

        long activeCount = allCounters.stream()
                .filter(c -> !"OFFLINE".equalsIgnoreCase(c.getStatus()))
                .count();
        board.setActiveCountersCount((int) activeCount);

        return board;
    }
}