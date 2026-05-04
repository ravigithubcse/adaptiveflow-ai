package com.adaptiveflow.repository;

import com.adaptiveflow.entity.AutonomousAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AutonomousActionRepository extends JpaRepository<AutonomousAction, UUID> {
    List<AutonomousAction> findByStatusOrderByCreatedAtDesc(String status);
    
    @Query("SELECT a FROM AutonomousAction a WHERE a.createdAt >= ?1 ORDER BY a.createdAt DESC")
    List<AutonomousAction> findRecentActions(LocalDateTime since);
    
    @Query("SELECT a.actionType, COUNT(a) FROM AutonomousAction a WHERE a.createdAt >= ?1 GROUP BY a.actionType")
    List<Object[]> countByTypeSince(LocalDateTime since);
}
