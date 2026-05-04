package com.adaptiveflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String processType;
    
    @Column(nullable = false)
    private String predictionType;
    
    @Column(nullable = false)
    private String targetMetric;
    
    private Double predictedValue;
    private Double confidenceScore;
    private Double currentValue;
    
    @Column(nullable = false)
    private LocalDateTime predictionTime;
    
    @Column(nullable = false)
    private LocalDateTime predictedForTime;
    
    @Column(length = 2000)
    private String reasoning;
    
    @Column(length = 2000)
    private String aiReasoning;
    
    private String riskLevel;
    private Boolean occurred;
    private Double actualValue;
    private Double accuracy;
    
    @PrePersist
    protected void onCreate() {
        if (predictionTime == null) {
            predictionTime = LocalDateTime.now();
        }
    }
}
