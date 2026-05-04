import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { DashboardSummary, RealTimeUpdate } from '../../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <h2>Real-Time Operations Center</h2>
        <p>AI-powered cognitive intelligence monitoring {{ summary?.totalEventsToday || 0 }} events with {{ summary?.activeAnomalies || 0 }} active insights</p>
      </header>

      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let kpi of kpis">
          <div class="kpi-icon" [innerHTML]="kpi.icon"></div>
          <div class="kpi-content">
            <span class="kpi-value">{{ kpi.value }}</span>
            <span class="kpi-label">{{ kpi.label }}</span>
            <span class="kpi-trend" [class.up]="kpi.trend > 0" [class.down]="kpi.trend < 0">
              {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}%
            </span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="panel live-events">
          <div class="panel-header">
            <h3>Live Event Stream</h3>
            <span class="live-badge">LIVE</span>
          </div>
          <div class="events-list">
            <div class="event-item" *ngFor="let event of recentEvents">
              <div class="event-dot" [style.background]="getProcessColor(event.processType)"></div>
              <div class="event-info">
                <span class="event-type">{{ event.eventType }}</span>
                <span class="event-process">{{ event.processType }}</span>
              </div>
              <div class="event-meta">
                <span class="event-duration">{{ event.durationMs }}ms</span>
                <span class="event-status" [class]="event.status.toLowerCase()">{{ event.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel process-health">
          <div class="panel-header">
            <h3>Process Health Monitor</h3>
          </div>
          <div class="health-list">
            <div class="health-item" *ngFor="let process of processHealth">
              <div class="health-header">
                <span class="process-name">{{ process.name }}</span>
                <span class="health-score" [class]="getHealthClass(process.score)">{{ process.score }}%</span>
              </div>
              <div class="health-bar-container">
                <div class="health-bar-bg">
                  <div class="health-bar-fill" [style.width.%]="process.score" [class]="getHealthClass(process.score)"></div>
                </div>
              </div>
              <div class="health-metrics">
                <span>Events: {{ process.events }}</span>
                <span>Avg: {{ process.avgDuration }}ms</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel ai-insights">
          <div class="panel-header">
            <h3>AI-Generated Insights</h3>
          </div>
          <div class="insights-list">
            <div class="insight-card" *ngFor="let insight of aiInsights">
              <div class="insight-type" [class]="insight.type">{{ insight.type }}</div>
              <p class="insight-text">{{ insight.text }}</p>
              <div class="insight-meta">
                <span class="confidence">{{ insight.confidence }}% confidence</span>
                <span class="time">{{ insight.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel cross-process">
          <div class="panel-header">
            <h3>Cross-Process Correlation</h3>
          </div>
          <div class="correlation-visual">
            <div class="corr-node" *ngFor="let node of correlationNodes" [style.left.%]="node.x" [style.top.%]="node.y">
              <div class="node-circle" [style.border-color]="node.color">{{ node.label }}</div>
            </div>
            <svg class="corr-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line *ngFor="let line of correlationLines" 
                    [attr.x1]="line.x1" [attr.y1]="line.y1" 
                    [attr.x2]="line.x2" [attr.y2]="line.y2"
                    [attr.stroke]="line.color" stroke-width="0.5" opacity="0.6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h2 { font-size: 28px; font-weight: 700; color: #f8fafc; margin: 0 0 8px; }
    .page-header p { color: #94a3b8; font-size: 14px; margin: 0; }
    
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.2s, border-color 0.2s;
    }
    .kpi-card:hover {
      border-color: #00d4ff;
      transform: translateY(-2px);
    }
    .kpi-icon { width: 48px; height: 48px; }
    .kpi-content { display: flex; flex-direction: column; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #f8fafc; }
    .kpi-label { font-size: 13px; color: #94a3b8; }
    .kpi-trend { font-size: 12px; font-weight: 600; }
    .kpi-trend.up { color: #22c55e; }
    .kpi-trend.down { color: #ef4444; }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .panel {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .panel-header h3 { font-size: 16px; font-weight: 600; color: #e2e8f0; margin: 0; }
    .live-badge {
      background: #22c55e;
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      animation: pulse 2s infinite;
    }
    
    .events-list { max-height: 300px; overflow-y: auto; }
    .event-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #334155;
    }
    .event-dot { width: 8px; height: 8px; border-radius: 50%; }
    .event-info { flex: 1; display: flex; flex-direction: column; }
    .event-type { font-size: 13px; font-weight: 500; color: #e2e8f0; }
    .event-process { font-size: 11px; color: #64748b; }
    .event-meta { display: flex; gap: 8px; align-items: center; }
    .event-duration { font-size: 12px; color: #94a3b8; font-family: monospace; }
    .event-status {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .event-status.completed { background: rgba(34,197,94,0.2); color: #22c55e; }
    .event-status.pending { background: rgba(234,179,8,0.2); color: #eab308; }
    
    .health-item { margin-bottom: 16px; }
    .health-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .process-name { font-size: 13px; color: #e2e8f0; }
    .health-score { font-size: 13px; font-weight: 600; }
    .health-bar-bg {
      height: 6px;
      background: #334155;
      border-radius: 3px;
      overflow: hidden;
    }
    .health-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.5s ease;
    }
    .health-score.good, .health-bar-fill.good { color: #22c55e; background: #22c55e; }
    .health-score.warning, .health-bar-fill.warning { color: #eab308; background: #eab308; }
    .health-score.critical, .health-bar-fill.critical { color: #ef4444; background: #ef4444; }
    .health-metrics {
      display: flex;
      gap: 12px;
      margin-top: 4px;
      font-size: 11px;
      color: #64748b;
    }
    
    .insights-list { max-height: 300px; overflow-y: auto; }
    .insight-card {
      background: rgba(255,255,255,0.03);
      border-left: 3px solid #00d4ff;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .insight-type {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .insight-type.anomaly { color: #ef4444; }
    .insight-type.prediction { color: #eab308; }
    .insight-type.recommendation { color: #22c55e; }
    .insight-text { font-size: 13px; color: #cbd5e1; margin: 0 0 8px; line-height: 1.5; }
    .insight-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
    }
    
    .correlation-visual {
      position: relative;
      height: 200px;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
    }
    .corr-node {
      position: absolute;
      transform: translate(-50%, -50%);
    }
    .node-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
      background: rgba(15,23,42,0.9);
      color: #e2e8f0;
    }
    .corr-lines {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
    }
    
    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  summary: DashboardSummary | null = null;
  recentEvents: any[] = [];
  processHealth = [
    { name: 'SALES_ORDER', score: 94, events: 1247, avgDuration: 2450 },
    { name: 'INVENTORY_UPDATE', score: 87, events: 892, avgDuration: 1180 },
    { name: 'INVOICE_PROCESSING', score: 91, events: 634, avgDuration: 3420 },
    { name: 'HR_APPROVAL', score: 72, events: 156, avgDuration: 8200 },
    { name: 'CUSTOMER_SUPPORT', score: 89, events: 423, avgDuration: 5100 },
    { name: 'FINANCIAL_TRANSACTION', score: 96, events: 2103, avgDuration: 1750 }
  ];
  aiInsights = [
    { type: 'prediction', text: 'Predictive analysis indicates 78% probability of HR_APPROVAL backlog within 30 minutes due to incoming leave request volume.', confidence: 78, time: '2m ago' },
    { type: 'anomaly', text: 'INVENTORY_UPDATE shows 3.2x duration spike correlating with SAP_ERp API latency increase to 4.2s.', confidence: 92, time: '5m ago' },
    { type: 'recommendation', text: 'Auto-scale recommendation: Increase INVOICE_PROCESSING workers by 40% based on predicted volume surge.', confidence: 85, time: '8m ago' }
  ];
  correlationNodes = [
    { label: 'Sales', x: 20, y: 30, color: '#00d4ff' },
    { label: 'Inv', x: 50, y: 20, color: '#7c3aed' },
    { label: 'Fin', x: 80, y: 35, color: '#22c55e' },
    { label: 'HR', x: 35, y: 70, color: '#eab308' },
    { label: 'Sup', x: 65, y: 75, color: '#ef4444' }
  ];
  correlationLines = [
    { x1: 20, y1: 30, x2: 50, y2: 20, color: '#00d4ff' },
    { x1: 50, y1: 20, x2: 80, y2: 35, color: '#7c3aed' },
    { x1: 20, y1: 30, x2: 35, y2: 70, color: '#eab308' },
    { x1: 80, y1: 35, x2: 65, y2: 75, color: '#22c55e' }
  ];
  
  kpis: any[] = [];
  private wsSub!: Subscription;
  private processColors: Record<string, string> = {
    'SALES_ORDER': '#00d4ff',
    'INVENTORY_UPDATE': '#7c3aed',
    'INVOICE_PROCESSING': '#eab308',
    'HR_APPROVAL': '#ef4444',
    'CUSTOMER_SUPPORT': '#22c55e',
    'FINANCIAL_TRANSACTION': '#f97316'
  };

  constructor(private api: ApiService, private ws: WebSocketService) {}

  ngOnInit() {
    this.loadDashboard();
    this.ws.connect();
    this.wsSub = this.ws.updates$.subscribe((update: RealTimeUpdate) => {
      this.handleRealTimeUpdate(update);
    });
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
    this.ws.disconnect();
  }

  loadDashboard() {
    this.api.getDashboardSummary().subscribe(data => {
      this.summary = data;
      this.updateKpis(data);
    });
  }

  updateKpis(data: DashboardSummary) {
    this.kpis = [
      { label: 'Total Events', value: data.totalEventsToday, trend: 12.5, icon: this.getKpiIcon('events') },
      { label: 'Active Anomalies', value: data.activeAnomalies, trend: -5.2, icon: this.getKpiIcon('anomalies') },
      { label: 'Predictions', value: data.activePredictions, trend: 8.7, icon: this.getKpiIcon('predictions') },
      { label: 'Pending Actions', value: data.pendingActions, trend: -2.1, icon: this.getKpiIcon('actions') },
      { label: 'Process Health', value: data.avgProcessHealth + '%', trend: 3.4, icon: this.getKpiIcon('health') },
      { label: 'AI Accuracy', value: data.predictionAccuracy + '%', trend: 1.8, icon: this.getKpiIcon('accuracy') }
    ];
  }

  getKpiIcon(type: string): string {
    const icons: Record<string, string> = {
      events: `<svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>`,
      anomalies: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      predictions: `<svg viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      actions: `<svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      health: `<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      accuracy: `<svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`
    };
    return icons[type] || '';
  }

  handleRealTimeUpdate(update: RealTimeUpdate) {
    if (update.updateType === 'NEW_EVENT') {
      this.recentEvents.unshift(update.payload);
      if (this.recentEvents.length > 20) this.recentEvents.pop();
    }
    if (update.updateType === 'DASHBOARD_UPDATE') {
      this.summary = update.payload;
      this.updateKpis(update.payload);
    }
  }

  getProcessColor(type: string): string {
    return this.processColors[type] || '#94a3b8';
  }

  getHealthClass(score: number): string {
    if (score >= 85) return 'good';
    if (score >= 70) return 'warning';
    return 'critical';
  }
}
