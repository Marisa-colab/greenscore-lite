import React from 'react';
import { Utilizador } from '../types';
import { VoiceAssistantCard } from './VoiceAssistantCard';
import { TelecontagemForm } from './TelecontagemForm';
import { PostosList } from './PostosList';

interface ClientPortalProps {
  utilizadorAtual?: Utilizador;
}

export function ClientPortal({ utilizadorAtual }: ClientPortalProps) {
  if (!utilizadorAtual) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-2xl">
        Nenhum cliente selecionado. Seleciona um cliente na barra superior.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Cliente */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
            Portal do Cliente
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">{utilizadorAtual.nome}</h2>
          <p className="text-sm text-slate-400 font-mono">CPE: {utilizadorAtual.cpe}</p>
        </div>
        
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-right w-full md:w-auto">
          <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">Créditos Acumulados</span>
          <span className="text-3xl font-bold text-emerald-400 font-mono">{utilizadorAtual.creditos_acumulados} GS</span>
        </div>
      </div>

      {/* Cartões do Assistente de Voz e Telecontagem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VoiceAssistantCard userId={utilizadorAtual.id} />
        <TelecontagemForm 
          cpe={utilizadorAtual.cpe} 
          onSuccess={() => console.log('Telecontagem registada com sucesso!')} 
        />
      </div>

      {/* Lista de Postos de Consumo */}
      <PostosList />
    </div>
  );
}

export default ClientPortal;
