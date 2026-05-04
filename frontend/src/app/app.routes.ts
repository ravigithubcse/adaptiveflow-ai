import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AnomaliesComponent } from './components/anomalies/anomalies.component';
import { PredictionsComponent } from './components/predictions/predictions.component';
import { ActionsComponent } from './components/actions/actions.component';
import { CopilotComponent } from './components/copilot/copilot.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'anomalies', component: AnomaliesComponent },
  { path: 'predictions', component: PredictionsComponent },
  { path: 'actions', component: ActionsComponent },
  { path: 'copilot', component: CopilotComponent }
];