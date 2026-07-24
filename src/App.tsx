import React, { useState } from 'react';
import { verificarLicenca } from './utils';
import { Utilizador } from './types';
import * as XLSX from 'xlsx';

// 1. DADOS INICIAIS DE EXEMPLO (Caso o localStorage esteja vazio)
const DADOS_INICIAIS: Utilizador[] = [
  {
    id: 'cli_ps_acores',
    nome: 'Empresa Açores S.A.',
    email: 'contacto@empresaacores.pt',
    role: 'cliente',
    licencaAtiva: true,
    dataInicioLicenca: '2026-01-01',
    duracaoMeses: 12,
  },
  {
    id: 'cli_expirado_test',
    nome: 'Cliente Exemplo (Expirado)',
    email: 'suporte@expirado.com',
    role: 'cliente',
    licencaAtiva: false,
    dataInicioLicenca: '2026-01-01',
    duracaoMeses: 12,
  }
];

export default function App() {
  // 2. ESTADOS
  const [vista, setVista] = useState<'admin' | 'cliente'>('admin');

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

  // 3. FUNÇÃO DE IMPORTAÇÃO DE EXCEL
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

  // 4. VERIFICAÇÃO DE LICENÇA E SEGURANÇA
  const utilizadorAtual = clientes.find((c) => c.id.toString() === clienteAtivoId);

  // Se estivermos na vista de cliente e a licença estiver expirada, bloqueia o ecrã
  
  if (vista === 'cliente' && utilizadorAtual) {
    const temAcesso = verificarLicenca(utilizadorAtual);

    if (!temAcesso) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-red-500/30 rounded-xl p-8 max-w-md text-center shadow-xl">
            {/* Ícone de Alerta */}
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🚫
            </div>

            {/* Título */}
            <h2 className="text-xl font-bold text-white mb-2">
              Acesso Indisponível
            </h2>

            {/* Descrição */}
            <p className="text-slate-300 text-sm mb-6">
              A licença associada à entidade <strong className="text-white">{utilizadorAtual.nome}</strong> encontra-se expirada ou inativa.
            </p>

            {/* Detalhes da Licença */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-xs text-slate-400 mb-6 text-left space-y-2">
              <p className="flex justify-between">
                <span>Início do Contrato:</span>
                <strong className="text-slate-200">{utilizadorAtual.dataInicioLicenca}</strong>
              </p>
              <p className="flex justify-between">
                <span>Duração Contratada:</span>
                <strong className="text-slate-200">{utilizadorAtual.duracaoMeses} meses</strong>
              </p>
              <p className="flex justify-between">
                <span>Estado do Acesso:</span>
                <strong className="text-red-400">Expirado</strong>
              </p>
            </div>

            <p className="text-xs text-slate-400">
              Por favor, entre em contacto com a administração do GreenScore Lite para proceder à renovação da subscrição.
            </p>
          </div>
        </div>
      );
    }
  }
  // 5. INTERFACE
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      
      {/* Barra de Navegação Superior */}
      <nav className="bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center">
        <div className="text-xl font-bold text-green-500 flex items-center gap-2">
          🌱 GreenScore Lite
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setVista('admin')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${vista === 'admin' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Consola Admin
          </button>
          <button 
            onClick={() => setVista('cliente')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${vista === 'cliente' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Portal Cliente
          </button>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="p-6 max-w-7xl mx-auto">
        {vista === 'admin' ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">🛡️ Consola Máxima (Super Admin)</h1>

            {/* Módulo de Importação Excel */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <h2 className="font-semibold text-slate-200 mb-2">Importar Faturas / Dados (Excel)</h2>
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={carregarExcel}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500 cursor-pointer"
              />
            </div>

            {/* Lista de Clientes e Estado de Licença */}
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
                        <span className={`px-2.5 py-1 rounded text-xs font-semibold ${ativa ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {ativa ? 'Ativa' : 'Expirada'}
                        </span>
                        <button 
                          onClick={() => {
                            setClienteAtivoId(c.id);
                            setVista('cliente');
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
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div>
                <h1 className="text-xl font-bold text-slate-100">📊 Portal do Cliente</h1>
                <p className="text-slate-400 text-sm">Entidade: <span className="text-green-400 font-medium">{utilizadorAtual?.nome}</span></p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                Acesso Autorizado
              </span>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-slate-300">
              <p>Bem-vindo à plataforma de monitorização do GreenScore Lite.</p>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
