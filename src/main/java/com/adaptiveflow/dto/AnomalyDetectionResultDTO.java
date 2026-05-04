package com.adaptiveflow.dto;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnomalyDetectionResultDTO {
    private boolean isAnomaly;
    private double anomalyScore;
    private String anomalyType;
    private String severity;
    private String description;
    private String aiExplanation;
    private String suggestedAction;
    private Map<String, Double> contributingFactors;
}
