package com.adaptiveflow.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionResultDTO {
    private String predictionType;
    private double predictedValue;
    private double confidenceScore;
    private double currentValue;
    private String reasoning;
    private String riskLevel;
    private int minutesAhead;
}
