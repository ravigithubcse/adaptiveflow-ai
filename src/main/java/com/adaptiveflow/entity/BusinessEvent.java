package com.adaptiveflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "business_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String processType;
    
    @Column(nullable = false)
    private String eventType;
    
    @Column(nullable = false)
    private String entityId;
    
    private Double value;
    private String unit;
    private String status;
    private String assignedTo;
    private Integer priority;
    
    @Column(length = 2000)
    private String metadata;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    private Long durationMs;
    private String sourceSystem;
    private String region;
    private String department;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
