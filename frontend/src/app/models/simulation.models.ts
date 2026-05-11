export interface SimConfig {
  n_agentes: number;
  score: number;
  validez: number;
  difusion: number;
  p_externos: number;
  max_turnos: number;
  n_simulaciones: number;
  velocidad: number;
  preset_id: string;
}

export interface PresetSummary {
  id: string;
  name: string;
  description: string;
}

export interface PresetData {
  name: string;
  description: string;
  demographics: {
    edad_media: number;
    edad_desviacion: number;
    edad_minima: number;
    edad_maxima: number;
    distribucion_sexo: string[];
    probabilidades_sexo: number[];
    factor_h: number;
    factor_m: number;
  };
  deposit_guarantee: {
    umbral_fgd: number;
    reduccion_panico_fgd: number;
  };
  loyalty: {
    rango_fidelidad: number[];
  };
  balances: {
    saldo_retail_rango: number[];
    saldo_vip_rango: number[];
    saldo_empresa_rango: number[];
    distribucion_tipos: string[];
    probabilidades_tipos: number[];
  };
  behavior: {
    k_ruido_cliente: number;
    x0_cliente: number;
    k_ruido_no_cliente: number;
    x0_no_cliente: number;
  };
  decision_weights: {
    peso_noticia: number;
    peso_social: number;
    peso_liquidez: number;
  };
  market: {
    poblacion_objetivo: number;
  };
  network: {
    red_enlaces_nuevos: number;
    red_prob_triangulo: number;
  };
  bank_structure: {
    total_depositos: number;
    liquidez_inicial: number;
  };
}

export interface NodeData {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  symbol: string;
  tipo: string;
  alcance: boolean;
  fuga: number;
  saldo: number;
  rep: number;
}

export interface EdgeData {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface StepMetrics {
  personas_huidas: number;
  personas_inf: number;
  poblacion_total: number;
  intensidad_rumor: number;
  liquidez: number;
}

export interface StepStats {
  paso: number[];
  liquidez: number[];
  huidas: number[];
  informadas: number[];
}

export interface SimInitMessage {
  type: 'sim_init';
  sim: number;
  total_sims: number;
  edges: EdgeData[];
}

export interface StepMessage {
  type: 'step';
  sim: number;
  turn: number;
  nodes: NodeData[];
  metrics: StepMetrics;
  stats: StepStats;
}

export interface SimDoneMessage {
  type: 'sim_done';
  sim: number;
  series: StepStats;
}

export interface ReportData {
  avg_huidas_final: number;
  avg_inf_final: number;
  poblacion_total: number;
  prob_quiebra: number;
  turno_medio_colapso: number;
  supervivencia_media: number;
  avg_huidas: number[];
  avg_inf: number[];
  avg_liq: number[];
  resumen_edad: { 'Rango Edad': string; 'Fuga %': number }[];
  resumen_tipo: { Tipo: string; 'Fuga %': number }[];
  resumen_sexo: { [key: string]: number };
  avg_fgd: number;
  worst_tipo: string;
  turnos_quiebra: number[];
  n_simulaciones: number;
  max_turnos: number;
}

export interface ReportMessage {
  type: 'report';
  data: ReportData;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export type SimMessage =
  | SimInitMessage
  | StepMessage
  | SimDoneMessage
  | ReportMessage
  | ErrorMessage;

export enum SimStatus {
  Idle = 'idle',
  Running = 'running',
  Done = 'done',
  Error = 'error',
}
