package SmartQueueBackend.repository;

import SmartQueueBackend.entity.QueueService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QueueServiceRepository extends JpaRepository<QueueService, Long> {
}