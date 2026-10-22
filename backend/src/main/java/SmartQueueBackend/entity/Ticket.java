package SmartQueueBackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tokenNumber;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private QueueService service;

    @ManyToOne
    @JoinColumn(name = "counter_id")
    private Counter counter;

    private String status;

    private String priority;

    private java.time.LocalDateTime createdAt;

    private java.time.LocalDateTime calledAt;

    private java.time.LocalDateTime completedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = java.time.LocalDateTime.now();
        }
    }

    public Ticket() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public QueueService getService() {
        return service;
    }

    public void setService(QueueService service) {
        this.service = service;
    }

    public Counter getCounter() {
        return counter;
    }

    public void setCounter(Counter counter) {
        this.counter = counter;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public java.time.LocalDateTime getCalledAt() {
        return calledAt;
    }

    public void setCalledAt(java.time.LocalDateTime calledAt) {
        this.calledAt = calledAt;
    }

    public java.time.LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(java.time.LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}