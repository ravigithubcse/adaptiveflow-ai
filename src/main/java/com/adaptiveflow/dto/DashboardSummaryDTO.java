package com.adaptiveflow.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    private long totalEventsToday;
    private long activeAnomalies;
    private long activePredictions;
    private long pendingActions;
    private long avgProcessHealth;
    private long aiInteractionsToday;
    private double anomalyRate;
    private double predictionAccuracy;
}
