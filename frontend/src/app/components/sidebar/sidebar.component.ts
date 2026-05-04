import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <nav class="nav-menu">
        <a *ngFor="let item of menuItems" 
           [routerLink]="item.path"
           routerLinkActive="active"
           class="nav-item">
          <span class="nav-icon" [innerHTML]="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
          <span *ngIf="item.badge" class="badge">{{ item.badge }}</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <div class="ai-engine-status">
          <div class="engine-dot"></div>
          <span>AI Engine Active</span>
        </div>
        <div class="version">v1.0.0</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 60px;
      bottom: 0;
      width: 260px;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      border-right: 1px solid #1e293b;
      display: flex;
      flex-direction: column;
      z-index: 999;
    }
    .nav-menu {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s;
      position: relative;
    }
    .nav-item:hover {
      background: rgba(255,255,255,0.05);
      color: #e2e8f0;
    }
    .nav-item.active {
      background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15));
      color: #00d4ff;
      border: 1px solid rgba(0,212,255,0.2);
    }
    .nav-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nav-icon svg {
      width: 20px;
      height: 20px;
    }
    .nav-label {
      font-size: 14px;
      font-weight: 500;
    }
    .badge {
      margin-left: auto;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
    }
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid #1e293b;
    }
    .ai-engine-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #22c55e;
      margin-bottom: 8px;
    }
    .engine-dot {
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    .version {
      font-size: 11px;
      color: #64748b;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s;
      }
    }
  `]
})
export class SidebarComponent {
  menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`
    },
    {
      path: '/anomalies',
      label: 'Anomalies',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      badge: '2'
    },
    {
      path: '/predictions',
      label: 'Predictions',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
    },
    {
      path: '/actions',
      label: 'Actions',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
    },
    {
      path: '/copilot',
      label: 'AI Copilot',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`
    }
  ];
}
