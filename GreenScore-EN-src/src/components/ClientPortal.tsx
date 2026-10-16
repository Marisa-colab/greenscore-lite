import React from 'react';
import { Utilizador } from '../types';

interface ClientDadosProps {
  utilizadorAtual?: Utilizador;
  onVoltarAdmin?: () => void;
}

export function DadosPortal({ utilizadorAtual, onVoltarAdmin }: ClientPortalProps) {
  
  if (!utilizadorAtual) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <p className="text-slate-400">Nenhum cliente selecionado de momento.</p>
        {onVoltarAdmin && (
          <button 
            onClick={onVoltarAdmin}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-semibold"
          >
            ← Voltar à Consola Admin
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO DO RELATÓRIO COM BOTÃO DE VOLTAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Relatório de Desempenho ESG
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            {utilizadorAtual.nome}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            CPE: <span className="text-slate-200 font-mono">{utilizadorAtual.cpe || 'N/D'}</span> | Contacto: {utilizadorAtual.email}
          </p>
        </div>

        {/* BOTÃO VOLTAR PARA A CONSOLA ADMIN */}
        {onVoltarAdmin && (
          <button 
            onClick={onVoltarAdmin}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-sm hover:border-slate-600"
          >
            ← Voltar à Consola Admin
          </button>
        )}
      </div>

      {/* CARTÕES DE METRICAS E KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Créditos Acumulados</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {utilizadorAtual.creditos_acumulados || 0} <span className="text-xs text-slate-400">pts</span>
          </p>
          <p className="text-[11px] text-emerald-500/80 mt-1">🌱 Prontos a resgatar</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Consumo Atual (Mês)</p>
          <p className="text-2xl font-bold text-white mt-2">
            8 450 <span className="text-xs text-slate-400">kWh</span>
          </p>
          <p className="text-[11px] text-emerald-400 mt-1">↓ 12% vs. mês anterior</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Poupança Estimada</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            340,00 €
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Calculado sobre tarifa base</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">CO₂ Evitado</p>
          <p className="text-2xl font-bold text-cyan-400 mt-2">
            1 250 <span className="text-xs text-slate-400">kg</span>
          </p>
          <p className="text-[11px] text-cyan-500/80 mt-1">Impacto ecológico positivo</p>
        </div>
      </div>

      {/* SECÇÃO DE PROGRESSO DA META */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white">Eficiência Energética do Período</h3>
        <p className="text-xs text-slate-400">
          Acompanhamento do consumo atual em relação à meta contratada para atribuição de novos Créditos Verdes.
        </p>
        
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Meta de Redução de Consumo</span>
            <span className="text-emerald-400 font-bold">85% Atingido</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>

    </div>
  );
}
