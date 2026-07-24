import React, { useState, useEffect } from 'react';
import PostosList, { Posto } from './components/PostosList';
import * as XLSX from 'xlsx';

export interface LeituraHistorica {
  id: string;
  mesAno: string;
  cpe: string;
  kwhConsumidos: number;
  kwhPoupados: number;
  creditosGerados: number;
}

export interface Funcionario {
  id: string;
  nome: string;
  departamento: string;
  creditosGanhos: number;
}

export interface Cliente {
  id: string;
  nome: string;
  apiKey: string;
  baselineKwh: number;
  limiteLeituras: number;
  creditosTotais: number;
  postos: Posto[];
  historicoLeituras: LeituraHistorica[];
  funcionarios: Funcionario[];
}

const CLIENTE_INICIAL_PS_ACORES: Cliente = {
  id: 'cli_ps_angra',
  nome: 'PS-Angra',
  apiKey: 'gs_live_sh685m37',
  baselineKwh: 210,
  limiteLeituras: 1000,
  creditosTotais: 0,
  postos: [
    {
      id: 'pos_ps_angra_1',
      nome: 'Sede / Instalação Principal',
      cpe: 'PT0008000012345678AP',
      morada: 'Angra do Heroísmo, Ilha Terceira',
      tipo: 'Comercial / Industrial',
      estado: 'ativo'
    }
  ],
  historicoLeituras: [
    { id: 'h1', mesAno: 'Janeiro 2025', cpe: 'PT0008000012345678AP', kwhConsumidos: 180, kwhPoupados: 30, creditosGerados: 300 },
    { id: 'h2', mesAno: 'Fevereiro 2025', cpe: 'PT0008000012345678AP', kwhConsumidos: 195, kwhPoupados: 15, creditosGerados: 150 }
  ],
  funcionarios: [
    { id: 'f1', nome: 'Marisa Reis', departamento: 'Administrativo', creditosGanhos: 200 },
    { id: 'f2', nome: 'Zélia Costa', departamento: 'Operações', creditosGanhos: 250 }
  ]
};

