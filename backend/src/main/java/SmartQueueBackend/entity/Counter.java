package SmartQueueBackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "counters")
public class Counter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private QueueService service;

    private Long staffId;

    private String status;

    @PrePersist
    public void prePersist() {
        if (status == null || status.isBlank()) {
            status = "AVAILABLE";
        }
    }

    public Counter() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public QueueService getService() {
        return service;
    }

    public void setService(QueueService service) {
        this.service = service;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}