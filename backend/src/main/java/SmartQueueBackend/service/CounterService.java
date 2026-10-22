package SmartQueueBackend.service;

import SmartQueueBackend.dto.CreateCounterRequest;
import SmartQueueBackend.entity.Counter;
import SmartQueueBackend.entity.QueueService;
import SmartQueueBackend.repository.CounterRepository;
import SmartQueueBackend.repository.QueueServiceRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CounterService {

    private final CounterRepository counterRepository;
    private final QueueServiceRepository queueServiceRepository;

    public CounterService(
            CounterRepository counterRepository,
            QueueServiceRepository queueServiceRepository) {

        this.counterRepository = counterRepository;
        this.queueServiceRepository = queueServiceRepository;
    }

    public List<Counter> getAllCounters() {
        return counterRepository.findAllByOrderByIdAsc();
    }

    public List<Counter> getCountersByService(Long serviceId) {
        return counterRepository.findByService_Id(serviceId);
    }

    public Counter getCounterById(Long id) {
        return counterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Counter not found with id: " + id));
    }

    public Counter updateCounterStatus(Long id, String status) {
        Counter counter = getCounterById(id);
        counter.setStatus(status);
        return counterRepository.save(counter);
    }

    public Counter createCounter(CreateCounterRequest request) {
        QueueService service = null;
        if (request.getServiceId() != null) {
            service = queueServiceRepository
                    .findById(request.getServiceId())
                    .orElse(null);
        }

        Counter counter = new Counter();
        counter.setName(request.getName());
        counter.setService(service);
        counter.setStaffId(request.getStaffId());
        counter.setStatus(
                request.getStatus() == null || request.getStatus().isBlank()
                        ? "AVAILABLE"
                        : request.getStatus()
        );

        return counterRepository.save(counter);
    }
}