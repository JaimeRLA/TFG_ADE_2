import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReportData } from '../../models/simulation.models';
import Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-final-report',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './final-report.html',
  styleUrl: './final-report.scss',
  // Sin OnPush: usamos change detection por defecto para que @if se evalúe
  // inmediatamente y los @ViewChild estén disponibles cuando renderizamos.
})
export class FinalReportComponent implements OnChanges, OnDestroy {
  @Input() reportData: ReportData | null = null;

  @ViewChild('chartTrend') chartTrendRef?: ElementRef<HTMLElement>;
  @ViewChild('chartLiq')   chartLiqRef?:   ElementRef<HTMLElement>;
  @ViewChild('chartHist')  chartHistRef?:  ElementRef<HTMLElement>;
  @ViewChild('chartEdad')  chartEdadRef?:  ElementRef<HTMLElement>;
  @ViewChild('chartTipo')  chartTipoRef?:  ElementRef<HTMLElement>;

  private renderTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {}

  get avgHuidosPct(): number {
    if (!this.reportData) return 0;
    return (this.reportData.avg_huidas_final / this.reportData.poblacion_total) * 100;
  }

  get pctHombre(): number { return this.reportData?.resumen_sexo?.['H'] ?? 0; }
  get pctMujer():  number { return this.reportData?.resumen_sexo?.['M'] ?? 0; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportData'] && this.reportData) {
      // Esperamos 2 frames para que Angular actualice el DOM del @if
      // y los @ViewChild estén disponibles
      if (this.renderTimer) clearTimeout(this.renderTimer);
      this.renderTimer = setTimeout(() => this.renderAll(), 150);
    }
  }

  ngOnDestroy(): void {
    if (this.renderTimer) clearTimeout(this.renderTimer);
    [this.chartTrendRef, this.chartLiqRef, this.chartHistRef,
     this.chartEdadRef, this.chartTipoRef].forEach(ref => {
      if (ref?.nativeElement) Plotly.purge(ref.nativeElement);
    });
  }

  private baseLayout(title: string): Partial<Plotly.Layout> {
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor:  'rgba(0,0,0,0)',
      font:   { color: '#94a3b8', size: 11, family: 'Inter, Roboto, sans-serif' },
      margin: { l: 50, r: 20, t: 40, b: 40 },
      title:  { text: title, font: { size: 13, color: '#e2e8f0' }, x: 0.5 },
      xaxis:  { gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.1)' },
      yaxis:  { gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.1)' },
    } as Partial<Plotly.Layout>;
  }

  private cfg: Partial<Plotly.Config> = { displayModeBar: false, responsive: true };

  private renderAll(): void {
    const d = this.reportData!;
    const turns = Array.from({ length: d.avg_huidas.length }, (_, i) => i);

    // 1. Dinámica Social: Informados vs Retirados
    Plotly.react(this.chartTrendRef!.nativeElement, [
      { x: turns, y: d.avg_inf, name: 'Media Informados',
        line: { color: 'orange', width: 2, dash: 'dash' }, type: 'scatter', mode: 'lines' },
      { x: turns, y: d.avg_huidas, name: 'Media Retirados',
        line: { color: '#ef4444', width: 4 }, fill: 'tozeroy',
        fillcolor: 'rgba(239,68,68,0.1)', type: 'scatter', mode: 'lines' },
    ], {
      ...this.baseLayout('Dinámica Social: Información vs Acción (Media)'),
      showlegend: true,
      legend: { bgcolor: 'rgba(0,0,0,0)', font: { size: 10, color: '#94a3b8' }, x: 0.6, y: 0.95 },
      xaxis: { ...this.baseLayout('').xaxis, title: { text: 'Turnos', font: { size: 11, color: '#94a3b8' } } },
    } as Partial<Plotly.Layout>, this.cfg);

    // 2. Salud Financiera Media
    if (this.chartLiqRef?.nativeElement) {
      Plotly.react(this.chartLiqRef.nativeElement, [
        { x: turns, y: d.avg_liq, fill: 'tozeroy', fillcolor: 'rgba(0,255,204,0.1)',
          line: { color: '#00ffcc', width: 2 }, type: 'scatter', mode: 'lines', name: 'Liquidez Media' },
      ], {
        ...this.baseLayout('Salud Financiera Media (Reserva de Liquidez)'),
        showlegend: false,
        xaxis: { ...this.baseLayout('').xaxis, title: { text: 'Turnos', font: { size: 11, color: '#94a3b8' } } },
        yaxis: { ...this.baseLayout('').yaxis, title: { text: 'Euros (€)', font: { size: 11, color: '#94a3b8' } } },
      } as Partial<Plotly.Layout>, this.cfg);
    }

    // 3. Fuga por Generación
    if (this.chartEdadRef?.nativeElement) {
      Plotly.react(this.chartEdadRef.nativeElement, [
        { x: d.resumen_edad.map(r => r['Rango Edad']),
          y: d.resumen_edad.map(r => r['Fuga %']),
          type: 'bar',
          marker: { color: ['#636EFA', '#EF553B', '#00CC96'] },
          text: d.resumen_edad.map(r => r['Fuga %'].toFixed(1) + '%'),
          textposition: 'outside', textfont: { color: '#94a3b8', size: 10 },
        } as Plotly.Data,
      ], {
        ...this.baseLayout('Intensidad de Fuga Media por Generación'),
        showlegend: false,
        yaxis: { ...this.baseLayout('').yaxis, title: { text: '% Retirado', font: { size: 11, color: '#94a3b8' } } },
      } as Partial<Plotly.Layout>, this.cfg);
    }

    // 4. Fuga por Perfil de Cliente
    if (this.chartTipoRef?.nativeElement) {
      Plotly.react(this.chartTipoRef.nativeElement, [
        { x: d.resumen_tipo.map(r => r['Tipo']),
          y: d.resumen_tipo.map(r => r['Fuga %']),
          type: 'bar',
          marker: { color: ['#00CC96', '#FFA15A', '#EF553B'] },
          text: d.resumen_tipo.map(r => r['Fuga %'].toFixed(1) + '%'),
          textposition: 'outside', textfont: { color: '#94a3b8', size: 10 },
        } as Plotly.Data,
      ], {
        ...this.baseLayout('Intensidad de Fuga por Perfil'),
        showlegend: false,
        yaxis: { ...this.baseLayout('').yaxis, title: { text: '% Retirado', font: { size: 11, color: '#94a3b8' } } },
      } as Partial<Plotly.Layout>, this.cfg);
    }

    // 5. Histograma de Quiebras (condicional)
    if (d.turnos_quiebra.length > 0 && this.chartHistRef?.nativeElement) {
      Plotly.react(this.chartHistRef.nativeElement, [
        { x: d.turnos_quiebra, type: 'histogram',
          marker: { color: '#FF4B4B', opacity: 0.7 }, name: 'Quiebras' } as Plotly.Data,
      ], {
        ...this.baseLayout('Distribución Temporal de las Quiebras'),
        showlegend: false,
        xaxis: { ...this.baseLayout('').xaxis, title: { text: 'Turno de quiebra', font: { size: 11, color: '#94a3b8' } } },
        yaxis: { ...this.baseLayout('').yaxis, title: { text: 'Nº de Simulaciones', font: { size: 11, color: '#94a3b8' } },
          dtick: 1 },
        bargap: 0.1,
      } as Partial<Plotly.Layout>, this.cfg);
    }
  }
}