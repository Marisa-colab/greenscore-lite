export interface Utilizador {
  id: number;
  nome: string;
  email: string;
  cpe: string;
  creditos_acumulados: number;
  api_key?: string;
  limite_mensal?: number;
  kwh_historico_ano_anterior?: number;
}

export interface Posto {
  id: number;
  nome: string;
  concelho: string;
  grupo_cobertura: string;
  meta_poupanca_percentual: number;
}

export interface MedicaoEnergia {
  id: number;
  id_posto: number;
  timestamp: string;
  kwh_atual: number;
  kwh_historico_homologo: number;
  poupanca_kwh: number;
  status_alerta: 'Crítico' | 'OK';
}

export interface VoiceAssistantResponse {
  mensagem: string;
  status?: 'Crítico' | 'OK';
  poupanca_kwh?: number;
  valor_poupado_eur?: number;
  creditos_acumulados?: number;
}

export interface ProcessResponse {
  status: string;
  poupanca_kwh: number;
  creditos_gerados: number;
  alerta_status: 'Crítico' | 'OK';
  timestamp?: string;
}