
package SmartQueueBackend.controller;

import SmartQueueBackend.entity.QueueService;
import SmartQueueBackend.service.QueueServiceManager;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class QueueServiceController {

    private final QueueServiceManager queueServiceManager;

    @GetMapping
public List<QueueService> getAllServices() {
    return queueServiceManager.getAllServices();
}

    public QueueServiceController(QueueServiceManager queueServiceManager) {
        this.queueServiceManager = queueServiceManager;
    }

    @PostMapping
    public QueueService createService(@RequestBody QueueService service) {
        return queueServiceManager.saveService(service);
    }
}