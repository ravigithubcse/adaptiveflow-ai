import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { CopilotMessage, RealTimeUpdate } from '../../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-copilot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="copilot-page">
      <header class="page-header">
        <h2>AdaptiveFlow AI Copilot</h2>
        <p>Natural language interface to your cognitive process intelligence</p>
      </header>

      <div class="copilot-container">
        <div class="chat-area">
          <div class="messages" #messagesContainer>
            <div class="welcome-message" *ngIf="messages.length === 0">
              <div class="welcome-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
              </div>
              <h3>Welcome to AdaptiveFlow AI Copilot</h3>
              <p>I am your cognitive process intelligence assistant. Ask me about:</p>
              <div class="suggestions">
                <button *ngFor="let suggestion of suggestions" (click)="sendMessage(suggestion)">
                  {{ suggestion }}
                </button>
              </div>
            </div>
            <div class="message" *ngFor="let msg of messages" [class]="msg.role">
              <div class="message-avatar">
                <div class="avatar" [class.user]="msg.role === 'user'" [class.ai]="msg.role === 'assistant'">
                  {{ msg.role === 'user' ? 'U' : 'AI' }}
                </div>
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="role">{{ msg.role === 'user' ? 'You' : 'AdaptiveFlow AI' }}</span>
                  <span class="time">{{ msg.timestamp | date:'shortTime' }}</span>
                </div>
                <p class="message-text">{{ msg.content }}</p>
              </div>
            </div>
          </div>
          <div class="input-area">
            <input 
              type="text" 
              [(ngModel)]="currentMessage"
              (keydown.enter)="sendMessage(currentMessage)"
              placeholder="Ask about your processes, anomalies, predictions..."
              [disabled]="isLoading"
            />
            <button (click)="sendMessage(currentMessage)" [disabled]="isLoading || !currentMessage.trim()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="context-panel">
          <h4>Context Processes</h4>
          <div class="process-list">
            <label *ngFor="let process of processes">
              <input type="checkbox" [checked]="selectedProcesses.includes(process)" (change)="toggleProcess(process)">
              <span>{{ process }}</span>
            </label>
          </div>
          <div class="quick-actions">
            <h4>Quick Actions</h4>
            <button (click)="sendMessage('Show all active anomalies')">Active Anomalies</button>
            <button (click)="sendMessage('Show predictions for next hour')">Next Hour Forecast</button>
            <button (click)="sendMessage('Explain the cross-process correlation')">Explain Correlations</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .copilot-page { max-width: 1200px; margin: 0 auto; height: calc(100vh - 140px); }
    .page-header { margin-bottom: 16px; }
    .page-header h2 { font-size: 24px; font-weight: 700; color: #f8fafc; margin: 0 0 8px; }
    .page-header p { color: #94a3b8; font-size: 14px; margin: 0; }
    
    .copilot-container {
      display: grid;
      grid-template-columns: 1fr 260px;
      gap: 16px;
      height: 100%;
    }
    
    .chat-area {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid #334155;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    
    .welcome-message {
      text-align: center;
      padding: 40px 20px;
    }
    .welcome-icon {
      margin-bottom: 16px;
    }
    .welcome-message h3 {
      font-size: 20px;
      color: #e2e8f0;
      margin: 0 0 8px;
    }
    .welcome-message p {
      color: #94a3b8;
      margin: 0 0 20px;
    }
    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .suggestions button {
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid #334155;
      background: #1e293b;
      color: #94a3b8;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .suggestions button:hover {
      border-color: #00d4ff;
      color: #00d4ff;
      background: rgba(0,212,255,0.05);
    }
    
    .message {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .message.assistant { flex-direction: row; }
    .message.user { flex-direction: row-reverse; }
    .message.user .message-content { background: rgba(0,212,255,0.1); }
    
    .message-avatar .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
    }
    .avatar.user { background: #00d4ff; color: #0f172a; }
    .avatar.ai { background: linear-gradient(135deg, #7c3aed, #00d4ff); color: white; }
    
    .message-content {
      flex: 1;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      padding: 12px 16px;
      max-width: 80%;
    }
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .role { font-size: 12px; font-weight: 600; color: #e2e8f0; }
    .time { font-size: 11px; color: #64748b; }
    .message-text {
      font-size: 14px;
      color: #cbd5e1;
      margin: 0;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    
    .input-area {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #334155;
    }
    .input-area input {
      flex: 1;
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #0f172a;
      color: #e2e8f0;
      font-size: 14px;
    }
    .input-area input:focus {
      outline: none;
      border-color: #00d4ff;
    }
    .input-area input::placeholder { color: #64748b; }
    .input-area button {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #00d4ff, #7c3aed);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .context-panel {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 16px;
    }
    .context-panel h4 {
      font-size: 14px;
      font-weight: 600;
      color: #e2e8f0;
      margin: 0 0 12px;
    }
    .process-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }
    .process-list label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #94a3b8;
      cursor: pointer;
    }
    .process-list input[type="checkbox"] {
      accent-color: #00d4ff;
    }
    .quick-actions {
      border-top: 1px solid #334155;
      padding-top: 16px;
    }
    .quick-actions button {
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 8px;
      border-radius: 6px;
      border: 1px solid #334155;
      background: #0f172a;
      color: #94a3b8;
      font-size: 12px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    }
    .quick-actions button:hover {
      border-color: #00d4ff;
      color: #00d4ff;
    }
    
    @media (max-width: 768px) {
      .copilot-container { grid-template-columns: 1fr; }
      .context-panel { display: none; }
    }
  `]
})
export class CopilotComponent implements OnInit, OnDestroy {
  messages: CopilotMessage[] = [];
  currentMessage = '';
  isLoading = false;
  sessionId = 'session-' + Math.random().toString(36).substring(2, 15);
  processes = ['SALES_ORDER', 'INVENTORY_UPDATE', 'INVOICE_PROCESSING', 'HR_APPROVAL', 'CUSTOMER_SUPPORT', 'FINANCIAL_TRANSACTION'];
  selectedProcesses: string[] = [...this.processes];
  suggestions = [
    'Show me recent anomalies',
    'Predict next hour volumes',
    'Why is HR approval slow?',
    'Explain cross-process alerts'
  ];
  
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  private wsSub!: Subscription;

  constructor(private api: ApiService, private ws: WebSocketService) {}

  ngOnInit() {
    this.wsSub = this.ws.updates$.subscribe((update: RealTimeUpdate) => {
      if (update.updateType === 'COPILOT_MESSAGE') {
        const msg: CopilotMessage = {
          id: Date.now().toString(),
          sessionId: update.payload.sessionId,
          role: 'assistant',
          content: update.payload.aiResponse,
          timestamp: new Date().toISOString()
        };
        this.messages.push(msg);
        this.scrollToBottom();
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
  }

  sendMessage(text: string) {
    if (!text.trim() || this.isLoading) return;
    
    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      sessionId: this.sessionId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    this.messages.push(userMsg);
    this.currentMessage = '';
    this.isLoading = true;
    this.scrollToBottom();
    
    this.api.sendCopilotMessage(this.sessionId, text, this.selectedProcesses).subscribe({
      next: (response) => {
        const aiMsg: CopilotMessage = {
          id: (Date.now() + 1).toString(),
          sessionId: response.sessionId,
          role: 'assistant',
          content: response.aiResponse,
          timestamp: new Date().toISOString()
        };
        this.messages.push(aiMsg);
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  toggleProcess(process: string) {
    if (this.selectedProcesses.includes(process)) {
      this.selectedProcesses = this.selectedProcesses.filter(p => p !== process);
    } else {
      this.selectedProcesses.push(process);
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
