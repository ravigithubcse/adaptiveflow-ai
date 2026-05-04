package com.adaptiveflow.repository;

import com.adaptiveflow.entity.BusinessEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessEventRepository extends JpaRepository<BusinessEvent, UUID> {
    List<BusinessEvent> findByProcessTypeOrderByTimestampDesc(String processType);
    
    List<BusinessEvent> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT e FROM BusinessEvent e WHERE e.timestamp >= ?1 ORDER BY e.timestamp DESC")
    List<BusinessEvent> findRecentEvents(LocalDateTime since);
    
    @Query("SELECT e FROM BusinessEvent e WHERE e.processType = ?1 AND e.timestamp >= ?2 ORDER BY e.timestamp DESC")
    List<BusinessEvent> findByProcessTypeAndTimestampAfter(String processType, LocalDateTime since);
    
    @Query("SELECT e.processType, COUNT(e) FROM BusinessEvent e WHERE e.timestamp >= ?1 GROUP BY e.processType")
    List<Object[]> countByProcessTypeSince(LocalDateTime since);
    
    @Query("SELECT AVG(e.durationMs) FROM BusinessEvent e WHERE e.processType = ?1 AND e.timestamp >= ?2")
    Double findAverageDurationByProcessTypeAndTimeRange(String processType, LocalDateTime since);
}
