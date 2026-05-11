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
import { NodeData, EdgeData } from '../../models/simulation.models';
import Plotly from 'plotly.js-dist-min';

const DARK_LAYOUT: Partial<Plotly.Layout> = {
  template: { layout: { paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' } },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#94a3b8', family: 'Inter, Roboto, sans-serif', size: 11 },
  margin: { l: 0, r: 0, t: 40, b: 0 },
  xaxis: { showgrid: false, zeroline: false, showticklabels: false },
  yaxis: { showgrid: false, zeroline: false, showticklabels: false },
  showlegend: true,
  legend: {
    bgcolor: 'rgba(15,17,23,0.7)',
    bordercolor: 'rgba(255,255,255,0.1)',
    borderwidth: 1,
    font: { size: 10, color: '#94a3b8' },
    x: 0,
    y: 1,
    xanchor: 'left',
    yanchor: 'top',
  },
  hoverlabel: {
    bgcolor: '#1a1d2e',
    bordercolor: 'rgba(99,102,241,0.55)',
    font: { color: '#e2e8f0', size: 12, family: 'Inter, Roboto, sans-serif' },
    align: 'left',
    namelength: 0,
  },
};

const PLOTLY_CONFIG: Partial<Plotly.Config> = {
  displayModeBar: false,
  responsive: true,
};

@Component({
  selector: 'app-graph-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graph-view.html',
  styleUrl: './graph-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphViewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('graphDiv') graphDivRef!: ElementRef<HTMLElement>;

  @Input() nodes: NodeData[] = [];
  @Input() edges: EdgeData[] = [];
  @Input() turn = 0;
  @Input() simIndex = -1;
  @Input() totalSims = 1;

  private initialized = false;

  ngAfterViewInit(): void {
    this.initPlot();
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.initialized) return;
    if (changes['edges'] && this.edges.length > 0) {
      this.initPlot();
    } else if (changes['nodes'] && this.nodes.length > 0) {
      this.updateNodes();
    }
  }

  ngOnDestroy(): void {
    if (this.graphDivRef?.nativeElement) {
      Plotly.purge(this.graphDivRef.nativeElement);
    }
  }

  private buildEdgeTrace(): Plotly.Data {
    const ex: (number | null)[] = [];
    const ey: (number | null)[] = [];
    for (const e of this.edges) {
      ex.push(e.x0, e.x1, null);
      ey.push(e.y0, e.y1, null);
    }
    return {
      x: ex,
      y: ey,
      mode: 'lines',
      hoverinfo: 'none',
      showlegend: false,
      line: { color: 'rgba(255,255,255,0.08)', width: 0.6 },
      type: 'scatter',
    } as Plotly.Data;
  }

  private buildNodeTrace(): Plotly.Data {
    const nx: number[] = [];
    const ny: number[] = [];
    const colors: string[] = [];
    const sizes: number[] = [];
    const symbols: string[] = [];
    const texts: string[] = [];

    for (const a of this.nodes) {
      nx.push(a.x);
      ny.push(a.y);
      colors.push(a.color);
      sizes.push(a.size);
      symbols.push(a.symbol);

      if (a.tipo === 'No-Cliente') {
        texts.push(
          `<b>OPINIÓN PÚBLICA</b><br>Estado: ${a.alcance ? 'Difundiendo' : 'Inactivo'}<br>Intensidad: ${(a.fuga * 100).toFixed(1)}%`,
        );
      } else {
        texts.push(
          `<b>CLIENTE (${a.tipo})</b><br>Población: ${a.rep.toLocaleString()}<br>Fuga: ${(a.fuga * 100).toFixed(1)}%<br>Saldo: ${a.saldo.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€`,
        );
      }
    }

    return {
      x: nx,
      y: ny,
      mode: 'markers',
      hoverinfo: 'text',
      text: texts,
      showlegend: false,
      marker: {
        color: colors,
        size: sizes,
        symbol: symbols as Plotly.MarkerSymbol[],
        line: { color: 'rgba(255,255,255,0.15)', width: 0.5 },
      },
      type: 'scatter',
    } as Plotly.Data;
  }

  private buildLegendTraces(): Plotly.Data[] {
    const legendItems = [
      { color: 'rgb(34,139,34)', symbol: 'circle', name: 'Cliente: Tranquilo' },
      { color: 'rgb(255,165,0)', symbol: 'circle', name: 'Cliente: Alerta (<5%)' },
      { color: 'rgb(255,50,0)', symbol: 'circle', name: 'Cliente: Fuga Crítica' },
      { color: 'rgb(100,100,100)', symbol: 'diamond', name: 'Opinión: Inactiva' },
      { color: 'rgb(100,150,255)', symbol: 'diamond', name: 'Opinión: Difundiendo' },
    ];
    return legendItems.map(
      (li) =>
        ({
          x: [null],
          y: [null],
          mode: 'markers',
          showlegend: true,
          name: li.name,
          marker: { size: 8, color: li.color, symbol: li.symbol as Plotly.MarkerSymbol },
          type: 'scatter',
          hoverinfo: 'none',
        }) as Plotly.Data,
    );
  }

  private getLayout(): Partial<Plotly.Layout> {
    const simLabel =
      this.simIndex >= 0
        ? `Simulación ${this.simIndex + 1}/${this.totalSims} · Turno ${this.turn}`
        : 'Red de Influencia Social';
    return {
      ...DARK_LAYOUT,
      title: {
        text: simLabel,
        font: { color: '#e2e8f0', size: 13, family: 'Inter, Roboto, sans-serif' },
        x: 0.5,
        xanchor: 'center',
      },
    } as Partial<Plotly.Layout>;
  }

  private initPlot(): void {
    const traces: Plotly.Data[] = [
      this.buildEdgeTrace(),
      this.buildNodeTrace(),
      ...this.buildLegendTraces(),
    ];
    Plotly.react(this.graphDivRef.nativeElement, traces, this.getLayout(), PLOTLY_CONFIG);
  }

  private updateNodes(): void {
    const nodeTrace = this.buildNodeTrace();
    Plotly.react(
      this.graphDivRef.nativeElement,
      [this.buildEdgeTrace(), nodeTrace, ...this.buildLegendTraces()],
      this.getLayout(),
      PLOTLY_CONFIG,
    );
  }
}
