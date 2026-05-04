import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="main-layout">
        <app-sidebar></app-sidebar>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #0a0e1a;
      color: #e2e8f0;
    }
    .main-layout {
      display: flex;
      padding-top: 60px;
    }
    .content {
      flex: 1;
      margin-left: 260px;
      padding: 24px;
      min-height: calc(100vh - 60px);
    }
    @media (max-width: 768px) {
      .content {
        margin-left: 0;
        padding: 16px;
      }
    }
  `]
})
export class AppComponent {
  title = 'AdaptiveFlow AI';
}
