package com.adaptiveflow.service;

import com.adaptiveflow.entity.BusinessEvent;
import com.adaptiveflow.entity.ProcessPattern;
import com.adaptiveflow.repository.BusinessEventRepository;
import com.adaptiveflow.repository.ProcessPatternRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataSimulationService {

    private final BusinessEventRepository eventRepository;
    private final ProcessPatternRepository patternRepository;
    private final AnomalyDetectionService anomalyDetectionService;
    private final PredictiveEngineService predictiveEngineService;
    private final DashboardService dashboardService;
    private final WebSocketMessagingService messagingService;

    private final Random random = new Random();
    private final String[] PROCESS_TYPES = {
            "SALES_ORDER", "INVENTORY_UPDATE", "INVOICE_PROCESSING", 
            "HR_APPROVAL", "CUSTOMER_SUPPORT", "FINANCIAL_TRANSACTION"
    };
    private final String[] REGIONS = {"US-EAST", "US-WEST", "EU-CENTRAL", "APAC", "LATAM"};
    private final String[] DEPARTMENTS = {"Sales", "Operations", "Finance", "HR", "IT", "Customer Success"};

    @Scheduled(fixedRateString = "${adaptiveflow.data.simulation.interval-ms:3000}")
    @Transactional
    public void simulateBusinessEvents() {
        try {
            BusinessEvent event = generateRandomEvent();
            BusinessEvent saved = eventRepository.save(event);
            
            messagingService.broadcastUpdate("events", "NEW_EVENT", saved);
            
            anomalyDetectionService.analyzeEvent(saved);
            
            if (random.nextDouble() < 0.15) {
                predictiveEngineService.generateAndBroadcastPredictions(saved.getProcessType());
            }
            
            if (random.nextDouble() < 0.2) {
                dashboardService.broadcastDashboardUpdate();
            }
        } catch (Exception e) {
            log.error("Error in simulation: {}", e.getMessage());
        }
    }

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void updateProcessPatterns() {
        for (String processType : PROCESS_TYPES) {
            updatePatternForProcess(processType);
        }
    }

    private BusinessEvent generateRandomEvent() {
        String processType = PROCESS_TYPES[random.nextInt(PROCESS_TYPES.length)];
        String region = REGIONS[random.nextInt(REGIONS.length)];
        String department = DEPARTMENTS[random.nextInt(DEPARTMENTS.length)];
        
        double baseDuration = getBaseDurationForProcess(processType);
        double anomalyFactor = random.nextDouble() < 0.1 ? 3.0 + random.nextDouble() * 4 : 1.0;
        long durationMs = (long) (baseDuration * anomalyFactor * (0.8 + random.nextDouble() * 0.4));
        
        return BusinessEvent.builder()
                .processType(processType)
                .eventType(getEventTypeForProcess(processType))
                .entityId("ENT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .value(random.nextDouble() * 10000)
                .unit("USD")
                .status(random.nextDouble() < 0.9 ? "COMPLETED" : "PENDING")
                .assignedTo("user" + (random.nextInt(20) + 1) + "@company.com")
                .priority(random.nextInt(5) + 1)
                .metadata("{\"source\":\"\"" + getSourceSystem(processType) + "\"\"" + ",\"region\":\"" + region + "\"" + ",\"department\":\"" + department + "\"" + "}")
                .timestamp(LocalDateTime.now())
                .durationMs(durationMs)
                .sourceSystem(getSourceSystem(processType))
                .region(region)
                .department(department)
                .build();
    }

    private String getEventTypeForProcess(String processType) {
        return switch (processType) {
            case "SALES_ORDER" -> random.nextBoolean() ? "ORDER_CREATED" : "ORDER_FULFILLED";
            case "INVENTORY_UPDATE" -> random.nextBoolean() ? "STOCK_RECEIVED" : "STOCK_DISPatched";
            case "INVOICE_PROCESSING" -> random.nextBoolean() ? "INVOICE_GENERATED" : "PAYMENT_RECEIVED";
            case "HR_APPROVAL" -> random.nextBoolean() ? "LEAVE_REQUESTED" : "EXPENSE_APPROVED";
            case "CUSTOMER_SUPPORT" -> random.nextBoolean() ? "TICKET_CREATED" : "TICKET_RESOLVED";
            case "FINANCIAL_TRANSACTION" -> random.nextBoolean() ? "TRANSFER_INITIATED" : "TRANSFER_COMPLETED";
            default -> "EVENT_OCCURRED";
        };
    }

    private double getBaseDurationForProcess(String processType) {
        return switch (processType) {
            case "SALES_ORDER" -> 2500;
            case "INVENTORY_UPDATE" -> 1200;
            case "INVOICE_PROCESSING" -> 3500;
            case "HR_APPROVAL" -> 8000;
            case "CUSTOMER_SUPPORT" -> 5000;
            case "FINANCIAL_TRANSACTION" -> 1800;
            default -> 2000;
        };
    }

    private String getSourceSystem(String processType) {
        return switch (processType) {
            case "SALES_ORDER" -> "Salesforce";
            case "INVENTORY_UPDATE" -> "SAP_ERP";
            case "INVOICE_PROCESSING" -> "NetSuite";
            case "HR_APPROVAL" -> "Workday";
            case "CUSTOMER_SUPPORT" -> "Zendesk";
            case "FINANCIAL_TRANSACTION" -> "Stripe";
            default -> "Internal";
        };
    }

    private void updatePatternForProcess(String processType) {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<BusinessEvent> events = eventRepository.findByProcessTypeAndTimestampAfter(processType, since);
        
        if (events.size() < 5) return;

        double[] durations = events.stream()
                .mapToDouble(e -> e.getDurationMs() != null ? e.getDurationMs() : 0)
                .toArray();
        
        double mean = Arrays.stream(durations).average().orElse(0);
        double variance = Arrays.stream(durations)
                .map(d -> Math.pow(d - mean, 2))
                .average().orElse(0);
        double stdDev = Math.sqrt(variance);
        double min = Arrays.stream(durations).min().orElse(0);
        double max = Arrays.stream(durations).max().orElse(0);
        
        long completed = events.stream().filter(e -> "COMPLETED".equals(e.getStatus())).count();
        double successRate = (double) completed / events.size();
        
        ProcessPattern pattern = patternRepository.findByProcessType(processType)
                .orElse(ProcessPattern.builder().processType(processType).build());
        
        pattern.setAvgDurationMs(mean);
        pattern.setStdDevDurationMs(stdDev);
        pattern.setMinDurationMs(min);
        pattern.setMaxDurationMs(max);
        pattern.setSampleSize(events.size());
        pattern.setSuccessRate(successRate);
        pattern.setAvgDailyVolume(events.size() / 7);
        pattern.setPeakHour(14);
        pattern.setPeakHourVolumeMultiplier(1.5);
        
        patternRepository.save(pattern);
    }

    public void initializePatterns() {
        for (String processType : PROCESS_TYPES) {
            if (patternRepository.findByProcessType(processType).isEmpty()) {
                ProcessPattern pattern = ProcessPattern.builder()
                        .processType(processType)
                        .avgDurationMs(getBaseDurationForProcess(processType))
                        .stdDevDurationMs(getBaseDurationForProcess(processType) * 0.2)
                        .minDurationMs(getBaseDurationForProcess(processType) * 0.5)
                        .maxDurationMs(getBaseDurationForProcess(processType) * 1.5)
                        .sampleSize(100)
                        .successRate(0.95)
                        .avgDailyVolume(150)
                        .peakHour(14)
                        .peakHourVolumeMultiplier(1.5)
                        .typicalBottleneck("External API latency")
                        .commonFailureReasons("Timeout, Rate limiting, Validation errors")
                        .build();
                patternRepository.save(pattern);
            }
        }
    }
}
