package SmartQueueBackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "queue_services")
public class QueueService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private Integer averageServiceTime;

    private Boolean active;

    @PrePersist
    public void prePersist() {
        if (active == null) {
            active = true;
        }
        if (averageServiceTime == null || averageServiceTime <= 0) {
            averageServiceTime = 5;
        }
    }

    public QueueService() {
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getAverageServiceTime() {
        return averageServiceTime;
    }

    public void setAverageServiceTime(Integer averageServiceTime) {
        this.averageServiceTime = averageServiceTime;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}