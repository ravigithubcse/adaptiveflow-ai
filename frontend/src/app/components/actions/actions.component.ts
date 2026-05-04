import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { AutonomousAction, RealTimeUpdate } from '../../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="actions-page">
      <header class="page-header">
        <h2>Autonomous Action Center</h2>
        <p>AI-recommended actions with human-in-the-loop approval</p>
      </header>

      <div class="actions-tabs">
        <button [class.active]="activeTab === 'pending'" (click)="activeTab = 'pending'">
          Pending Approval ({{ pendingCount }})
        </button>
        <button [class.active]="activeTab === 'executed'" (click)="activeTab = 'executed'">
          Executed
        </button>
        <button [class.active]="activeTab === 'all'" (click)="activeTab = 'all'">
          All Actions
        </button>
      </div>

      <div class="actions-list">
        <div class="action-card" *ngFor="let action of filteredActions">
          <div class="action-header">
            <div class="action-type">{{ action.actionType }}</div>
            <div class="status-badge" [class]="action.status.toLowerCase()">{{ action.status }}</div>
            <div class="approval-status" [class]="action.approvalStatus.toLowerCase()">{{ action.approvalStatus }}</div>
          </div>
          <div class="action-target">
            <span class="target-process">{{ action.targetProcess }}</span>
            <span class="target-id">{{ action.targetEntityId }}</span>
          </div>
          <div class="ai-reasoning" *ngIf="action.aiReasoning">
            <div class="reasoning-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
              <span>AI Reasoning</span>
            </div>
            <p>{{ action.aiReasoning }}</p>
          </div>
          <div class="action-impact">
            <span class="impact-label">Estimated Impact:</span>
            <span class="impact-value">+{{ action.estimatedImpact | number:'1.1-1' }}% efficiency</span>
          </div>
          <div class="action-footer" *ngIf="action.status === 'PENDING' && action.approvalStatus === 'REQUIRED'">
            <button class="approve-btn" (click)="approveAction(action.id, true)">Approve</button>
            <button class="reject-btn" (click)="approveAction(action.id, false)">Reject</button>
          </div>
          <div class="action-result" *ngIf="action.result">
            <span>Result: {{ action.result }}</span>
            <span *ngIf="action.success" class="success-tag">Success</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .actions-page { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h2 { font-size: 28px; font-weight: 700; color: #f8fafc; margin: 0 0 8px; }
    .page-header p { color: #94a3b8; font-size: 14px; margin: 0; }
    
    .actions-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }
    .actions-tabs button {
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #1e293b;
      color: #94a3b8;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .actions-tabs button.active {
      background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15));
      border-color: #00d4ff;
      color: #00d4ff;
    }
    .actions-tabs button:hover:not(.active) {
      background: #334155;
      color: #e2e8f0;
    }
    
    .actions-list { display: flex; flex-direction: column; gap: 16px; }
    .action-card {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
    }
    .action-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .action-type {
      font-size: 13px;
      font-weight: 600;
      color: #00d4ff;
      background: rgba(0,212,255,0.1);
      padding: 4px 10px;
      border-radius: 4px;
    }
    .status-badge, .approval-status {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 4px;
    }
    .status-badge.pending { background: #eab308; color: black; }
    .status-badge.executed { background: #22c55e; color: white; }
    .approval-status.required { background: #ef4444; color: white; }
    .approval-status.approved { background: #22c55e; color: white; }
    .approval-status.auto_approved { background: #7c3aed; color: white; }
    
    .action-target {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 13px;
    }
    .target-process { color: #e2e8f0; font-weight: 600; }
    .target-id { color: #64748b; font-family: monospace; }
    
    .ai-reasoning {
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
    .ai-reasoning p {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }
    
    .action-impact {
      display: flex;
      gap: 8px;
      font-size: 13px;
      margin-bottom: 12px;
    }
    .impact-label { color: #64748b; }
    .impact-value { color: #22c55e; font-weight: 600; }
    
    .action-footer {
      display: flex;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid #334155;
    }
    .approve-btn, .reject-btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }
    .approve-btn {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
    }
    .reject-btn {
      background: transparent;
      border: 1px solid #ef4444;
      color: #ef4444;
    }
    
    .action-result {
      display: flex;
      gap: 12px;
      align-items: center;
      font-size: 13px;
      color: #94a3b8;
      padding-top: 12px;
      border-top: 1px solid #334155;
    }
    .success-tag {
      background: rgba(34,197,94,0.2);
      color: #22c55e;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
  `]
})
export class ActionsComponent implements OnInit, OnDestroy {
  actions: AutonomousAction[] = [];
  activeTab: 'pending' | 'executed' | 'all' = 'pending';
  private wsSub!: Subscription;

  constructor(private api: ApiService, private ws: WebSocketService) {}

  ngOnInit() {
    this.loadActions();
    this.wsSub = this.ws.updates$.subscribe((update: RealTimeUpdate) => {
      if (update.updateType === 'NEW_ACTION' || update.updateType === 'ACTION_UPDATED') {
        const idx = this.actions.findIndex(a => a.id === update.payload.id);
        if (idx >= 0) {
          this.actions[idx] = update.payload;
        } else {
          this.actions.unshift(update.payload);
        }
      }
    });
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
  }

  loadActions() {
    this.api.getAllActions().subscribe(data => this.actions = data);
  }

  approveAction(id: string, approved: boolean) {
    this.api.approveAction(id, approved, 'admin', approved ? '' : 'Operator rejected').subscribe(() => {
      this.loadActions();
    });
  }

  get filteredActions() {
    if (this.activeTab === 'pending') return this.actions.filter(a => a.status === 'PENDING');
    if (this.activeTab === 'executed') return this.actions.filter(a => a.status === 'EXECUTED');
    return this.actions;
  }

  get pendingCount() {
    return this.actions.filter(a => a.status === 'PENDING').length;
  }
}
