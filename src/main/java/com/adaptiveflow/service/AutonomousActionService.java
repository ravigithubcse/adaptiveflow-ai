package com.adaptiveflow.service;

import com.adaptiveflow.dto.ActionApprovalDTO;
import com.adaptiveflow.entity.Anomaly;
import com.adaptiveflow.entity.AutonomousAction;
import com.adaptiveflow.repository.AutonomousActionRepository;
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
public class AutonomousActionService {

    private final AutonomousActionRepository actionRepository;
    private final WebSocketMessagingService messagingService;

    @Transactional
    public void createActionFromAnomaly(Anomaly anomaly) {
        String actionType = determineActionType(anomaly);
        
        AutonomousAction action = AutonomousAction.builder()
                .id(UUID.randomUUID())
                .actionType(actionType)
                .targetProcess(anomaly.getProcessType())
                .targetEntityId(anomaly.getRelatedEntityId())
                .aiReasoning("Auto-generated from anomaly: " + anomaly.getDescription() + 
                        ". AI Explanation: " + anomaly.getAiExplanation())
                .actionPayload(buildActionPayload(anomaly, actionType))
                .status("PENDING")
                .approvalStatus(anomaly.getSeverity().equals("CRITICAL") ? "AUTO_APPROVED" : "REQUIRED")
                .estimatedImpact(calculateEstimatedImpact(anomaly))
                .build();
        
        if ("AUTO_APPROVED".equals(action.getApprovalStatus())) {
            action.setStatus("EXECUTED");
            action.setExecutedAt(LocalDateTime.now());
            action.setExecutedBy("AI_AUTO");
            action.setSuccess(true);
            action.setResult("Auto-executed due to CRITICAL severity");
        }
        
        AutonomousAction saved = actionRepository.save(action);
        messagingService.broadcastUpdate("actions", "NEW_ACTION", saved);
    }
    
    @Transactional
    public AutonomousAction approveAction(UUID actionId, ActionApprovalDTO approval) {
        AutonomousAction action = actionRepository.findById(actionId).orElse(null);
        if (action == null) return null;
        
        action.setApprovalStatus(approval.isApproved() ? "APPROVED" : "REJECTED");
        action.setApprovedBy(approval.getApprovedBy());
        action.setApprovedAt(LocalDateTime.now());
        
        if (approval.isApproved()) {
            action.setStatus("EXECUTED");
            action.setExecutedAt(LocalDateTime.now());
            action.setExecutedBy(approval.getApprovedBy());
            action.setSuccess(true);
            action.setResult("Manually approved and executed by " + approval.getApprovedBy());
            action.setActualImpact(action.getEstimatedImpact());
        } else {
            action.setStatus("CANCELLED");
            action.setResult("Rejected: " + approval.getReason());
        }
        
        AutonomousAction saved = actionRepository.save(action);
        messagingService.broadcastUpdate("actions", "ACTION_UPDATED", saved);
        return saved;
    }
    
    public List<AutonomousAction> getPendingActions() {
        return actionRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }
    
    public List<AutonomousAction> getAllRecentActions() {
        return actionRepository.findRecentActions(LocalDateTime.now().minusDays(1));
    }
    
    private String determineActionType(Anomaly anomaly) {
        return switch (anomaly.getAnomalyType()) {
            case "DURATION_SPIKE" -> "SCALE_RESOURCES";
            case "DURATION_DROP" -> "INVESTIGATE_EFFICIENCY";
            default -> "ALERT_TEAM";
        };
    }
    
    private String buildActionPayload(Anomaly anomaly, String actionType) {
        return switch (actionType) {
            case "SCALE_RESOURCES" -> "{\"action\":\"scale\",\"factor\":1.4,\"target\":\"\"" + anomaly.getProcessType() + "\"" + "}";
            case "INVESTIGATE_EFFICIENCY" -> "{\"action\":\"investigate\",\"entityId\":\"\"" + anomaly.getRelatedEntityId() + "\"" + "}";
            default -> "{\"action\":\"alert\",\"severity\":\"\"" + anomaly.getSeverity() + "\"" + "}";
        };
    }
    
    private Double calculateEstimatedImpact(Anomaly anomaly) {
        double baseImpact = anomaly.getAnomalyScore() * 10;
        return switch (anomaly.getSeverity()) {
            case "CRITICAL" -> baseImpact * 3;
            case "HIGH" -> baseImpact * 2;
            case "MEDIUM" -> baseImpact;
            default -> baseImpact * 0.5;
        };
    }
}
