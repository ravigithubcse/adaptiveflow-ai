package com.adaptiveflow.repository;

import com.adaptiveflow.entity.ProcessMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProcessMetricRepository extends JpaRepository<ProcessMetric, UUID> {
    List<ProcessMetric> findByProcessTypeAndMetricNameAndTimestampBetweenOrderByTimestampAsc(
            String processType, String metricName, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT pm FROM ProcessMetric pm WHERE pm.timestamp >= ?1 ORDER BY pm.timestamp DESC")
    List<ProcessMetric> findRecentMetrics(LocalDateTime since);
}
