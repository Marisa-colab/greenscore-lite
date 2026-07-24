import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Utilizador } from './types';
import { ClientPortal } from './components/ClientPortal';

// Função de verificação de licença
function verificarLicenca(u: Utilizador): boolean {
  if (!u) return false;
  if (u.licencaAtiva === false) return false;
  if (!u.dataInicioLicenca || !u.duracaoMeses) return u.licencaAtiva;

  const inicio = new Date(u.dataInicioLicenca);
  const fim = new Date(inicio);
  fim.setMonth(fim.getMonth() + u.duracaoMeses);

  return new Date() <= fim;
}

// Dados de exemplo com IDs numéricos (de acordo com o types.ts)
const DADOS_INICIAIS: Utilizador[] = [
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
  },
  {
    id: 2,
    nome: 'Cliente Exemplo (Expirado)',
    email: 'suporte@expirado.com',
    cpe: 'PT0002000087654321FB',
    creditos_acumulados: 0,
    role: 'cliente',
    licencaAtiva: false,
    dataInicioLicenca: '2024-01-01',
    duracaoMeses: 12,
  }
];

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'admin' | 'cliente-input' | 'cliente-resultados'>('admin');

  // Estado dos Clientes
  const [clientes, setClientes] = useState<Utilizador[]>(() => {
    const saved = localStorage.getItem('gs_clientes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Erro ao carregar do localStorage:", e);
      }
    }
    return DADOS_INICIAIS;
  });

  // ID do cliente selecionado (Padrão: 1)
  const [clienteAtivoId, setClienteAtivoId] = useState<number>(1);

  // Cliente atual selecionado
  const utilizadorAtual = clientes.find((c) => c.id === clienteAtivoId) || clientes[0];

  // Função para alternar o estado da licença diretamente na consola Admin
  const alternarEstadoLicenca = (id: number) => {
    const novosClientes = clientes.map((c) => {
      if (c.id === id) {
        return { ...c, licencaAtiva: !c.licencaAtiva };
      }
      return c;
    });
    setClientes(novosClientes);
    localStorage.setItem('gs_clientes', JSON.stringify(novosClientes));
  };

  // Leitura de ficheiro Excel
  const carregarExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const ficheiro = event.target.files?.[0];
    if (!ficheiro) return;

    const leitor = new FileReader();
    leitor.onload = (e) => {
      try {
        const dados = new Uint8Array(e.target?.result as ArrayBuffer);
        const livro = XLSX.read(dados, { type: 'array' });
        const primeiraFolha = livro.Sheets[livro.SheetNames[0]];
        const dadosConvertidos = XLSX.utils.sheet_to_json(primeiraFolha);

        alert(`Sucesso! ${dadosConvertidos.length} registos lidos de ${ficheiro.name}`);
      } catch (erro) {
        alert("Erro ao processar ficheiro Excel.");
      }
    };
    leitor.readAsArrayBuffer(ficheiro);
  };

  const temAcesso = utilizadorAtual ? verificarLicenca(utilizadorAtual) : false;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      
      {/* BARRA DE NAVEGAÇÃO SUPERIOR */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            🌱 GreenScore Lite
          </div>

          {/* MENU DE SELEÇÃO RÁPIDA DE CLIENTE (ADMIN) */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Cliente Ativo:</span>
            <select 
              value={clienteAtivoId} 
              onChange={(e) => setClienteAtivoId(Number(e.target.value))}
              className="bg-slate-900 text-emerald-400 text-xs font-semibold px-2 py-1 rounded border border-slate-700 focus:outline-none cursor-pointer"
            >
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({verificarLicenca(c) ? 'Ativa' : 'Expirada'})
                </option>
              ))}
            </select>
          </div>

          {/* ABAS DO SISTEMA */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setAbaAtiva('admin')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'admin' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Consola Admin
            </button>

            <button 
              onClick={() => setAbaAtiva('cliente-input')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'cliente-input' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Introduzir Dados
            </button>

            <button 
              onClick={() => setAbaAtiva('cliente-resultados')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'cliente-resultados' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Relatórios & Resultados
            </button>
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="p-6 max-w-7xl mx-auto">

        {/* ABA 1: CONSOLA ADMIN */}
        {abaAtiva === 'admin' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">🛡️ Consola Máxima (Super Admin)</h1>

            {/* Importação Excel */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <h2 className="font-semibold text-slate-200 mb-2">Importar Faturas / Dados (Excel)</h2>
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={carregarExcel}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
            </div>

            {/* Gestão e Controlo de Licenças */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <h2 className="font-semibold text-slate-200 mb-4">Gestão de Licenças e Clientes</h2>
              <div className="space-y-3">
                {clientes.map((c) => {
                  const ativa = verificarLicenca(c);
                  const selecionado = c.id === clienteAtivoId;
                  return (
                    <div 
                      key={c.id} 
                      className={`flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg border transition-all gap-4 ${
                        selecionado ? 'bg-slate-900 border-emerald-500/50 shadow-md' : 'bg-slate-900/60 border-slate-700/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-100">{c.nome}</p>
                          {selecionado && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                              SELECIONADO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {c.email} | CPE: {c.cpe} | Início: {c.dataInicioLicenca} ({c.duracaoMeses} meses)
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Botão para ativar/desativar com 1 clique */}
                        <button
                          onClick={() => alternarEstadoLicenca(c.id)}
                          className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                            ativa 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30' 
                              : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'
                          }`}
                        >
                          {ativa ? '✓ Licença Ativa (Clique p/ Expirar)' : '✕ Expirada (Clique p/ Ativar)'}
                        </button>

                        {/* Botão Selecionar e Ver Vista */}
                        <button 
                          onClick={() => {
                            setClienteAtivoId(c.id);
                            setAbaAtiva('cliente-resultados');
                          }}
                          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded transition-colors"
                        >
                          Ver Vista Deste Cliente →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* BLOQUEIO DE SEGURANÇA (APENAS PARA VISTA DE CLIENTE COM LICENÇA EXPIRADA) */}
        {abaAtiva !== 'admin' && !temAcesso && (
          <div className="min-h-[50vh] flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-red-500/30 rounded-xl p-8 max-w-md text-center shadow-xl">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🚫
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Acesso Indisponível</h2>
              <p className="text-slate-300 text-sm mb-6">
                A licença associada à entidade <strong className="text-white">{utilizadorAtual?.nome}</strong> encontra-se expirada ou inativa.
              </p>
              <button 
                onClick={() => setAbaAtiva('admin')}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-4 py-2 rounded-lg font-medium transition-all mb-4"
              >
                ← Voltar à Consola Admin para Ativar Licença
              </button>
            </div>
          </div>
        )}

        {/* ABA 2: INTRODUÇÃO DE DADOS */}
        {abaAtiva === 'cliente-input' && temAcesso && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-2">Carregamento de Dados e Faturas</h2>
              <p className="text-sm text-slate-400 mb-6">
                Entidade Ativa: <strong className="text-emerald-400">{utilizadorAtual?.nome}</strong>
              </p>
              
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">CPE da Instalação</label>
                    <input 
                      type="text" 
                      disabled 
                      value={utilizadorAtual?.cpe || ''} 
                      className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-lg p-2.5 text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Créditos Acumulados</label>
                    <input 
                      type="text" 
                      disabled 
                      value={`${utilizadorAtual?.creditos_acumulados || 0} Créditos Verdes`} 
                      className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-lg p-2.5 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <label className="block text-xs text-slate-300 font-semibold mb-2">Submeter Leitura do Mês (kWh)</label>
                  <div className="flex gap-3">
                    <input 
                      type="number" 
                      placeholder="Ex: 10200" 
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm flex-1 focus:outline-none focus:border-emerald-500"
                    />
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all">
                      Guardar Leitura
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: DASHBOARD DO CLIENTE */}
        {abaAtiva === 'cliente-resultados' && temAcesso && (
          <ClientPortal utilizadorAtual={utilizadorAtual} />
        )}

      </main>
    </div>
  );
}
