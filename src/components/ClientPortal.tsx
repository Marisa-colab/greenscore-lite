import React from 'react';
import { Utilizador } from '../types';
import { verificarLicenca } from '../utils/licenca';
import { VoiceAssistantCard } from './VoiceAssistantCard';
import { TelecontagemForm } from './TelecontagemForm';
import { PostosList } from './PostosList';

interface ClientPortalProps {
  utilizadorAtual?: Utilizador;
  currentUser?: Utilizador; // Suporte para ambas as convenções de nome
}

export function ClientPortal({ utilizadorAtual, currentUser }: ClientPortalProps) {
  const user = utilizadorAtual || currentUser;

  // 1. Caso não haja utilizador selecionado
  if (!user) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-2xl">
        Nenhum cliente selecionado. Seleciona um cliente na barra superior.
      </div>
    );
  }

  const temAcesso = verificarLicenca(user);

  // 2. Ecrã de Bloqueio: Licença Expirada / Inativa
  if (!temAcesso) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-red-500/30 rounded-xl p-8 max-w-md text-center shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🚫
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Acesso Indisponível
          </h2>
          <p className="text-slate-300 text-sm mb-6">
            A licença associada à entidade <strong className="text-white">{user.nome}</strong> encontra-se expirada ou inativa.
          </p>
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-xs text-slate-400 mb-6 text-left space-y-2">
            <p className="flex justify-between">
              <span>Início do Contrato:</span>
              <strong className="text-slate-200">{user.dataInicioLicenca || 'N/A'}</strong>
            </p>
            <p className="flex justify-between">
              <span>Duração Contratada:</span>
              <strong className="text-slate-200">{user.duracaoMeses || 12} meses</strong>
            </p>
            <p className="flex justify-between">
              <span>Estado do Acesso:</span>
              <strong className="text-red-400 font-bold">Expirado</strong>
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Por favor, entre em contacto com a administração do GreenScore Lite para proceder à renovação da subscrição.
          </p>
        </div>
      </div>
    );
  }

  // 3. Vista do Cliente Autorizado (Dashboard Completo)
  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
            Acesso Autorizado
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">{user.nome}</h2>
          <p className="text-slate-400 text-sm">{user.email}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl text-right">
          <p className="text-xs text-slate-400">Pontuação Atual</p>
          <p className="text-2xl font-bold text-emerald-400">🌱 GreenScore 84/100</p>
        </div>
      </div>

      {/* Cards de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Consumo Total Registado</p>
          <p className="text-3xl font-bold text-white mt-2">12.450 <span className="text-lg font-normal text-slate-400">kWh</span></p>
          <span className="text-xs text-emerald-400 font-medium mt-1 block">↓ -4% em relação ao mês anterior</span>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Estimativa de Pegada CO₂</p>
          <p className="text-3xl font-bold text-white mt-2">2,8 <span className="text-lg font-normal text-slate-400">toneladas</span></p>
          <span className="text-xs text-emerald-400 font-medium mt-1 block">Em conformidade com as metas ESG</span>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Estado da Licença</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">Ativa</p>
          <span className="text-xs text-slate-400 font-medium mt-1 block">Válida por {user.duracaoMeses || 12} meses</span>
        </div>
      </div>

      {/* Assistente e Formulários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VoiceAssistantCard />
        <TelecontagemForm />
      </div>

      {/* Lista de Postos de Consumo */}
      <PostosList />
    </div>
  );
}
export default ClientPortal;
