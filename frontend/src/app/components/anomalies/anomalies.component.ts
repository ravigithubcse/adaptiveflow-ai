import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { Anomaly, RealTimeUpdate } from '../../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-anomalies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="anomalies-page">
      <header class="page-header">
        <h2>AI Anomaly Detection Center</h2>
        <p>Cognitive anomaly detection with explainable AI reasoning</p>
      </header>

      <div class="anomaly-stats">
        <div class="stat-card critical">
          <span class="stat-count">{{ criticalCount }}</span>
          <span class="stat-label">Critical</span>
        </div>
        <div class="stat-card high">
          <span class="stat-count">{{ highCount }}</span>
          <span class="stat-label">High</span>
        </div>
        <div class="stat-card medium">
          <span class="stat-count">{{ mediumCount }}</span>
          <span class="stat-label">Medium</span>
        </div>
        <div class="stat-card resolved">
          <span class="stat-count">{{ resolvedCount }}</span>
          <span class="stat-label">Resolved Today</span>
        </div>
      </div>

      <div class="anomalies-list">
        <div class="anomaly-card" *ngFor="let anomaly of anomalies" [class]="anomaly.severity.toLowerCase()">
          <div class="anomaly-header">
            <div class="severity-badge" [class]="anomaly.severity.toLowerCase()">{{ anomaly.severity }}</div>
            <span class="anomaly-score">Score: {{ anomaly.anomalyScore | number:'1.2-2' }}</span>
            <span class="anomaly-time">{{ anomaly.detectedAt | date:'short' }}</span>
          </div>
          <div class="anomaly-body">
            <h4>{{ anomaly.processType }} - {{ anomaly.anomalyType }}</h4>
            <p class="description">{{ anomaly.description }}</p>
            <div class="ai-explanation" *ngIf="anomaly.aiExplanation">
              <div class="ai-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
                <span>AI Explanation</span>
              </div>
              <p>{{ anomaly.aiExplanation }}</p>
            </div>
            <div class="suggested-action" *ngIf="anomaly.suggestedAction">
              <div class="action-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span>AI Suggested Action</span>
              </div>
              <p>{{ anomaly.suggestedAction }}</p>
            </div>
            <div class="metrics-row">
              <span>Expected: {{ anomaly.expectedValue | number:'1.0-0' }}ms</span>
              <span>Actual: {{ anomaly.actualValue | number:'1.0-0' }}ms</span>
              <span class="deviation">Deviation: {{ anomaly.deviationPercent | number:'1.1-1' }}%</span>
            </div>
          </div>
          <div class="anomaly-footer" *ngIf="anomaly.status === 'OPEN'">
            <button class="resolve-btn" (click)="resolveAnomaly(anomaly.id)">Resolve</button>
            <button class="investigate-btn">Investigate</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .anomalies-page { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h2 { font-size: 28px; font-weight: 700; color: #f8fafc; margin: 0 0 8px; }
    .page-header p { color: #94a3b8; font-size: 14px; margin: 0; }
    
    .anomaly-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .stat-card.critical { border-color: #ef4444; }
    .stat-card.high { border-color: #f97316; }
    .stat-card.medium { border-color: #eab308; }
    .stat-card.resolved { border-color: #22c55e; }
    .stat-count { font-size: 32px; font-weight: 700; color: #f8fafc; display: block; }
    .stat-label { font-size: 13px; color: #94a3b8; }
    
    .anomalies-list { display: flex; flex-direction: column; gap: 16px; }
    .anomaly-card {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      border-left: 4px solid #334155;
    }
    .anomaly-card.critical { border-left-color: #ef4444; }
    .anomaly-card.high { border-left-color: #f97316; }
    .anomaly-card.medium { border-left-color: #eab308; }
    .anomaly-card.low { border-left-color: #22c55e; }
    
    .anomaly-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .severity-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 4px;
    }
    .severity-badge.critical { background: #ef4444; color: white; }
    .severity-badge.high { background: #f97316; color: white; }
    .severity-badge.medium { background: #eab308; color: black; }
    .severity-badge.low { background: #22c55e; color: white; }
    .anomaly-score { font-size: 13px; color: #94a3b8; font-family: monospace; }
    .anomaly-time { margin-left: auto; font-size: 12px; color: #64748b; }
    
    .anomaly-body h4 { font-size: 16px; color: #e2e8f0; margin: 0 0 8px; }
    .description { font-size: 14px; color: #cbd5e1; margin: 0 0 12px; }
    
    .ai-explanation, .suggested-action {
      background: rgba(0,212,255,0.05);
      border: 1px solid rgba(0,212,255,0.2);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .suggested-action { background: rgba(34,197,94,0.05); border-color: rgba(34,197,94,0.2); }
    .ai-header, .action-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #00d4ff;
    }
    .action-header { color: #22c55e; }
    .ai-explanation p, .suggested-action p {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }
    
    .metrics-row {
      display: flex;
      gap: 24px;
      font-size: 12px;
      color: #64748b;
      font-family: monospace;
    }
    .deviation { color: #ef4444; }
    
    .anomaly-footer {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #334155;
    }
    .resolve-btn, .investigate-btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }
    .resolve-btn {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
    }
    .investigate-btn {
      background: transparent;
      border: 1px solid #334155;
      color: #94a3b8;
    }
  `]
})
export class AnomaliesComponent implements OnInit, OnDestroy {
  anomalies: Anomaly[] = [];
  private wsSub!: Subscription;

  constructor(private api: ApiService, private ws: WebSocketService) {}

  ngOnInit() {
    this.loadAnomalies();
    this.wsSub = this.ws.updates$.subscribe((update: RealTimeUpdate) => {
      if (update.updateType === 'NEW_ANOMALY') {
        this.anomalies.unshift(update.payload);
      }
      if (update.updateType === 'ANOMALY_RESOLVED') {
        const idx = this.anomalies.findIndex(a => a.id === update.payload.id);
        if (idx >= 0) this.anomalies[idx] = update.payload;
      }
    });
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
  }

  loadAnomalies() {
    this.api.getAnomalies().subscribe(data => this.anomalies = data);
  }

  resolveAnomaly(id: string) {
    this.api.resolveAnomaly(id, { resolution: 'Resolved by operator', resolvedBy: 'admin' }).subscribe(() => {
      this.loadAnomalies();
    });
  }

  get criticalCount() { return this.anomalies.filter(a => a.severity === 'CRITICAL').length; }
  get highCount() { return this.anomalies.filter(a => a.severity === 'HIGH').length; }
  get mediumCount() { return this.anomalies.filter(a => a.severity === 'MEDIUM').length; }
  get resolvedCount() { return this.anomalies.filter(a => a.status === 'RESOLVED').length; }
}
