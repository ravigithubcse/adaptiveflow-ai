package com.adaptiveflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "process_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String processType;
    
    @Column(nullable = false)
    private String metricName;
    
    @Column(nullable = false)
    private Double value;
    
    private String unit;
    private String dimension;
    private String dimensionValue;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
