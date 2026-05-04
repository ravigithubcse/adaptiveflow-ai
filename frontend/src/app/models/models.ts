export interface DashboardSummary {
  totalEventsToday: number;
  activeAnomalies: number;
  activePredictions: number;
  pendingActions: number;
  avgProcessHealth: number;
  aiInteractionsToday: number;
  anomalyRate: number;
  predictionAccuracy: number;
}

export interface BusinessEvent {
  id: string;
  processType: string;
  eventType: string;
  entityId: string;
  value: number;
  unit: string;
  status: string;
  assignedTo: string;
  priority: number;
  metadata: string;
  timestamp: string;
  durationMs: number;
  sourceSystem: string;
  region: string;
  department: string;
}

export interface Anomaly {
  id: string;
  processType: string;
  anomalyType: string;
  severity: string;
  anomalyScore: number;
  expectedValue: number;
  actualValue: number;
  deviationPercent: number;
  description: string;
  aiExplanation: string;
  suggestedAction: string;
  status: string;
  detectedAt: string;
  relatedEntityId: string;
}

export interface Prediction {
  id: string;
  processType: string;
  predictionType: string;
  targetMetric: string;
  predictedValue: number;
  confidenceScore: number;
  currentValue: number;
  reasoning: string;
  riskLevel: string;
  predictedForTime: string;
}

export interface AutonomousAction {
  id: string;
  actionType: string;
  targetProcess: string;
  targetEntityId: string;
  aiReasoning: string;
  status: string;
  approvalStatus: string;
  approvedBy: string;
  executedBy: string;
  executedAt: string;
  result: string;
  success: boolean;
  estimatedImpact: number;
  createdAt: string;
}

export interface CopilotMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface RealTimeUpdate {
  updateType: string;
  payload: any;
  timestamp: number;
  metadata: Record<string, any>;
}
