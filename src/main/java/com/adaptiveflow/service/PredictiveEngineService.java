package com.adaptiveflow.service;

import com.adaptiveflow.dto.PredictionResultDTO;
import com.adaptiveflow.entity.Prediction;
import com.adaptiveflow.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PredictiveEngineService {

    private final PredictionRepository predictionRepository;
    private final AIService aiService;
    private final WebSocketMessagingService messagingService;

    @Transactional
    public void generateAndBroadcastPredictions(String processType) {
        String[] metrics = {"DURATION", "VOLUME", "SUCCESS_RATE", "VALUE"};
        
        for (String metric : metrics) {
            try {
                PredictionResultDTO result = aiService.generatePrediction(processType, metric);
                if (result != null && result.getConfidenceScore() > 0.5) {
                    Prediction prediction = Prediction.builder()
                            .id(UUID.randomUUID())
                            .processType(processType)
                            .predictionType(result.getPredictionType())
                            .targetMetric(metric)
                            .predictedValue(result.getPredictedValue())
                            .confidenceScore(result.getConfidenceScore())
                            .currentValue(result.getCurrentValue())
                            .reasoning(result.getReasoning())
                            .aiReasoning(result.getReasoning())
                            .riskLevel(result.getRiskLevel())
                            .predictionTime(LocalDateTime.now())
                            .predictedForTime(LocalDateTime.now().plusMinutes(result.getMinutesAhead()))
                            .occurred(false)
                            .build();
                    
                    Prediction saved = predictionRepository.save(prediction);
                    messagingService.broadcastUpdate("predictions", "NEW_PREDICTION", saved);
                }
            } catch (Exception e) {
                log.error("Error generating prediction for {} - {}: {}", processType, metric, e.getMessage());
            }
        }
    }
    
    public List<Prediction> getActivePredictions() {
        return predictionRepository.findActivePredictions(LocalDateTime.now());
    }
    
    public List<Prediction> getPredictionsByProcess(String processType) {
        return predictionRepository.findByProcessTypeOrderByPredictedForTimeDesc(processType);
    }
}
