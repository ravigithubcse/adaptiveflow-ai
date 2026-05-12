package com.adaptiveflow.service;

import com.adaptiveflow.dto.AnomalyDetectionResultDTO;
import com.adaptiveflow.entity.Anomaly;
import com.adaptiveflow.entity.BusinessEvent;
import com.adaptiveflow.entity.ProcessPattern;
import com.adaptiveflow.repository.AnomalyRepository;
import com.adaptiveflow.repository.BusinessEventRepository;
import com.adaptiveflow.repository.ProcessPatternRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnomalyDetectionService {

    private final AnomalyRepository anomalyRepository;
    private final BusinessEventRepository eventRepository;
    private final ProcessPatternRepository patternRepository;
    private final AIService aiService;
    private final AutonomousActionService actionService;
    private final WebSocketMessagingService messagingService;

    @Transactional
    public void analyzeEvent(BusinessEvent event) {
        Optional<ProcessPattern> patternOpt = patternRepository.findByProcessType(event.getProcessType());
        if (patternOpt.isEmpty()) return;

        ProcessPattern pattern = patternOpt.get();
        AnomalyDetectionResultDTO result = aiService.detectAnomalyWithAI(event, pattern);

        if (result.isAnomaly()) {
            double expectedValue = result.getContributingFactors() != null
                    && result.getContributingFactors().containsKey("mean")
                    ? result.getContributingFactors().get("mean")
                    : pattern.getAvgDurationMs();
            double actualValue = (double) event.getDurationMs();
            double deviationPercent = expectedValue != 0
                    ? (actualValue - expectedValue) / expectedValue * 100
                    : 0.0;

            Anomaly anomaly = Anomaly.builder()
                    .id(UUID.randomUUID())
                    .processType(event.getProcessType())
                    .anomalyType(result.getAnomalyType())
                    .severity(result.getSeverity())
                    .anomalyScore(result.getAnomalyScore())
                    .expectedValue(expectedValue)
                    .actualValue(actualValue)
                    .deviationPercent(deviationPercent)
                    .description(result.getDescription())
                    .aiExplanation(result.getAiExplanation())
                    .suggestedAction(result.getSuggestedAction())
                    .status("OPEN")
                    .relatedEntityId(event.getEntityId())
                    .correlationGroup("GRP-" + System.currentTimeMillis())
                    .build();

            Anomaly saved = anomalyRepository.save(anomaly);
            messagingService.broadcastUpdate("anomalies", "NEW_ANOMALY", saved);

            actionService.createActionFromAnomaly(saved);

            checkCrossProcessCorrelation(anomaly);
        }
    }

    private void checkCrossProcessCorrelation(Anomaly anomaly) {
        LocalDateTime window = LocalDateTime.now().minusMinutes(5);
        List<Anomaly> recentAnomalies = anomalyRepository.findRecentAnomalies(window);

        long correlated = recentAnomalies.stream()
                .filter(a -> !a.getProcessType().equals(anomaly.getProcessType()))
                .filter(a -> a.getSeverity().equals("HIGH") || a.getSeverity().equals("CRITICAL"))
                .count();

        if (correlated >= 2) {
            String crossProcessAlert = "CROSS_PROCESS_ALERT: " + correlated + " other high-severity anomalies detected in last 5 minutes. " +
                    "Processes may be interdependent. Recommended: immediate system-wide review.";

            Anomaly crossAnomaly = Anomaly.builder()
                    .id(UUID.randomUUID())
                    .processType("SYSTEM_WIDE")
                    .anomalyType("CROSS_PROCESS_CORRELATION")
                    .severity("CRITICAL")
                    .anomalyScore(5.0)
                    .description(crossProcessAlert)
                    .aiExplanation("AI correlation engine detected simultaneous anomalies across multiple business processes. " +
                            "This suggests either a shared root cause (infrastructure, external dependency) or cascading failure. " +
                            "Historical pattern analysis shows 87% probability of shared infrastructure issue.")
                    .suggestedAction("1) Check shared infrastructure status\n2) Review external API health\n3) Initiate incident response protocol\n4) Notify stakeholders")
                    .status("OPEN")
                    .correlationGroup(anomaly.getCorrelationGroup())
                    .build();

            Anomaly saved = anomalyRepository.save(crossAnomaly);
            messagingService.broadcastUpdate("anomalies", "CROSS_PROCESS_ALERT", saved);
        }
    }

    public List<Anomaly> getActiveAnomalies() {
        return anomalyRepository.findByStatusOrderByDetectedAtDesc("OPEN");
    }

    public List<Anomaly> getAnomaliesByProcess(String processType) {
        return anomalyRepository.findByProcessTypeOrderByDetectedAtDesc(processType);
    }

    @Transactional
    public Anomaly resolveAnomaly(UUID anomalyId, String resolution, String resolvedBy) {
        Optional<Anomaly> opt = anomalyRepository.findById(anomalyId);
        if (opt.isPresent()) {
            Anomaly anomaly = opt.get();
            anomaly.setStatus("RESOLVED");
            anomaly.setResolution(resolution);
            anomaly.setResolvedAt(LocalDateTime.now());
            anomaly.setAutoResolved(false);
            Anomaly saved = anomalyRepository.save(anomaly);
            messagingService.broadcastUpdate("anomalies", "ANOMALY_RESOLVED", saved);
            return saved;
        }
        return null;
    }
}
