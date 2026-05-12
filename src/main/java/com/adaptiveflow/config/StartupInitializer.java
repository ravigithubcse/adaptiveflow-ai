package com.adaptiveflow.config;

import com.adaptiveflow.entity.*;
import com.adaptiveflow.repository.*;
import com.adaptiveflow.service.DataSimulationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class StartupInitializer implements ApplicationRunner {

    private final DataSimulationService simulationService;
    private final BusinessEventRepository eventRepository;
    private final AnomalyRepository anomalyRepository;
    private final PredictionRepository predictionRepository;
    private final AutonomousActionRepository actionRepository;

    private final Random random = new Random();
    private final String[] PROCESS_TYPES = {
        "SALES_ORDER", "INVENTORY_UPDATE", "INVOICE_PROCESSING",
        "HR_APPROVAL", "CUSTOMER_SUPPORT", "FINANCIAL_TRANSACTION"
    };

    @Override
    public void run(ApplicationArguments args) {
        log.info("Initializing AdaptiveFlow AI...");
        simulationService.initializePatterns();
        seedSampleData();
        log.info("System ready — seed data loaded.");
    }

    private void seedSampleData() {
        log.info("Seeding sample demo data...");
        LocalDateTime now = LocalDateTime.now();

        // Seed 300 business events spread over past 24 hours
        for (int i = 0; i < 300; i++) {
            String processType = PROCESS_TYPES[random.nextInt(PROCESS_TYPES.length)];
            double base = getBase(processType);
            double factor = random.nextDouble() < 0.08 ? 3.0 + random.nextDouble() * 3 : 1.0;
            long duration = (long)(base * factor * (0.8 + random.nextDouble() * 0.4));

            BusinessEvent event = BusinessEvent.builder()
                .processType(processType)
                .eventType(getEventType(processType))
                .entityId("ENT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .value(random.nextDouble() * 10000)
                .unit("USD")
                .status(random.nextDouble() < 0.9 ? "COMPLETED" : "PENDING")
                .assignedTo("user" + (random.nextInt(20) + 1) + "@company.com")
                .priority(random.nextInt(5) + 1)
                .timestamp(now.minusMinutes(random.nextInt(1440)))
                .durationMs(duration)
                .sourceSystem(getSource(processType))
                .region("US-EAST")
                .department("Operations")
                .metadata("{\"source\":\"seed\"}")
                .build();
            eventRepository.save(event);
        }

        // Seed 5 open anomalies
        String[] severities = {"CRITICAL", "HIGH", "HIGH", "MEDIUM", "MEDIUM"};
        String[] processes = {"HR_APPROVAL", "INVENTORY_UPDATE", "SALES_ORDER", "INVOICE_PROCESSING", "CUSTOMER_SUPPORT"};
        for (int i = 0; i < 5; i++) {
            Anomaly anomaly = Anomaly.builder()
                .id(UUID.randomUUID())
                .processType(processes[i])
                .anomalyType("DURATION_SPIKE")
                .severity(severities[i])
                .anomalyScore(2.5 + random.nextDouble() * 2)
                .expectedValue(getBase(processes[i]))
                .actualValue(getBase(processes[i]) * (3 + random.nextDouble() * 2))
                .deviationPercent(250 + random.nextDouble() * 150)
                .description("Duration deviation detected in " + processes[i] + ": exceeded 3 sigma baseline")
                .aiExplanation("Multi-variate analysis detected statistical deviation. External API latency and resource contention are contributing factors at 45% and 30% respectively.")
                .suggestedAction("1) Scale processing nodes by 40%, 2) Route 30% traffic to secondary pipeline, 3) Alert on-call engineer.")
                .status("OPEN")
                .relatedEntityId("ENT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .correlationGroup("GRP-" + System.currentTimeMillis())
                .detectedAt(now.minusMinutes(random.nextInt(120)))
                .build();
            anomalyRepository.save(anomaly);
        }

        // Seed 4 active predictions
        String[] riskLevels = {"HIGH", "MEDIUM", "HIGH", "LOW"};
        String[] targetMetrics = {"DURATION", "VOLUME", "DURATION", "SUCCESS_RATE"};
        for (int i = 0; i < 4; i++) {
            String proc = PROCESS_TYPES[i];
            Prediction prediction = Prediction.builder()
                .processType(proc)
                .predictionType("FORECAST")
                .targetMetric(targetMetrics[i])
                .predictedValue(getBase(proc) * (1.2 + random.nextDouble() * 0.5))
                .currentValue(getBase(proc))
                .confidenceScore(0.72 + random.nextDouble() * 0.2)
                .riskLevel(riskLevels[i])
                .reasoning("Time-series analysis indicates 78% probability of slowdown within 30 minutes. Pre-scaling resources recommended.")
                .aiReasoning("Predictive model trained on 7-day baseline. Trend: +12% per hour. Action: increase capacity.")
                .predictionTime(now.minusMinutes(random.nextInt(15)))
                .predictedForTime(now.plusMinutes(30))
                .build();
            predictionRepository.save(prediction);
        }

        // Seed 3 pending autonomous actions
        String[] actionTypes = {"AUTO_SCALE", "TRAFFIC_REROUTE", "ALERT_ENGINEER"};
        String[] actionReasonings = {
            "Auto-scale INVOICE_PROCESSING workers by 40% based on predicted volume surge — 85% confidence",
            "Reroute 30% of HR_APPROVAL traffic to secondary processing pipeline — anomaly detected",
            "Escalate SALES_ORDER anomaly to on-call engineer for manual review — critical threshold exceeded"
        };
        for (int i = 0; i < 3; i++) {
            AutonomousAction action = AutonomousAction.builder()
                .actionType(actionTypes[i])
                .targetProcess(PROCESS_TYPES[i])
                .targetEntityId("ENT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .aiReasoning(actionReasonings[i])
                .actionPayload("{\"confidence\": " + (0.78 + random.nextDouble() * 0.15) + "}")
                .status("PENDING")
                .estimatedImpact(35.0 + random.nextDouble() * 30)
                .createdAt(now.minusMinutes(random.nextInt(20)))
                .build();
            actionRepository.save(action);
        }

        log.info("Seeded: 300 events, 5 anomalies, 4 predictions, 3 actions");
    }

    private double getBase(String p) {
        return switch (p) {
            case "SALES_ORDER" -> 2500;
            case "INVENTORY_UPDATE" -> 1200;
            case "INVOICE_PROCESSING" -> 3500;
            case "HR_APPROVAL" -> 8000;
            case "CUSTOMER_SUPPORT" -> 5000;
            case "FINANCIAL_TRANSACTION" -> 1800;
            default -> 2000;
        };
    }

    private String getEventType(String p) {
        return switch (p) {
            case "SALES_ORDER" -> "ORDER_CREATED";
            case "INVENTORY_UPDATE" -> "STOCK_RECEIVED";
            case "INVOICE_PROCESSING" -> "INVOICE_GENERATED";
            case "HR_APPROVAL" -> "LEAVE_REQUESTED";
            case "CUSTOMER_SUPPORT" -> "TICKET_CREATED";
            case "FINANCIAL_TRANSACTION" -> "TRANSFER_INITIATED";
            default -> "EVENT_OCCURRED";
        };
    }

    private String getSource(String p) {
        return switch (p) {
            case "SALES_ORDER" -> "Salesforce";
            case "INVENTORY_UPDATE" -> "SAP_ERP";
            case "INVOICE_PROCESSING" -> "NetSuite";
            case "HR_APPROVAL" -> "Workday";
            case "CUSTOMER_SUPPORT" -> "Zendesk";
            case "FINANCIAL_TRANSACTION" -> "Stripe";
            default -> "Internal";
        };
    }
}
