package com.adaptiveflow.repository;

import com.adaptiveflow.entity.Anomaly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnomalyRepository extends JpaRepository<Anomaly, UUID> {
    List<Anomaly> findByStatusOrderByDetectedAtDesc(String status);
    
    List<Anomaly> findByProcessTypeOrderByDetectedAtDesc(String processType);
    
    @Query("SELECT a FROM Anomaly a WHERE a.detectedAt >= ?1 ORDER BY a.detectedAt DESC")
    List<Anomaly> findRecentAnomalies(LocalDateTime since);
    
    @Query("SELECT a.severity, COUNT(a) FROM Anomaly a WHERE a.detectedAt >= ?1 GROUP BY a.severity")
    List<Object[]> countBySeveritySince(LocalDateTime since);
    
    @Query("SELECT a.processType, COUNT(a) FROM Anomaly a WHERE a.detectedAt >= ?1 GROUP BY a.processType")
    List<Object[]> countByProcessTypeSince(LocalDateTime since);
}
