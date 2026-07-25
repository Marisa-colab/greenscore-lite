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
    nome: 'Empresa Lda',
    email: 'contacto@mail.pt',
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
    nomePosto: 'Posto 1',
    cpe: 'PT0002000012345678FA',
    funcionarioResponsavel: 'responsavel',
  },
  {
    id: 102,
    clienteId: 1,
    nomePosto: 'Posto 2',
    cpe: 'PT0002000088888888FB',
    funcionarioResponsavel: 'responsavelnome',
  }
];

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'admin' | 'cliente-input' | 'cliente-resultados'>('admin');
  
  const [clientes, setClientes] = useState<Utilizador[]>(DADOS_INICIAIS_CLIENTES);
  const [clienteAtivoId, setClienteAtivoId] = useState<number>(1);
  const [mostrarFormNovoCliente, setMostrarFormNovoCliente] = useState(false);
  const [novoNomeEmpresa, setNovoNomeEmpresa] = useState('');
  const [novoEmailEmpresa, setNovoEmailEmpresa] = useState('');

   const [postos, setPostos] = useState<Posto[]>(DADOS_INICIAIS_POSTOS);
  const [mostrarFormNovoPosto, setMostrarFormNovoPosto] = useState(false);
  const [novoNomePosto, setNovoNomePosto] = useState('');
  const [novoCpe, setNovoCpe] = useState('');
  const [novoFuncionario, setNovoFuncionario] = useState('');

  const utilizadorAtual = clientes.find((c) => Number(c.id) === clienteAtivoId) || clientes[0];
  const postosDoCliente = postos.filter((p) => p.clienteId === clienteAtivoId);

    const adicionarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNomeEmpresa || !novoEmailEmpresa) {
      alert("Por favor preencha o Nome e o Email da Empresa.");
      return;
    }

    const novoId = Date.now();
    const novoCliente: Utilizador = {
      id: novoId,
      nome: novoNomeEmpresa,
      email: novoEmailEmpresa,
      cpe: 'A definir',
      creditos_acumulados: 0,
      role: 'cliente',
      licencaAtiva: true,
      dataInicioLicenca: new Date().toISOString().split('T')[0],
      duracaoMeses: 12,
    };

    setClientes([...clientes, novoCliente]);
    setClienteAtivoId(novoId);
    setNovoNomeEmpresa('');
    setNovoEmailEmpresa('');
    setMostrarFormNovoCliente(false);
    alert(`Empresa "${novoCliente.nome}" criada com sucesso!`);
  };

   const alternarLicenca = (id: number) => {
    setClientes(clientes.map((c) => 
      c.id === id ? { ...c, licencaAtiva: !c.licencaAtiva } : c
    ));
  };

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
  
  const exportarParaExcel = () => {
    const dadosExcel = clientes.map(c => {
      const postosEmpresa = postos.filter(p => p.clienteId === c.id);
      return {
        'ID Cliente': c.id,
        'Nome Empresa': c.nome,
        'Email': c.email,
        'Licença Ativa': c.licencaAtiva ? 'Sim' : 'Não',
        'Início Licença': c.dataInicioLicenca || 'N/A',
        'Duração (Meses)': c.duracaoMeses || 12,
        'Total Postos': postosEmpresa.length,
        'Lista de Postos': postosEmpresa.map(p => `${p.nomePosto} (${p.cpe})`).join('; ')
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorio_Geral');
    XLSX.writeFile(workbook, 'GreenScore_Relatorio_Empresas.xlsx');
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
                  {c.nome} ({postos.filter(p => p.clienteId === c.id).length} Postos)
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
            
            {/* CABEÇALHO ADMIN E AÇÕES GERAIS */}
            <div className="flex justify-between items-center flex-wrap gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div>
                <h1 className="text-2xl font-bold">🛡️ Consola Máxima (Super Admin)</h1>
                <p className="text-xs text-slate-400">Gestão central de empresas, licenças, postos e exportação de dados.</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={exportarParaExcel}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 shadow"
                >
                  📊 Exportar Relatório Excel
                </button>
                <button 
                  onClick={() => setMostrarFormNovoCliente(!mostrarFormNovoCliente)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition-all shadow"
                >
                  {mostrarFormNovoCliente ? '✕ Cancelar' : '🏢 + Adicionar Nova Empresa'}
                </button>
              </div>
            </div>

            {/* FORMULÁRIO PARA CRIAR EMPRESA */}
            {mostrarFormNovoCliente && (
              <form onSubmit={adicionarCliente} className="bg-slate-900 p-5 rounded-2xl border border-emerald-500/40 space-y-3">
                <h3 className="text-sm font-bold text-emerald-400 uppercase">Cadastrar Nova Empresa / Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Nome da Empresa / Entidade</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Empresa XYZ Unipessoal" 
                      value={novoNomeEmpresa} 
                      onChange={(e) => setNovoNomeEmpresa(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Email de Contacto</label>
                    <input 
                      type="email" 
                      placeholder="Ex: contacto@empresa.pt" 
                      value={novoEmailEmpresa} 
                      onChange={(e) => setNovoEmailEmpresa(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2 rounded-lg">
                    Guardar Empresa
                  </button>
                </div>
              </form>
            )}

            {/* LISTA DE EMPRESAS & GESTÃO DE LICENÇAS */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">🏢 Gestão de Empresas e Licenças</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientes.map((c) => {
                  const numPostos = postos.filter(p => p.clienteId === c.id).length;
                  const licencaOk = verificarLicenca(c);
                  return (
                    <div 
                      key={c.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        c.id === clienteAtivoId 
                          ? 'bg-slate-950 border-emerald-500/80 shadow-md' 
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-sm text-white">{c.nome}</h3>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          licencaOk ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {licencaOk ? 'Licença Ativa' : 'Licença Inativa'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1 mb-3">
                        <p>📍 Total de Postos: <strong className="text-slate-200">{numPostos}</strong></p>
                        <p>📅 Validade: <strong className="text-slate-200">{c.dataInicioLicenca} ({c.duracaoMeses} meses)</strong></p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
                        <button 
                          onClick={() => setClienteAtivoId(c.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                            c.id === clienteAtivoId 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {c.id === clienteAtivoId ? '✓ Selecionada' : 'Gerir esta Empresa'}
                        </button>

                        <button 
                          onClick={() => alternarLicenca(c.id)}
                          className="text-xs text-slate-400 hover:text-white underline font-medium"
                        >
                          {c.licencaAtiva ? 'Desativar Licença' : 'Ativar Licença'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition-all shadow"
                >
                  {mostrarFormNovoPosto ? '✕ Cancelar' : '📍 + Adicionar Novo Posto / Contador'}
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
                        placeholder="Ex: responsavel" 
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
                {postosDoCliente.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Nenhum posto associado a esta empresa ainda.</p>
                ) : (
                  postosDoCliente.map((p) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: INTRODUÇÃO DE DADOS POR POSTO */}
        {abaAtiva === 'dados-input' && temAcesso && (
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
        {abaAtiva === 'dados-resultados' && temAcesso && (
          <DadosPortal 
            utilizadorAtual={utilizadorAtual} 
            onVoltarAdmin={() => setAbaAtiva('admin')} 
          />
        )}

      </main>
    </div>
  );
}
