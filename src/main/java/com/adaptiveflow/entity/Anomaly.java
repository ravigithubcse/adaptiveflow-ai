package com.adaptiveflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "anomalies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Anomaly {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String processType;
    
    @Column(nullable = false)
    private String anomalyType;
    
    @Column(nullable = false)
    private String severity;
    
    private Double anomalyScore;
    private Double expectedValue;
    private Double actualValue;
    private Double deviationPercent;
    
    @Column(length = 2000)
    private String description;
    
    @Column(length = 2000)
    private String aiExplanation;
    
    @Column(length = 2000)
    private String suggestedAction;
    
    private String status;
    private String assignedTo;
    private Boolean autoResolved;
    private String resolution;
    
    @Column(nullable = false)
    private LocalDateTime detectedAt;
    
    private LocalDateTime resolvedAt;
    private String relatedEntityId;
    private String correlationGroup;
    
    @PrePersist
    protected void onCreate() {
        if (detectedAt == null) {
            detectedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "OPEN";
        }
    }
}
