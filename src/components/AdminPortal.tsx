import React, { useState } from 'react';
import { Utilizador } from '../types';

interface AdminPortalProps {
  utilizadores: Utilizador[];
  setUtilizadores: React.Dispatch<React.SetStateAction<Utilizador[]>>;
  utilizadorAtual?: Utilizador;
  setUtilizadorAtual?: (u: Utilizador) => void;
}

export function AdminPortal({ utilizadores, setUtilizadores, utilizadorAtual, setUtilizadorAtual }: AdminPortalProps): React.JSX.Element {
  const [nome, setNome] = useState('');
  const [historico, setHistorico] = useState<number | ''>(210);
  const [limite, setLimite] = useState<number | ''>(1000);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const handleRegistrar = (e: React.FormEvent) => {
    e.preventDefault(); // Impede o refresh da página

    if (!nome.trim()) {
      alert('Por favor, introduza o nome da entidade/comprador.');
      return;
    }

    const randomHash = Math.random().toString(36).substring(2, 10);
    const novaApiKey = `gs_live_${randomHash}`;
    const novoCpe = `PT00020000${Math.floor(10000000 + Math.random() * 90000000)}AB`;

    const novoUtilizador: Utilizador = {
      id: Date.now(),
      nome: nome.trim(),
      email: `contacto@${nome.toLowerCase().replace(/\s+/g, '')}.pt`,
      cpe: novoCpe,
      creditos_acumulados: 0,
      api_key: novaApiKey,
      limite_mensal: Number(limite) || 1000,
      kwh_historico_ano_anterior: Number(historico) || 0
    };

    // Atualiza a lista global de utilizadores
    setUtilizadores(prev => [...prev, novoUtilizador]);

    // Opcional: Define logo o novo cliente como o utilizador ativo no sistema
    if (setUtilizadorAtual) {
      setUtilizadorAtual(novoUtilizador);
    }

    // Feedback visual
    setMensagemSucesso(`Cliente "${novoUtilizador.nome}" registado com sucesso! Chave API: ${novaApiKey}`);
    
    // Limpa os campos do formulário
    setNome('');
    setHistorico(210);
    setLimite(1000);

    setTimeout(() => setMensagemSucesso(null), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🛡️ Painel de Licenciamento & Venda Mestre
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Controlo centralizado de clientes, chaves API e linhas de base de consumo.
          </p>
        </div>
        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold">
          Sessão Mestre Ativa
        </span>
      </div>

      {/* Alerta de Sucesso */}
      {mensagemSucesso && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-xl text-sm font-semibold animate-fade-in flex items-center justify-between">
          <span>✨ {mensagemSucesso}</span>
          <button onClick={() => setMensagemSucesso(null)} className="text-xs text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Formulário de Criação de Novo Cliente */}
      <form onSubmit={handleRegistrar} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-md font-bold text-slate-200 flex items-center gap-2">
            ➕ Novo Cliente / Gerador de Licenças
          </h3>
          <span className="text-xs text-slate-500">Registo imediato na rede</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Nome da Entidade / Comprador *</label>
            <input
              type="text"
              required
              placeholder="Ex: Empresa Solar Lda"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Histórico do Ano Anterior (kWh/mês)</label>
            <input
              type="number"
              value={historico}
              onChange={(e) => setHistorico(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Limite Mensal de Leituras</label>
            <input
              type="number"
              value={limite}
              onChange={(e) => setLimite(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2"
        >
          🔑 Emitir Token & Registrar Novo Cliente
        </button>
      </form>

      {/* Tabela de Clientes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300">
            👥 Clientes Licenciados Ativos ({utilizadores.length})
          </h3>
          {utilizadorAtual && (
            <span className="text-xs text-emerald-400 font-mono">
              Ativo no Portal: <strong>{utilizadorAtual.nome}</strong>
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">ID / Entidade</th>
                <th className="px-6 py-3">Chave API (`X-API-KEY`)</th>
                <th className="px-6 py-3">Baseline (kWh)</th>
                <th className="px-6 py-3">Créditos</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {utilizadores.map((u) => {
                const isSelected = utilizadorAtual?.id === u.id;
                return (
                  <tr key={u.id} className={`hover:bg-slate-800/30 transition ${isSelected ? 'bg-slate-800/40' : ''}`}>
                    <td className="px-6 py-4 font-semibold text-white">
                      {u.nome}
                      {isSelected && <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Ativo</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-amber-400">{u.api_key}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400">{u.kwh_historico_ano_anterior} kWh</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{u.creditos_acumulados} pts</td>
                    <td className="px-6 py-4">
                      {setUtilizadorAtual && (
                        <button
                          type="button"
                          onClick={() => setUtilizadorAtual(u)}
                          disabled={isSelected}
                          className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {isSelected ? 'Selecionado' : 'Ativar Cliente'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;