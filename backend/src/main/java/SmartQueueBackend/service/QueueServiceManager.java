 package SmartQueueBackend.service;

import SmartQueueBackend.entity.QueueService;
import SmartQueueBackend.repository.QueueServiceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QueueServiceManager {

    private final QueueServiceRepository queueServiceRepository;

    public QueueServiceManager(QueueServiceRepository queueServiceRepository) {
        this.queueServiceRepository = queueServiceRepository;
    }

    public QueueService saveService(QueueService service) {
        return queueServiceRepository.save(service);
    }

    public List<QueueService> getAllServices() {
        return queueServiceRepository.findAll();
    }
}