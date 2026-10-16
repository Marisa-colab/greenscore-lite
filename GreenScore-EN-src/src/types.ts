export interface Utilizador {
  id: number;
  nome: string;
  email: string;
  cpe: string;
  creditos_acumulados: number;
  api_key?: string;
  limite_mensal?: number;
  kwh_historico_ano_anterior?: number;
  role: 'super_admin' | 'cliente';
  licencaAtiva: boolean;
  dataInicioLicenca?: string; 
  duracaoMeses?: number;      
}

export interface Posto {
  id: number;
  nome: string;
  concelho: string;
  cpe?: string;
  consumoKWh?: number;
}

export interface RelatorioDados {
  periodo: string;
  consumoRealKWh: number;
  consumoMetaKWh: number;
  poupancaKWh: number;
  poupancaEuros: number;
  co2EvitadoKg: number;
  creditosGanhosMes: number;
  totalCreditosAcumulados: number;
}
  concelho: string;
  grupo_cobertura: string;
  meta_poupanca_percentual: number;
}
export interface RelatorioDados {
  periodo: string;               // ex: "Julho 2026"
  consumoRealKWh: number;        // Consumo medido no mês
  consumoMetaKWh: number;        // Meta definida para o cliente
  poupancaKWh: number;           // Diferença (Meta - Real)
  poupancaEuros: number;         // Valor financeiro economizado (€)
  co2EvitadoKg: number;          // Redução da pegada de carbono (kg CO₂)
  creditosGanhosMes: number;     // Créditos Verdes gerados no mês
  totalCreditosAcumulados: number; // Saldo total da empresa
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
