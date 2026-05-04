import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#00d4ff" stroke-width="2" fill="none"/>
            <path d="M10 16C10 12.686 12.686 10 16 10" stroke="#00d4ff" stroke-width="2" stroke-linecap="round"/>
            <circle cx="22" cy="12" r="2" fill="#00d4ff"/>
            <circle cx="12" cy="22" r="2" fill="#7c3aed"/>
          </svg>
        </div>
        <div class="brand-text">
          <h1>AdaptiveFlow <span class="ai-badge">AI</span></h1>
          <span class="subtitle">Cognitive Process Intelligence</span>
        </div>
      </div>
      <div class="nav-status">
        <div class="status-indicator active">
          <span class="pulse"></span>
          <span>Live Monitoring</span>
        </div>
        <div class="system-health">
          <span>System Health</span>
          <div class="health-bar"><div class="health-fill" style="width: 94%"></div></div>
          <span class="health-value">94%</span>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 1000;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-text h1 {
      font-size: 18px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ai-badge {
      background: linear-gradient(135deg, #00d4ff, #7c3aed);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .subtitle {
      font-size: 11px;
      color: #94a3b8;
    }
    .nav-status {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #22c55e;
    }
    .pulse {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .system-health {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #94a3b8;
    }
    .health-bar {
      width: 80px;
      height: 6px;
      background: #334155;
      border-radius: 3px;
      overflow: hidden;
    }
    .health-fill {
      height: 100%;
      background: linear-gradient(90deg, #22c55e, #16a34a);
      border-radius: 3px;
      transition: width 0.5s ease;
    }
    .health-value {
      color: #22c55e;
      font-weight: 600;
    }
  `]
})
export class NavbarComponent {}
