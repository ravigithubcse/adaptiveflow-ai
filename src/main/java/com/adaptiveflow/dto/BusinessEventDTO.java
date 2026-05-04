package com.adaptiveflow.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessEventDTO {
    private UUID id;
    private String processType;
    private String eventType;
    private String entityId;
    private Double value;
    private String unit;
    private String status;
    private String assignedTo;
    private Integer priority;
    private String metadata;
    private LocalDateTime timestamp;
    private Long durationMs;
    private String sourceSystem;
    private String region;
    private String department;
}