export function App() {
  const [vista, setVista] = useState<'admin' | 'cliente'>('admin');
  const [adminAba, setAdminAba] = useState<'clientes' | 'historico' | 'equipa'>('historico');
  const [clienteAba, setClienteAba] = useState<'historico' | 'equipa' | 'postos'>('historico');

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('gs_clientes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [CLIENTE_INICIAL_PS_ACORES];
  });

  const [clienteAtivoId, setClienteAtivoId] = useState<string>(() => {
    return localStorage.getItem('gs_ativo_id') || 'cli_ps_acores';
  });

  // Admin Forms
  const [novoNome, setNovoNome] = useState('');
  const [novoCpe, setNovoCpe] = useState('');
  const [novoBaseline, setNovoBaseline] = useState('210');

  // Admin CPE Edit
  const [editingPosto, setEditingPosto] = useState<{ clientId: string; postoId: string; cpe: string; nome: string } | null>(null);
  const [addingCpeForClient, setAddingCpeForClient] = useState<string | null>(null);
  const [newCpeInput, setNewCpeInput] = useState('');
  const [newNomeInput, setNewNomeInput] = useState('');

  // Lançar Faturas / Histórico
  const [histMesAno, setHistMesAno] = useState('');
  const [histKwh, setHistKwh] = useState('');
  const [histCpe, setHistCpe] = useState('');

  // Adicionar Funcionário
  const [funcNome, setFuncNome] = useState('');
  const [funcDept, setFuncDept] = useState('');
  const [funcCreditos, setFuncCreditos] = useState('');

  useEffect(() => {
    localStorage.setItem('gs_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('gs_ativo_id', clienteAtivoId);
  }, [clienteAtivoId]);

  const clienteAtivo = clientes.find(c => c.id === clienteAtivoId) || clientes[0];

  // Totais da entidade ativa
  const totalKwhPoupados = clienteAtivo?.historicoLeituras?.reduce((acc, h) => acc + h.kwhPoupados, 0) || 0;
  const totalCreditosGerados = clienteAtivo?.historicoLeituras?.reduce((acc, h) => acc + h.creditosGerados, 0) || 0;
  const totalCreditosAtribuidos = clienteAtivo?.funcionarios?.reduce((acc, f) => acc + f.creditosGanhos, 0) || 0;

  const handleCriarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    const id = 'cli_' + Date.now();
    const apiKey = 'gs_live_' + Math.random().toString(36).substring(2, 11);
    
    const primeiroPosto: Posto[] = novoCpe.trim() ? [{
      id: 'pos_' + Date.now(),
      nome: 'Instalação Principal',
      cpe: novoCpe.trim(),
      morada: 'Registada no contrato',
      tipo: 'Geral',
      estado: 'ativo'
    }] : [];

    const novoCliente: Cliente = {
      id,
      nome: novoNome,
      apiKey,
      baselineKwh: Number(novoBaseline) || 200,
      limiteLeituras: 1000,
      creditosTotais: 0,
      postos: primeiroPosto,
      historicoLeituras: [],
      funcionarios: []
    };

    setClientes(prev => [...prev, novoCliente]);
    setClienteAtivoId(id);
    setNovoNome('');
    setNovoCpe('');
  };

  const handleSaveEditedCpe = (clientId: string, postoId: string) => {
    if (!editingPosto) return;
    setClientes(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          postos: c.postos.map(p => p.id === postoId ? { ...p, cpe: editingPosto.cpe, nome: editingPosto.nome || p.nome } : p)
        };
      }
      return c;
    }));
    setEditingPosto(null);
  };

  const handleAddCpeInAdmin = (clientId: string) => {
    if (!newCpeInput.trim()) return;
    const novoPosto: Posto = {
      id: 'pos_' + Date.now(),
      nome: newNomeInput.trim() || 'Nova Instalação',
      cpe: newCpeInput.trim(),
      morada: 'Registada pelo Admin',
      tipo: 'Geral',
      estado: 'ativo'
    };

    setClientes(prev => prev.map(c => {
      if (c.id === clientId) {
        return { ...c, postos: [...c.postos, novoPosto] };
      }
      return c;
    }));

    setAddingCpeForClient(null);
    setNewCpeInput('');
    setNewNomeInput('');
  };

  const handleAddLeituraHistorica = (e: React.FormEvent) => {
    e.preventDefault();
    if (!histMesAno.trim() || !histKwh) return;

    const kwhConsumidos = Number(histKwh);
    const kwhPoupados = Math.max(0, clienteAtivo.baselineKwh - kwhConsumidos);
    const creditosGerados = kwhPoupados * 10; // Regra: 1 kWh poupado = 10 Créditos

    const novaLeitura: LeituraHistorica = {
      id: 'hist_' + Date.now(),
      mesAno: histMesAno.trim(),
      cpe: histCpe.trim() || (clienteAtivo.postos[0]?.cpe || 'CPE Geral'),
      kwhConsumidos,
      kwhPoupados,
      creditosGerados
    };

    setClientes(prev => prev.map(c => {
      if (c.id === clienteAtivo.id) {
        return {
          ...c,
          historicoLeituras: [novaLeitura, ...(c.historicoLeituras || [])]
        };
      }
      return c;
    }));

    setHistMesAno('');
    setHistKwh('');
  };

  const handleAddFuncionario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcNome.trim()) return;

    const novoFunc: Funcionario = {
      id: 'func_' + Date.now(),
      nome: funcNome.trim(),
      departamento: funcDept.trim() || 'Geral',
      creditosGanhos: Number(funcCreditos) || 0
    };

    setClientes(prev => prev.map(c => {
      if (c.id === clienteAtivo.id) {
        return {
          ...c,
          funcionarios: [...(c.funcionarios || []), novoFunc]
        };
      }
      return c;
    }));

    setFuncNome('');
    setFuncDept('');
    setFuncCreditos('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-bold">🌿</div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">GreenScore <span className="text-emerald-400 text-xs px-2 py-0.5 border border-emerald-500/30 rounded-full font-mono">CORE 1.0</span></h1>
            <p className="text-xs text-slate-400">Plataforma de Eficiência Energética e Créditos</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs">
            <span className="text-slate-400">Entidade Em Foco: </span>
            <strong className="text-amber-400 font-semibold">{clienteAtivo ? clienteAtivo.nome : 'Nenhuma'}</strong>
          </div>
          <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl gap-1">
            <button
              onClick={() => setVista('admin')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                vista === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🛡️ Gestor / Admin
            </button>
            <button
              onClick={() => setVista('cliente')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                vista === 'cliente' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔒 Portal Cliente
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {vista === 'admin' ? (
          /* VISTA GESTOR / ADMIN (LANÇAMENTO E GESTÃO COMPLETA) */
          <div className="space-y-8">
            {/* Header da Seção Admin com Seleção de Abas */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">🛡️ Consola do Gestor — Entidade: <span className="text-amber-400">{clienteAtivo.nome}</span></h2>
                  <p className="text-xs text-slate-400">Gestão centralizada de clientes, registo de faturas passadas e atribuição de recompensas.</p>
                </div>
                <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl gap-1 text-xs">
                  <button 
                    onClick={() => setAdminAba('historico')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${adminAba === 'historico' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    📥 Lançar Faturas (Ano Passado)
                  </button>
                  <button 
                    onClick={() => setAdminAba('equipa')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${adminAba === 'equipa' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    🎁 Atribuir Créditos a Funcionários
                  </button>
                  <button 
                    onClick={() => setAdminAba('clientes')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${adminAba === 'clientes' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    🏢 Clientes & CPEs
                  </button>
                </div>
              </div>

              {/* KPI Summary do Cliente para o Gestor */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-800 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Baseline Definitiva:</span>
                  <p className="text-base font-bold text-white mt-0.5">{clienteAtivo.baselineKwh} kWh/mês</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/20">
                  <span className="text-emerald-400 font-medium">Poupança Total Acumulada:</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">{totalKwhPoupados} kWh</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/20">
                  <span className="text-amber-400 font-medium">Créditos Gerados:</span>
                  <p className="text-base font-bold text-amber-400 mt-0.5">{totalCreditosGerados} pts</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-indigo-500/20">
                  <span className="text-indigo-400 font-medium">Créditos Atribuídos:</span>
                  <p className="text-base font-bold text-indigo-400 mt-0.5">{totalCreditosAtribuidos} pts</p>
                </div>
              </div>
            </div>

            {/* ABA 1: LANÇAR FATURAS / HISTÓRICO NO GESTOR */}
            {adminAba === 'historico' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-md font-bold text-white mb-1">📥 Lançamento de Faturas Anteriores pelo Gestor</h3>
                  <p className="text-xs text-slate-400 mb-4">Insira o consumo real mensal da entidade <strong className="text-amber-400">{clienteAtivo.nome}</strong> para apurar automaticamente os kWh poupados e os créditos.</p>

                  <form onSubmit={handleAddLeituraHistorica} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Período / Mês *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Janeiro 2025" 
                        value={histMesAno}
                        onChange={e => setHistMesAno(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Consumo Real na Fatura (kWh) *</label>
                      <input 
                        type="number" 
                        required
                        placeholder="Ex: 180" 
                        value={histKwh}
                        onChange={e => setHistKwh(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Contador / CPE Associado</label>
                      <select 
                        value={histCpe} 
                        onChange={e => setHistCpe(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      >
                        {clienteAtivo.postos.map(p => (
                          <option key={p.id} value={p.cpe}>{p.nome} ({p.cpe})</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button 
                        type="submit" 
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-950"
                      >
                        ⚡ Calcular & Registar Poupança
                      </button>
                    </div>
                  </form>
                </div>

                {/* Tabela de Leituras Registadas pelo Gestor */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-md font-bold text-white mb-4">Histórico de Faturas Registadas — {clienteAtivo.nome}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-3 px-3">PERÍODO</th>
                          <th className="py-3 px-3">CONTADOR (CPE)</th>
                          <th className="py-3 px-3">BASELINE</th>
                          <th className="py-3 px-3">CONSUMO REAL</th>
                          <th className="py-3 px-3 text-emerald-400">POUPANÇA (kWh)</th>
                          <th className="py-3 px-3 text-amber-400 text-right">CRÉDITOS GERADOS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {clienteAtivo.historicoLeituras?.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-500 italic">Nenhuma fatura lançada. Utilize o formulário acima para registar os valores de 2025.</td>
                          </tr>
                        ) : (
                          clienteAtivo.historicoLeituras?.map(h => (
                            <tr key={h.id}>
                              <td className="py-3.5 px-3 font-semibold text-white">{h.mesAno}</td>
                              <td className="py-3.5 px-3 font-mono text-slate-400">{h.cpe}</td>
                              <td className="py-3.5 px-3 text-slate-400">{clienteAtivo.baselineKwh} kWh</td>
                              <td className="py-3.5 px-3 text-slate-200 font-semibold">{h.kwhConsumidos} kWh</td>
                              <td className="py-3.5 px-3 text-emerald-400 font-bold">+{h.kwhPoupados} kWh</td>
                              <td className="py-3.5 px-3 text-amber-400 font-bold text-right">+{h.creditosGerados} pts</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: ATRIBUIR CRÉDITOS AOS FUNCIONÁRIOS NO GESTOR */}
            {adminAba === 'equipa' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-md font-bold text-white mb-1">🎁 Atribuição de Créditos aos Colaboradores</h3>
                  <p className="text-xs text-slate-400 mb-4">Registe os funcionários da empresa <strong className="text-amber-400">{clienteAtivo.nome}</strong> e distribua os pontos de recompensa resultantes das poupanças.</p>

                  <form onSubmit={handleAddFuncionario} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nome do Funcionário *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Maria Santos" 
                        value={funcNome}
                        onChange={e => setFuncNome(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Departamento / Área</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Administrativo, Loja" 
                        value={funcDept}
                        onChange={e => setFuncDept(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Créditos Atribuídos (pts)</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 200" 
                        value={funcCreditos}
                        onChange={e => setFuncCreditos(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        type="submit" 
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-950"
                      >
                        🏅 Lançar Créditos no Perfil
                      </button>
                    </div>
                  </form>
                </div>

                {/* Tabela de Funcionários */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-md font-bold text-white mb-4">Funcionários & Créditos Atribuídos — {clienteAtivo.nome}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-3 px-3">COLABORADOR</th>
                          <th className="py-3 px-3">DEPARTAMENTO</th>
                          <th className="py-3 px-3 text-right">CRÉDITOS ACUMULADOS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {clienteAtivo.funcionarios?.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-6 text-center text-slate-500 italic">Sem colaboradores registados. Adicione acima para iniciar a distribuição.</td>
                          </tr>
                        ) : (
                          clienteAtivo.funcionarios?.map(f => (
                            <tr key={f.id}>
                              <td className="py-3.5 px-3 font-semibold text-white">{f.nome}</td>
                              <td className="py-3.5 px-3 text-slate-400">{f.departamento}</td>
                              <td className="py-3.5 px-3 text-amber-400 font-bold text-right">{f.creditosGanhos} pts</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: GESTÃO DE CLIENTES E CPES */}
            {adminAba === 'clientes' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-md font-bold text-white mb-1">🔑 Criar Nova Entidade / Licenciamento</h3>
                  <p className="text-xs text-slate-400 mb-4">Registe novos clientes e configure o respetivo CPE inicial.</p>

                  <form onSubmit={handleCriarCliente} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nome da Entidade *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Empresa X"
                        value={novoNome}
                        onChange={e => setNovoNome(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Número do Contador (CPE)</label>
                      <input
                        type="text"
                        placeholder="Ex: PT0008000012345678AP"
                        value={novoCpe}
                        onChange={e => setNovoCpe(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Baseline Mensal (kWh)</label>
                      <input
                        type="number"
                        value={novoBaseline}
                        onChange={e => setNovoBaseline(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl text-xs transition"
                      >
                        🔑 Criar Entidade
                      </button>
                    </div>
                  </form>
                </div>

                {/* Tabela de Clientes */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-md font-bold text-white mb-4">Clientes & Contadores (CPEs) Gestão Central</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-3 px-3">ENTIDADE</th>
                          <th className="py-3 px-3">CHAVE API</th>
                          <th className="py-3 px-3 min-w-[320px]">CONTADORES / CPEs (GESTOR)</th>
                          <th className="py-3 px-3">BASELINE</th>
                          <th className="py-3 px-3 text-right">AÇÃO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {clientes.map(cli => (
                          <tr key={cli.id} className={cli.id === clienteAtivo?.id ? 'bg-amber-950/10' : ''}>
                            <td className="py-4 px-3 font-semibold text-white align-top">
                              {cli.nome}
                              {cli.id === clienteAtivo?.id && (
                                <span className="block text-[10px] text-emerald-400 mt-0.5">● Em Foco</span>
                              )}
                            </td>
                            <td className="py-4 px-3 font-mono text-amber-400 align-top">{cli.apiKey}</td>
                            <td className="py-4 px-3 align-top">
                              <div className="space-y-2">
                                {cli.postos.length === 0 ? (
                                  <span className="text-slate-500 italic">Nenhum CPE registado</span>
                                ) : (
                                  cli.postos.map(posto => (
                                    <div key={posto.id} className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col gap-1">
                                      {editingPosto?.postoId === posto.id ? (
                                        <div className="space-y-2">
                                          <input 
                                            type="text"
                                            placeholder="Nome Local"
                                            value={editingPosto.nome}
                                            onChange={e => setEditingPosto({ ...editingPosto, nome: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                                          />
                                          <input 
                                            type="text"
                                            value={editingPosto.cpe}
                                            onChange={e => setEditingPosto({ ...editingPosto, cpe: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs font-mono text-amber-400"
                                          />
                                          <div className="flex gap-2">
                                            <button 
                                              onClick={() => handleSaveEditedCpe(cli.id, posto.id)}
                                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-[10px]"
                                            >
                                              Guardar
                                            </button>
                                            <button 
                                              onClick={() => setEditingPosto(null)}
                                              className="text-slate-400 text-[10px] hover:underline"
                                            >
                                              Cancelar
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex justify-between items-center gap-2">
                                          <div>
                                            <span className="text-slate-300 font-medium block">{posto.nome}:</span>
                                            <span className="font-mono text-amber-400 font-semibold">{posto.cpe}</span>
                                          </div>
                                          <button 
                                            onClick={() => setEditingPosto({ clientId: cli.id, postoId: posto.id, cpe: posto.cpe, nome: posto.nome })}
                                            className="text-slate-400 hover:text-amber-400 p-1 border border-slate-800 hover:border-amber-500/50 rounded bg-slate-900 transition"
                                            title="Editar / Corrigir CPE"
                                          >
                                            ✏️
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}

                                {addingCpeForClient === cli.id ? (
                                  <div className="p-2 bg-slate-950 border border-amber-500/40 rounded-lg space-y-2 mt-2">
                                    <span className="text-[10px] text-amber-400 font-semibold block">+ Novo Contador para {cli.nome}</span>
                                    <input 
                                      type="text" 
                                      placeholder="Nome (Ex: Garagem, Sede)"
                                      value={newNomeInput}
                                      onChange={e => setNewNomeInput(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                                    />
                                    <input 
                                      type="text" 
                                      placeholder="Número CPE (PT0008000...)"
                                      value={newCpeInput}
                                      onChange={e => setNewCpeInput(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs font-mono text-amber-400"
                                    />
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => handleAddCpeInAdmin(cli.id)}
                                        className="bg-amber-600 hover:bg-amber-500 text-white px-2 py-1 rounded text-[10px]"
                                      >
                                        Adicionar CPE
                                      </button>
                                      <button 
                                        onClick={() => setAddingCpeForClient(null)}
                                        className="text-slate-400 text-[10px] hover:underline"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      setAddingCpeForClient(cli.id);
                                      setNewCpeInput('');
                                      setNewNomeInput('');
                                    }}
                                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 mt-1 hover:underline"
                                  >
                                    <span>+ Adicionar CPE a {cli.nome}</span>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-3 text-slate-400 align-top">{cli.baselineKwh} kWh</td>
                            <td className="py-4 px-3 text-right align-top">
                              <button
                                onClick={() => setClienteAtivoId(cli.id)}
                                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                                  cli.id === clienteAtivo?.id
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                }`}
                              >
                                {cli.id === clienteAtivo?.id ? 'Ativo em Foco' : 'Selecionar Cliente'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VISTA PORTAL CLIENTE (DASHBOARD LIMPO APENAS PARA CONSULTA) */
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Portal do Cliente — {clienteAtivo.nome}</h2>
                  <p className="text-xs text-slate-400 mt-1">Chave API: <span className="font-mono text-amber-400">{clienteAtivo.apiKey}</span></p>
                </div>
                <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl gap-1 text-xs">
                  <button 
                    onClick={() => setClienteAba('historico')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${clienteAba === 'historico' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    📊 Poupança Acumulada
                  </button>
                  <button 
                    onClick={() => setClienteAba('equipa')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${clienteAba === 'equipa' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    👥 Créditos Colaboradores
                  </button>
                  <button 
                    onClick={() => setClienteAba('postos')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${clienteAba === 'postos' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    🔌 Postos Registados
                  </button>
                </div>
              </div>

              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400">Baseline Mensal</p>
                  <p className="text-xl font-bold text-white mt-1">{clienteAtivo.baselineKwh} <span className="text-xs text-slate-400">kWh/mês</span></p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30">
                  <p className="text-xs text-emerald-400 font-medium">Total kWh Poupados</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{totalKwhPoupados} <span className="text-xs text-emerald-300/60">kWh</span></p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
                  <p className="text-xs text-amber-400 font-medium">Créditos Gerados</p>
                  <p className="text-xl font-bold text-amber-400 mt-1">{totalCreditosGerados} <span className="text-xs text-amber-300/60">pts</span></p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400">Créditos Atribuídos à Equipa</p>
                  <p className="text-xl font-bold text-indigo-400 mt-1">{totalCreditosAtribuidos} <span className="text-xs text-slate-400">pts</span></p>
                </div>
              </div>
            </div>

            {/* Abas de Consulta do Cliente */}
            {clienteAba === 'historico' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-md font-bold text-white mb-4">Relatório de Poupança de Energia & Créditos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 px-3">PERÍODO</th>
                        <th className="py-3 px-3">CONTADOR (CPE)</th>
                        <th className="py-3 px-3">BASELINE METRIC</th>
                        <th className="py-3 px-3">CONSUMO REAL</th>
                        <th className="py-3 px-3 text-emerald-400">POUPANÇA (kWh)</th>
                        <th className="py-3 px-3 text-amber-400 text-right">CRÉDITOS OBTIDOS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {clienteAtivo.historicoLeituras?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500 italic">Ainda não existem faturas validadas pelo Gestor.</td>
                        </tr>
                      ) : (
                        clienteAtivo.historicoLeituras?.map(h => (
                          <tr key={h.id}>
                            <td className="py-3.5 px-3 font-semibold text-white">{h.mesAno}</td>
                            <td className="py-3.5 px-3 font-mono text-slate-400">{h.cpe}</td>
                            <td className="py-3.5 px-3 text-slate-400">{clienteAtivo.baselineKwh} kWh</td>
                            <td className="py-3.5 px-3 text-slate-200 font-semibold">{h.kwhConsumidos} kWh</td>
                            <td className="py-3.5 px-3 text-emerald-400 font-bold">+{h.kwhPoupados} kWh</td>
                            <td className="py-3.5 px-3 text-amber-400 font-bold text-right">+{h.creditosGerados} pts</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {clienteAba === 'equipa' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-md font-bold text-white mb-4">Quadro de Honra & Créditos dos Colaboradores</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 px-3">COLABORADOR</th>
                        <th className="py-3 px-3">DEPARTAMENTO</th>
                        <th className="py-3 px-3 text-right">CRÉDITOS GANHOS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {clienteAtivo.funcionarios?.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-slate-500 italic">Nenhum crédito atribuído de momento.</td>
                        </tr>
                      ) : (
                        clienteAtivo.funcionarios?.map(f => (
                          <tr key={f.id}>
                            <td className="py-3.5 px-3 font-semibold text-white">{f.nome}</td>
                            <td className="py-3.5 px-3 text-slate-400">{f.departamento}</td>
                            <td className="py-3.5 px-3 text-indigo-400 font-bold text-right">{f.creditosGanhos} pts</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {clienteAba === 'postos' && (
              <PostosList 
                postos={clienteAtivo.postos} 
                readOnly={true}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
