package com.adaptiveflow.repository;

import com.adaptiveflow.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, UUID> {
    List<Prediction> findByProcessTypeOrderByPredictedForTimeDesc(String processType);
    
    @Query("SELECT p FROM Prediction p WHERE p.predictedForTime >= ?1 ORDER BY p.confidenceScore DESC")
    List<Prediction> findActivePredictions(LocalDateTime now);
    
    @Query("SELECT p.predictionType, COUNT(p) FROM Prediction p WHERE p.predictionTime >= ?1 GROUP BY p.predictionType")
    List<Object[]> countByTypeSince(LocalDateTime since);
}
