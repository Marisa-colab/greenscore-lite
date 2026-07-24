import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Utilizador } from './types';
import { verificarLicenca } from './utils/licenca';
import { ClientPortal } from './components/ClientPortal';

// Dados de exemplo para inicialização caso o localStorage esteja vazio
const DADOS_INICIAIS: Utilizador[] = [
  {
    id: 'cli_ps_acores',
    nome: 'Empresa Açores S.A.',
    email: 'contacto@empresaacores.pt',
    role: 'CLIENTE',
    licencaAtiva: true,
    dataInicioLicenca: '2026-01-01',
    duracaoMeses: 12,
  },
  {
    id: 'cli_exemplo_expirado',
    nome: 'Cliente Exemplo (Expirado)',
    email: 'suporte@expirado.com',
    role: 'CLIENTE',
    licencaAtiva: false,
    dataInicioLicenca: '2024-01-01',
    duracaoMeses: 12,
  }
];

export default function App() {
  // 1. ESTADOS DA APLICAÇÃO
  // Controla a aba ativa: 'admin' (Aba 1) | 'cliente-input' (Aba 2) | 'cliente-resultados' (Aba 3)
  const [abaAtiva, setAbaAtiva] = useState<'admin' | 'cliente-input' | 'cliente-resultados'>('cliente-resultados');

  // Estado dos Clientes (carrega do localStorage ou usa os dados iniciais)
  const [clientes, setClientes] = useState<Utilizador[]>(() => {
    const saved = localStorage.getItem('gs_clientes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Erro ao carregar clientes do localStorage:", e);
      }
    }
    return DADOS_INICIAIS;
  });

  // ID do cliente atualmente selecionado
  const [clienteAtivoId, setClienteAtivoId] = useState<string>('cli_ps_acores');

  // Cliente atual selecionado com base no ID
  const utilizadorAtual = clientes.find((c) => c.id.toString() === clienteAtivoId);

  // 2. FUNÇÃO DE IMPORTAÇÃO DE EXCEL (ADMIN)
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

        console.log("Dados do Excel lidos:", dadosConvertidos);
        alert(`Sucesso! ${dadosConvertidos.length} registos lidos de ${ficheiro.name}`);
      } catch (erro) {
        console.error("Erro ao ler excel:", erro);
        alert("Erro ao processar ficheiro Excel.");
      }
    };
    leitor.readAsArrayBuffer(ficheiro);
  };

  // Verifica se a licença do cliente selecionado está válida
  const temAcesso = utilizadorAtual ? verificarLicenca(utilizadorAtual) : false;

  // 3. INTERFACE PRINCIPAL
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      
      {/* BARRA DE NAVEGAÇÃO SUPERIOR (3 ABAS) */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            🌱 GreenScore Lite
          </div>

          {/* BOTOES DAS 3 ABAS */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setAbaAtiva('admin')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'admin' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Consola Admin (Acesso Total)
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

            {/* Importador de Excel */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <h2 className="font-semibold text-slate-200 mb-2">Importar Faturas / Dados (Excel)</h2>
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={carregarExcel}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
            </div>

            {/* Tabela de Gestão de Licenças */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <h2 className="font-semibold text-slate-200 mb-4">Gestão de Licenças de Clientes</h2>
              <div className="space-y-3">
                {clientes.map((c) => {
                  const ativa = verificarLicenca(c);
                  return (
                    <div key={c.id} className="flex justify-between items-center bg-slate-900 p-4 rounded-lg border border-slate-700">
                      <div>
                        <p className="font-medium text-slate-100">{c.nome}</p>
                        <p className="text-xs text-slate-400">{c.email} | Início: {c.dataInicioLicenca} ({c.duracaoMeses} meses)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded text-xs font-semibold ${ativa ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {ativa ? 'Ativa' : 'Expirada'}
                        </span>
                        <button 
                          onClick={() => {
                            setClienteAtivoId(c.id);
                            setAbaAtiva('cliente-resultados');
                          }}
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-600 transition-colors"
                        >
                          Testar Vista Deste Cliente
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VERIFICAÇÃO DE LICENÇA PARA AS ABAS DO CLIENTE (2 E 3) */}
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
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-xs text-slate-400 mb-6 text-left space-y-2">
                <p className="flex justify-between">
                  <span>Início do Contrato:</span>
                  <strong className="text-slate-200">{utilizadorAtual?.dataInicioLicenca}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Duração Contratada:</span>
                  <strong className="text-slate-200">{utilizadorAtual?.duracaoMeses} meses</strong>
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
        )}

        {/* ABA 2: CARREGAMENTO DE DADOS PELO CLIENTE (SE LICENÇA ATIVA) */}
        {abaAtiva === 'cliente-input' && temAcesso && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-2">Carregamento de Dados e Faturas</h2>
              <p className="text-sm text-slate-400 mb-6">
                Entidade: <strong className="text-emerald-400">{utilizadorAtual?.nome}</strong>
              </p>
              
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Início da Licença (Read-Only)</label>
                    <input 
                      type="text" 
                      disabled 
                      value={utilizadorAtual?.dataInicioLicenca || ''} 
                      className="w-full bg-slate-900 border border-slate-800 text-slate-500 rounded-lg p-2.5 text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Duração Contratada</label>
                    <input 
                      type="text" 
                      disabled 
                      value={`${utilizadorAtual?.duracaoMeses || 12} Meses`} 
                      className="w-full bg-slate-900 border border-slate-800 text-slate-500 rounded-lg p-2.5 text-sm cursor-not-allowed"
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

        {/* ABA 3: RELATÓRIOS E RESULTADOS (SE LICENÇA ATIVA) */}
        {abaAtiva === 'cliente-resultados' && temAcesso && (
          <ClientPortal utilizadorAtual={utilizadorAtual} />
        )}

      </main>
    </div>
  );
}
