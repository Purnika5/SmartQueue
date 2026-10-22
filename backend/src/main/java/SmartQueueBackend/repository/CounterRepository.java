package SmartQueueBackend.repository;

import SmartQueueBackend.entity.Counter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CounterRepository extends JpaRepository<Counter, Long> {
    List<Counter> findByService_Id(Long serviceId);
    List<Counter> findAllByOrderByIdAsc();
}