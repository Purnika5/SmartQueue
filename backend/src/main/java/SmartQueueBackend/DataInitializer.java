package SmartQueueBackend;

import SmartQueueBackend.entity.Counter;
import SmartQueueBackend.entity.QueueService;
import SmartQueueBackend.entity.User;
import SmartQueueBackend.repository.CounterRepository;
import SmartQueueBackend.repository.QueueServiceRepository;
import SmartQueueBackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final QueueServiceRepository serviceRepository;
    private final CounterRepository counterRepository;
    private final UserRepository userRepository;

    public DataInitializer(
            QueueServiceRepository serviceRepository,
            CounterRepository counterRepository,
            UserRepository userRepository) {
        this.serviceRepository = serviceRepository;
        this.counterRepository = counterRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // Seed default users if none exist
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@smartqueue.com");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            userRepository.save(admin);

            User staff = new User();
            staff.setName("Counter Officer Sarah");
            staff.setEmail("staff@smartqueue.com");
            staff.setPassword("staff123");
            staff.setRole("STAFF");
            userRepository.save(staff);

            User student = new User();
            student.setName("Alex Johnson");
            student.setEmail("student@smartqueue.com");
            student.setPassword("student123");
            student.setRole("CUSTOMER");
            userRepository.save(student);
        }

        // Seed default services if none exist
        if (serviceRepository.count() == 0) {
            QueueService bonafide = new QueueService();
            bonafide.setName("Bonafide Certificate");
            bonafide.setDescription("Request bonafide certificate, study verification, or conduct letters.");
            bonafide.setAverageServiceTime(5);
            bonafide.setActive(true);
            serviceRepository.save(bonafide);

            QueueService idCard = new QueueService();
            idCard.setName("ID Card Issuance");
            idCard.setDescription("New student/employee ID card issuance, smart card renewals, and reprints.");
            idCard.setAverageServiceTime(8);
            idCard.setActive(true);
            serviceRepository.save(idCard);

            QueueService feePay = new QueueService();
            feePay.setName("Fee Payment & Dues");
            feePay.setDescription("Tuition fee deposits, clearance slips, duplicate receipts, and fine clearance.");
            feePay.setAverageServiceTime(4);
            feePay.setActive(true);
            serviceRepository.save(feePay);

            QueueService inquiry = new QueueService();
            inquiry.setName("Admissions & General Inquiry");
            inquiry.setDescription("Course admissions counseling, document submission, and general queries.");
            inquiry.setAverageServiceTime(10);
            inquiry.setActive(true);
            serviceRepository.save(inquiry);
        }

        // Seed default counters if none exist
        if (counterRepository.count() == 0) {
            var services = serviceRepository.findAll();
            QueueService s1 = services.size() > 0 ? services.get(0) : null;
            QueueService s2 = services.size() > 1 ? services.get(1) : null;
            QueueService s3 = services.size() > 2 ? services.get(2) : null;
            QueueService s4 = services.size() > 3 ? services.get(3) : null;

            Counter c1 = new Counter();
            c1.setName("Counter 01 - Certificates");
            c1.setService(s1);
            c1.setStatus("AVAILABLE");
            counterRepository.save(c1);

            Counter c2 = new Counter();
            c2.setName("Counter 02 - Identification");
            c2.setService(s2);
            c2.setStatus("AVAILABLE");
            counterRepository.save(c2);

            Counter c3 = new Counter();
            c3.setName("Counter 03 - Accounts & Fees");
            c3.setService(s3);
            c3.setStatus("AVAILABLE");
            counterRepository.save(c3);

            Counter c4 = new Counter();
            c4.setName("Counter 04 - Information Desk");
            c4.setService(s4);
            c4.setStatus("AVAILABLE");
            counterRepository.save(c4);
        }
    }
}
