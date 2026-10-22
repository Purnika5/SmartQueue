package SmartQueueBackend.repository;

import SmartQueueBackend.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    long countByService_Id(Long serviceId);

    long countByStatus(String status);

    long countByService_IdAndStatus(Long serviceId, String status);

    long countByService_IdAndStatusAndIdLessThan(Long serviceId, String status, Long ticketId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT t FROM Ticket t
        WHERE t.service.id = :serviceId
        AND t.status = 'WAITING'
        ORDER BY 
            CASE t.priority 
                WHEN 'URGENT' THEN 1 
                WHEN 'HIGH' THEN 2 
                ELSE 3 
            END ASC,
            t.id ASC
    """)
    Optional<Ticket> findNextWaitingTicket(
            @Param("serviceId") Long serviceId
    );

    java.util.List<Ticket> findByService_IdAndStatusOrderByIdAsc(Long serviceId, String status);

    java.util.List<Ticket> findByUser_IdOrderByIdDesc(Long userId);

    java.util.List<Ticket> findTop10ByStatusOrderByCalledAtDesc(String status);

    java.util.List<Ticket> findTop15ByStatusOrderByIdAsc(String status);

    java.util.List<Ticket> findTop10ByStatusOrderByCompletedAtDesc(String status);

    Optional<Ticket> findTopByCounter_IdAndStatusOrderByIdDesc(Long counterId, String status);
}