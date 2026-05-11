import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StepMetrics, StepStats } from '../../models/simulation.models';
import Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-metrics-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './metrics-panel.html',
  styleUrl: './metrics-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsPanelComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('liqChart') liqChartRef!: ElementRef<HTMLElement>;

  @Input() metrics: StepMetrics | null = null;
  @Input() stats: StepStats | null = null;
  @Input() initialLiquidity = 0;

  private chartInitialized = false;

  get pctHuidos(): number {
    if (!this.metrics) return 0;
    return (this.metrics.personas_huidas / this.metrics.poblacion_total) * 100;
  }

  get pctAlcance(): number {
    if (!this.metrics) return 0;
    return (this.metrics.personas_inf / this.metrics.poblacion_total) * 100;
  }

  get pctRumor(): number {
    if (!this.metrics) return 0;
    return this.metrics.intensidad_rumor * 100;
  }

  get pctLiquidez(): number {
    if (!this.metrics || this.initialLiquidity <= 0) return 100;
    return Math.max(0, (this.metrics.liquidez / this.initialLiquidity) * 100);
  }

  ngAfterViewInit(): void {
    this.renderChart();
    this.chartInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chartInitialized) return;
    if (changes['stats']) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.liqChartRef?.nativeElement) {
      Plotly.purge(this.liqChartRef.nativeElement);
    }
  }

  private renderChart(): void {
    if (!this.liqChartRef?.nativeElement) return;
    const x = this.stats?.paso ?? [];
    const y = this.stats?.liquidez ?? [];

    Plotly.react(
      this.liqChartRef.nativeElement,
      [
        {
          x,
          y,
          fill: 'tozeroy',
          fillcolor: 'rgba(99,102,241,0.15)',
          line: { color: '#6366f1', width: 2 },
          type: 'scatter',
          mode: 'lines',
          hoverinfo: 'y',
          name: 'Liquidez',
        },
      ],
      {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 50, r: 10, t: 30, b: 30 },
        font: { color: '#94a3b8', size: 10, family: 'Inter, Roboto, sans-serif' },
        title: { text: 'Reserva de Liquidez', font: { size: 12, color: '#e2e8f0' }, x: 0.5 },
        xaxis: {
          title: { text: 'Turno', font: { size: 10 } },
          gridcolor: 'rgba(255,255,255,0.05)',
          zerolinecolor: 'rgba(255,255,255,0.1)',
        },
        yaxis: {
          title: { text: '€', font: { size: 10 } },
          gridcolor: 'rgba(255,255,255,0.05)',
          zerolinecolor: 'rgba(255,255,255,0.1)',
        },
        showlegend: false,
        hoverlabel: {
          bgcolor: '#1a1d2e',
          bordercolor: 'rgba(99,102,241,0.55)',
          font: { color: '#e2e8f0', size: 12, family: 'Inter, Roboto, sans-serif' },
        },
      } as Partial<Plotly.Layout>,
      { displayModeBar: false, responsive: true },
    );
  }
}
