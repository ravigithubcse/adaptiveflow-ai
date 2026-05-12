import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardSummary, BusinessEvent, Anomaly, Prediction,
  AutonomousAction, CopilotMessage
} from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
  }

  getAnomalies(): Observable<Anomaly[]> {
    return this.http.get<Anomaly[]>(`${this.baseUrl}/anomalies`);
  }

  getPredictions(): Observable<Prediction[]> {
    return this.http.get<Prediction[]>(`${this.baseUrl}/predictions`);
  }

  getPendingActions(): Observable<AutonomousAction[]> {
    return this.http.get<AutonomousAction[]>(`${this.baseUrl}/actions/pending`);
  }

  getAllActions(): Observable<AutonomousAction[]> {
    return this.http.get<AutonomousAction[]>(`${this.baseUrl}/actions`);
  }

  approveAction(actionId: string, approved: boolean, approvedBy: string, reason?: string) {
    return this.http.post<AutonomousAction>(`${this.baseUrl}/actions/${actionId}/approve`, {
      actionId, approved, approvedBy, reason
    });
  }

  sendCopilotMessage(sessionId: string, message: string, contextProcessTypes?: string[]) {
    return this.http.post<any>(`${this.baseUrl}/copilot/chat`, {
      sessionId, message, contextProcessTypes
    });
  }

  getCopilotHistory(sessionId: string): Observable<CopilotMessage[]> {
    return this.http.get<CopilotMessage[]>(`${this.baseUrl}/copilot/history/${sessionId}`);
  }

  initSimulation() {
    return this.http.post(`${this.baseUrl}/simulation/init`, {});
  }
}

  resolveAnomaly(id: string, body: { resolution: string, resolvedBy: string }) {
    return this.http.post(`${this.baseUrl}/anomalies/${id}/resolve`, body);
  }
