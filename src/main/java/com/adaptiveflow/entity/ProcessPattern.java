package com.adaptiveflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "process_patterns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessPattern {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true)
    private String processType;
    
    private Double avgDurationMs;
    private Double stdDevDurationMs;
    private Double minDurationMs;
    private Double maxDurationMs;
    
    private Integer avgDailyVolume;
    private Integer peakHour;
    private Double peakHourVolumeMultiplier;
    
    private String typicalBottleneck;
    private Double successRate;
    private String commonFailureReasons;
    
    @Column(length = 4000)
    private String learnedRules;
    
    private Integer sampleSize;
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastUpdated = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
