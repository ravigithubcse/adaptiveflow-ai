package com.adaptiveflow.service;

import com.adaptiveflow.dto.DashboardSummaryDTO;
import com.adaptiveflow.entity.BusinessEvent;
import com.adaptiveflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BusinessEventRepository eventRepository;
    private final AnomalyRepository anomalyRepository;
    private final PredictionRepository predictionRepository;
    private final AutonomousActionRepository actionRepository;
    private final CopilotConversationRepository copilotRepository;
    private final WebSocketMessagingService messagingService;

    public DashboardSummaryDTO getDashboardSummary() {
        LocalDateTime today = LocalDateTime.now().minusHours(24);
        
        long totalEvents = eventRepository.findRecentEvents(today).size();
        long activeAnomalies = anomalyRepository.findByStatusOrderByDetectedAtDesc("OPEN").size();
        long activePredictions = predictionRepository.findActivePredictions(LocalDateTime.now()).size();
        long pendingActions = actionRepository.findByStatusOrderByCreatedAtDesc("PENDING").size();
        
        List<BusinessEvent> recentEvents = eventRepository.findRecentEvents(today);
        long anomalies24h = anomalyRepository.findRecentAnomalies(today).size();
        double anomalyRate = recentEvents.size() > 0 ? (double) anomalies24h / recentEvents.size() * 100 : 0;
        
        return DashboardSummaryDTO.builder()
                .totalEventsToday(totalEvents)
                .activeAnomalies(activeAnomalies)
                .activePredictions(activePredictions)
                .pendingActions(pendingActions)
                .avgProcessHealth(Math.max(0, 100 - (long)(anomalyRate * 2)))
                .aiInteractionsToday(copilotRepository.count())
                .anomalyRate(anomalyRate)
                .predictionAccuracy(78.5)
                .build();
    }
    
    public void broadcastDashboardUpdate() {
        DashboardSummaryDTO summary = getDashboardSummary();
        messagingService.broadcastUpdate("dashboard", "DASHBOARD_UPDATE", summary);
    }
}
