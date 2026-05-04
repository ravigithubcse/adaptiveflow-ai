package com.adaptiveflow.controller;

import com.adaptiveflow.dto.*;
import com.adaptiveflow.entity.*;
import com.adaptiveflow.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdaptiveFlowController {

    private final DashboardService dashboardService;
    private final AnomalyDetectionService anomalyDetectionService;
    private final PredictiveEngineService predictiveEngineService;
    private final AutonomousActionService actionService;
    private final CopilotService copilotService;
    private final DataSimulationService simulationService;

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<Anomaly>> getActiveAnomalies() {
        return ResponseEntity.ok(anomalyDetectionService.getActiveAnomalies());
    }

    @GetMapping("/anomalies/{processType}")
    public ResponseEntity<List<Anomaly>> getAnomaliesByProcess(@PathVariable String processType) {
        return ResponseEntity.ok(anomalyDetectionService.getAnomaliesByProcess(processType));
    }

    @PostMapping("/anomalies/{id}/resolve")
    public ResponseEntity<Anomaly> resolveAnomaly(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(anomalyDetectionService.resolveAnomaly(id, body.get("resolution"), body.get("resolvedBy")));
    }

    @GetMapping("/predictions")
    public ResponseEntity<List<Prediction>> getActivePredictions() {
        return ResponseEntity.ok(predictiveEngineService.getActivePredictions());
    }

    @GetMapping("/predictions/{processType}")
    public ResponseEntity<List<Prediction>> getPredictionsByProcess(@PathVariable String processType) {
        return ResponseEntity.ok(predictiveEngineService.getPredictionsByProcess(processType));
    }

    @GetMapping("/actions/pending")
    public ResponseEntity<List<AutonomousAction>> getPendingActions() {
        return ResponseEntity.ok(actionService.getPendingActions());
    }

    @GetMapping("/actions")
    public ResponseEntity<List<AutonomousAction>> getAllActions() {
        return ResponseEntity.ok(actionService.getAllRecentActions());
    }

    @PostMapping("/actions/{id}/approve")
    public ResponseEntity<AutonomousAction> approveAction(@PathVariable UUID id, @RequestBody ActionApprovalDTO approval) {
        return ResponseEntity.ok(actionService.approveAction(id, approval));
    }

    @PostMapping("/copilot/chat")
    public ResponseEntity<CopilotResponseDTO> copilotChat(@RequestBody CopilotRequestDTO request) {
        return ResponseEntity.ok(copilotService.processMessage(request));
    }

    @GetMapping("/copilot/history/{sessionId}")
    public ResponseEntity<List<CopilotConversation>> getCopilotHistory(@PathVariable String sessionId) {
        return ResponseEntity.ok(copilotService.getConversationHistory(sessionId));
    }

    @PostMapping("/simulation/init")
    public ResponseEntity<Map<String, String>> initSimulation() {
        simulationService.initializePatterns();
        return ResponseEntity.ok(Map.of("status", "initialized"));
    }
}
