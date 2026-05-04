import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { Prediction, RealTimeUpdate } from '../../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="predictions-page">
      <header class="page-header">
        <h2>Predictive Intelligence Engine</h2>
        <p>AI-powered forecasting with confidence scoring and risk assessment</p>
      </header>

      <div class="predictions-grid">
        <div class="prediction-card" *ngFor="let pred of predictions">
          <div class="prediction-header">
            <div class="process-tag">{{ pred.processType }}</div>
            <div class="risk-badge" [class]="pred.riskLevel.toLowerCase()">{{ pred.riskLevel }}</div>
          </div>
          <div class="prediction-type">{{ pred.predictionType }}</div>
          <div class="prediction-values">
            <div class="value-box">
              <span class="value-label">Current</span>
              <span class="value-number">{{ pred.currentValue | number:'1.1-1' }}</span>
            </div>
            <div class="arrow">→</div>
            <div class="value-box predicted">
              <span class="value-label">Predicted</span>
              <span class="value-number">{{ pred.predictedValue | number:'1.1-1' }}</span>
            </div>
          </div>
          <div class="confidence-bar">
            <div class="confidence-label">Confidence: {{ pred.confidenceScore * 100 | number:'1.0-0' }}%</div>
            <div class="confidence-track">
              <div class="confidence-fill" [style.width.%]="pred.confidenceScore * 100"></div>
            </div>
          </div>
          <div class="prediction-reasoning" *ngIf="pred.reasoning">
            <div class="reasoning-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
              <span>AI Reasoning</span>
            </div>
            <p>{{ pred.reasoning }}</p>
          </div>
          <div class="prediction-footer">
            <span>Predicted for: {{ pred.predictedForTime | date:'short' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .predictions-page { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h2 { font-size: 28px; font-weight: 700; color: #f8fafc; margin: 0 0 8px; }
    .page-header p { color: #94a3b8; font-size: 14px; margin: 0; }
    
    .predictions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 16px;
    }
    .prediction-card {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      transition: border-color 0.2s;
    }
    .prediction-card:hover { border-color: #00d4ff; }
    
    .prediction-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .process-tag {
      font-size: 12px;
      font-weight: 600;
      color: #00d4ff;
      background: rgba(0,212,255,0.1);
      padding: 4px 10px;
      border-radius: 4px;
    }
    .risk-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 4px;
    }
    .risk-badge.high { background: #ef4444; color: white; }
    .risk-badge.medium { background: #eab308; color: black; }
    .risk-badge.low { background: #22c55e; color: white; }
    
    .prediction-type {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .prediction-values {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    .value-box {
      flex: 1;
      text-align: center;
      padding: 12px;
      background: rgba(255,255,255,0.03);
      border-radius: 8px;
    }
    .value-box.predicted { background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.2); }
    .value-label { display: block; font-size: 11px; color: #64748b; margin-bottom: 4px; }
    .value-number { display: block; font-size: 22px; font-weight: 700; color: #f8fafc; }
    .value-box.predicted .value-number { color: #00d4ff; }
    .arrow { font-size: 20px; color: #94a3b8; }
    
    .confidence-bar { margin-bottom: 12px; }
    .confidence-label { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
    .confidence-track {
      height: 6px;
      background: #334155;
      border-radius: 3px;
      overflow: hidden;
    }
    .confidence-fill {
      height: 100%;
      background: linear-gradient(90deg, #00d4ff, #7c3aed);
      border-radius: 3px;
      transition: width 0.5s ease;
    }
    
    .prediction-reasoning {
      background: rgba(0,212,255,0.03);
      border: 1px solid rgba(0,212,255,0.1);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .reasoning-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #00d4ff;
    }
    .prediction-reasoning p {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }
    
    .prediction-footer {
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid #334155;
      padding-top: 12px;
    }
  `]
})
export class PredictionsComponent implements OnInit, OnDestroy {
  predictions: Prediction[] = [];
  private wsSub!: Subscription;

  constructor(private api: ApiService, private ws: WebSocketService) {}

  ngOnInit() {
    this.loadPredictions();
    this.wsSub = this.ws.updates$.subscribe((update: RealTimeUpdate) => {
      if (update.updateType === 'NEW_PREDICTION') {
        this.predictions.unshift(update.payload);
        if (this.predictions.length > 20) this.predictions.pop();
      }
    });
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
  }

  loadPredictions() {
    this.api.getPredictions().subscribe(data => this.predictions = data);
  }
}
