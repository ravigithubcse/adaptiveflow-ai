package com.adaptiveflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "autonomous_actions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutonomousAction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String actionType;
    
    @Column(nullable = false)
    private String targetProcess;
    
    @Column(nullable = false)
    private String targetEntityId;
    
    @Column(length = 2000)
    private String aiReasoning;
    
    @Column(length = 2000)
    private String actionPayload;
    
    private String status;
    private String approvalStatus;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String executedBy;
    private LocalDateTime executedAt;
    private String result;
    private Boolean success;
    private Double estimatedImpact;
    private Double actualImpact;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "PENDING";
        }
        if (approvalStatus == null) {
            approvalStatus = "REQUIRED";
        }
    }
}
