import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Utilizador } from './types';
import { ClientPortal } from './components/ClientPortal';

interface Posto {
  id: number;
  clienteId: number;
  nomePosto: string;
  cpe: string;
  funcionarioResponsavel: string;
}

function verificarLicenca(u: Utilizador): boolean {
  if (!u) return false;
  if (u.licencaAtiva === false) return false;
  if (!u.dataInicioLicenca || !u.duracaoMeses) return u.licencaAtiva;

  const inicio = new Date(u.dataInicioLicenca);
  const fim = new Date(inicio);
  fim.setMonth(fim.getMonth() + u.duracaoMeses);

  return new Date() <= fim;
}

const DADOS_INICIAIS_CLIENTES: Utilizador[] = [
  {
    id: 1,
    nome: 'Empresa PS-Açores',
    email: 'contacto@psacores.pt',
    cpe: 'PT0002000012345678FA',
    creditos_acumulados: 142,
    role: 'cliente',
    licencaAtiva: true,
    dataInicioLicenca: '2026-01-01',
    duracaoMeses: 12,
  }
];

const DADOS_INICIAIS_POSTOS: Posto[] = [
  {
    id: 101,
    clienteId: 1,
    nomePosto: 'Posto Angra do Heroísmo',
    cpe: 'PT0002000012345678FA',
    funcionarioResponsavel: 'Zélia',
  },
  {
    id: 102,
    clienteId: 1,
    nomePosto: 'Posto Praia da Vitória',
    cpe: 'PT0002000088888888FB',
    funcionarioResponsavel: 'Ricardo',
  }
];

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'admin' | 'cliente-input' | 'cliente-resultados'>('admin');
  const [clientes] = useState<Utilizador[]>(DADOS_INICIAIS_CLIENTES);
  const [clienteAtivoId, setClienteAtivoId] = useState<number>(1);
  
  // Estado dos Postos / Contadores
  const [postos, setPostos] = useState<Posto[]>(DADOS_INICIAIS_POSTOS);
  const [mostrarFormNovoPosto, setMostrarFormNovoPosto] = useState(false);

  // Formulário de Novo Posto
  const [novoNomePosto, setNovoNomePosto] = useState('');
  const [novoCpe, setNovoCpe] = useState('');
  const [novoFuncionario, setNovoFuncionario] = useState('');

  const utilizadorAtual = clientes.find((c) => Number(c.id) === clienteAtivoId) || clientes[0];
  const postosDoCliente = postos.filter((p) => p.clienteId === clienteAtivoId);

  // Adicionar Novo Posto
  const adicionarPosto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNomePosto || !novoCpe) {
      alert("Por favor preencha pelo menos o Nome do Posto e o CPE.");
      return;
    }

    const novo: Posto = {
      id: Date.now(),
      clienteId: clienteAtivoId,
      nomePosto: novoNomePosto,
      cpe: novoCpe,
      funcionarioResponsavel: novoFuncionario || 'Não atribuído',
    };

    setPostos([...postos, novo]);
    setNovoNomePosto('');
    setNovoCpe('');
    setNovoFuncionario('');
    setMostrarFormNovoPosto(false);
    alert(`Posto "${novo.nomePosto}" adicionado com sucesso!`);
  };

  const temAcesso = utilizadorAtual ? verificarLicenca(utilizadorAtual) : false;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      
      {/* BARRA SUPERIOR */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            🌱 GreenScore Lite
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Cliente Ativo:</span>
            <select 
              value={clienteAtivoId} 
              onChange={(e) => setClienteAtivoId(Number(e.target.value))}
              className="bg-slate-900 text-emerald-400 text-xs font-semibold px-2 py-1 rounded border border-slate-700 focus:outline-none cursor-pointer"
            >
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({postosDoCliente.length} Postos)
                </option>
              ))}
            </select>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setAbaAtiva('admin')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'admin' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Consola Admin
            </button>
            <button 
              onClick={() => setAbaAtiva('cliente-input')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'cliente-input' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Introduzir Dados
            </button>
            <button 
              onClick={() => setAbaAtiva('cliente-resultados')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'cliente-resultados' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Relatórios & Resultados
            </button>
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* ABA 1: CONSOLA ADMIN */}
        {abaAtiva === 'admin' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">🛡️ Consola Máxima (Super Admin)</h1>

            {/* GESTÃO DE POSTOS / CONTADORES DO CLIENTE ATIVO */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Postos / Contadores de <span className="text-emerald-400">{utilizadorAtual.nome}</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Gerir os locais de medição e os funcionários responsáveis de cada posto.
                  </p>
                </div>

                <button 
                  onClick={() => setMostrarFormNovoPosto(!mostrarFormNovoPosto)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-semibold transition-all shadow"
                >
                  {mostrarFormNovoPosto ? '✕ Cancelar' : '➕ Adicionar Novo Posto / Contador'}
                </button>
              </div>

              {/* FORMULÁRIO PARA CRIAR POSTO */}
              {mostrarFormNovoPosto && (
                <form onSubmit={adicionarPosto} className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3 mt-3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase">Novo Contador / Instalação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Nome do Posto / Local</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Posto Angra / Posto Praia" 
                        value={novoNomePosto} 
                        onChange={(e) => setNovoNomePosto(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">CPE da Instalação</label>
                      <input 
                        type="text" 
                        placeholder="Ex: PT0002000012345678FA" 
                        value={novoCpe} 
                        onChange={(e) => setNovoCpe(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Funcionário Responsável</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Maria Silva" 
                        value={novoFuncionario} 
                        onChange={(e) => setNovoFuncionario(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                      Guardar Posto
                    </button>
                  </div>
                </form>
              )}

              {/* LISTA DE POSTOS CADASTRADOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {postosDoCliente.map((p) => (
                  <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-emerald-300">📍 {p.nomePosto}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        CPE: {p.cpe}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      👤 Funcionário Responsável: <strong className="text-slate-200">{p.funcionarioResponsavel}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: INTRODUÇÃO DE DADOS POR POSTO */}
        {abaAtiva === 'cliente-input' && temAcesso && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white">Introduzir Fatura / Leitura do Contador</h2>
            
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-semibold">Selecionar Posto / Contador</label>
                <select className="w-full bg-slate-900 border border-slate-700 text-emerald-400 text-sm font-semibold rounded-lg p-2.5 focus:outline-none">
                  {postosDoCliente.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nomePosto} ({p.cpe}) — Resp: {p.funcionarioResponsavel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Consumo do Mês (kWh)</label>
                  <input type="number" placeholder="Ex: 4200" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Valor da Fatura (€)</label>
                  <input type="number" placeholder="Ex: 620.50" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm" />
                </div>
              </div>

              <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all">
                Submeter Leitura do Posto
              </button>
            </div>
          </div>
        )}

        {/* ABA 3: DASHBOARD */}
        {abaAtiva === 'cliente-resultados' && temAcesso && (
          <ClientPortal 
            utilizadorAtual={utilizadorAtual} 
            onVoltarAdmin={() => setAbaAtiva('admin')} 
          />
        )}

      </main>
    </div>
  );
}
