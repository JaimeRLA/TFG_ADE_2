import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { SimulationService } from '../../services/simulation.service';
import {
  SimConfig,
  SimStatus,
  NodeData,
  EdgeData,
  StepMetrics,
  StepStats,
  ReportData,
} from '../../models/simulation.models';

import { SidebarComponent } from '../sidebar/sidebar';
import { GraphViewComponent } from '../graph-view/graph-view';
import { MetricsPanelComponent } from '../metrics-panel/metrics-panel';
import { FinalReportComponent } from '../final-report/final-report';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatIconModule,
    SidebarComponent,
    GraphViewComponent,
    MetricsPanelComponent,
    FinalReportComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(SidebarComponent) sidebarComp!: SidebarComponent;

  SimStatus = SimStatus;

  status: SimStatus = SimStatus.Idle;
  currentSim = 0;
  totalSims = 1;
  currentTurn = 0;
  statusLabel = '';

  nodes: NodeData[] = [];
  edges: EdgeData[] = [];
  metrics: StepMetrics | null = null;
  stats: StepStats | null = null;
  initialLiquidity = 0;
  reportData: ReportData | null = null;
  errorMsg = '';

  private sub!: Subscription;
  private statusSub!: Subscription;

  constructor(private simService: SimulationService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.statusSub = this.simService.status$.subscribe((s) => {
      this.status = s;
      this.sidebarComp?.setStatus(s);
      this.cdr.detectChanges();
    });

    this.simService.errorMsg$.subscribe((msg) => {
      this.errorMsg = msg;
      this.cdr.detectChanges();
    });

    this.sub = this.simService.messages$.subscribe((msg) => {
      switch (msg.type) {
        case 'sim_init':
          this.currentSim = msg.sim;
          this.totalSims = msg.total_sims;
          this.edges = msg.edges;
          this.nodes = [];
          this.stats = null;
          this.statusLabel = `Simulación ${msg.sim + 1} / ${msg.total_sims}`;
          break;

        case 'step':
          this.currentTurn = msg.turn;
          this.nodes = [...msg.nodes];
          this.metrics = { ...msg.metrics };
          this.stats = { ...msg.stats };
          if (this.initialLiquidity === 0 && msg.stats.liquidez.length > 0) {
            this.initialLiquidity = msg.stats.liquidez[0];
          }
          this.statusLabel = `Simulación ${msg.sim + 1} / ${this.totalSims} · Turno ${msg.turn}`;
          break;

        case 'report':
          this.reportData = { ...msg.data };
          this.statusLabel = 'Simulación completada';
          // Scroll automático al informe
          setTimeout(() => {
            document.querySelector('.report-area')?.scrollIntoView({ behavior: 'smooth' });
          }, 200);
          break;

        case 'error':
          this.errorMsg = msg.message;
          this.statusLabel = 'Error en la simulación';
          break;
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.statusSub?.unsubscribe();
    this.simService.stop();
  }

  onLaunch(config: SimConfig): void {
    this.reportData = null;
    this.nodes = [];
    this.edges = [];
    this.metrics = null;
    this.stats = null;
    this.errorMsg = '';
    this.initialLiquidity = 0;
    this.statusLabel = 'Conectando...';
    this.simService.start(config);
  }

  onStop(): void {
    this.simService.stop();
    this.statusLabel = 'Simulación detenida';
  }

  get isRunning(): boolean {
    return this.status === SimStatus.Running;
  }
}
