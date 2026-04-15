import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { PresetManagerComponent } from './components/preset-manager/preset-manager';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'presets', component: PresetManagerComponent },
  { path: '**', redirectTo: '' }
];
