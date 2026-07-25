import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Utilizador } from './types';
import { DadosPortal } from './components/ClientPortal';

export interface Utilizador {
  id: number;
  nome: string;
  email: string;
  cpe: string;
  creditos_acumulados: number;
  role: string;
  licencaAtiva: boolean;
  dataInicioLicenca?: string;
  duracaoMeses?: number;
}

export interface Posto {
  id: number;
  clienteId: number;
  nomePosto: string;
  cpe: string;
  funcionarioResponsavel: string;
  objetivoReducaoPct: number;
  premioMeta: string;
  consumoAtualKwh: number;
  consumoAnteriorKwh: number;
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
    nome: 'Empresa Demonstração Lda',
    email: 'contacto@empresa-demo.pt',
    cpe: 'PT0002000012345678FA',
    creditos_acumulados: 280,
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
    nomePosto: 'Posto Administrativo A',
    cpe: 'PT0002000012345678FA',
    funcionarioResponsavel: 'Responsável Operacional 1',
    objetivoReducaoPct: 15,
    premioMeta: 'Bónus de Produtividade Equipa A',
    consumoAtualKwh: 3200,
    consumoAnteriorKwh: 4000,
  },
  {
    id: 102,
    clienteId: 1,
    nomePosto: 'Centro Logístico B',
    cpe: 'PT0002000088888888FB',
    funcionarioResponsavel: 'Responsável Operacional 2',
    objetivoReducaoPct: 10,
    premioMeta: 'Vale Compras Sustentáveis 50€',
    consumoAtualKwh: 5100,
    consumoAnteriorKwh: 5500,
  }
];

function PainelRelatorios({ utilizador, postos }: { utilizador: Utilizador; postos: Posto[] }) {
  const historicoMensal = [
    { mes: 'Jan', consumo: 9200 },
    { mes: 'Fev', consumo: 8800 },
    { mes: 'Mar', consumo: 8500 },
    { mes: 'Abr', consumo: 8100 },
    { mes: 'Mai', consumo: 8300 },
    { mes: 'Jun', consumo: 8300 },
    { mes: 'Jul', consumo: 8300 },
    { mes: 'Agost', consumo: 8300 },
    { mes: 'Setemb', consumo: 8300 },
    { mes: 'Out', consumo: 8300 },
    { mes: 'Nov', consumo: 8300 },
    { mes: 'Dez', consumo: 8300 },
    
  ];

  const totalConsumoAtual = postos.reduce((acc, p) => acc + p.consumoAtualKwh, 0);
  const totalConsumoAnterior = postos.reduce((acc, p) => acc + p.consumoAnteriorKwh, 0);
  const poupancaKwh = Math.max(0, totalConsumoAnterior - totalConsumoAtual);
  const poupancaEuro = (poupancaKwh * 0.22).toFixed(2);
  const co2EvitadoKg = (poupancaKwh * 0.25).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            📊 Relatório ESG & Desempenho Energético
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Análise de impacto em relação ao <strong className="text-emerald-400">Período Homólogo</strong> para {utilizador.nome}
          </p>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-800/80 px-4 py-2 rounded-xl text-right">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">Créditos Verdes Acumulados</span>
          <span className="text-xl font-extrabold text-emerald-300">🌱 {utilizador.creditos_acumulados} PTS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Consumo Total do Mês</span>
          <p className="text-2xl font-bold text-white mt-1">{totalConsumoAtual.toLocaleString()} <span className="text-xs font-normal text-slate-400">kWh</span></p>
          <span className="text-[11px] text-emerald-400 font-medium block mt-2">↓ Redução homóloga ativa</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Poupança Homóloga (€)</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{poupancaEuro} €</p>
          <span className="text-[11px] text-slate-400 block mt-2">Com base em {poupancaKwh} kWh poupados</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Impacto Ambiental</span>
          <p className="text-2xl font-bold text-teal-300 mt-1">{co2EvitadoKg} <span className="text-xs font-normal text-slate-400">kg CO₂</span></p>
          <span className="text-[11px] text-teal-400 block mt-2">Pegada de carbono evitada</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Postos Monitorizados</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{postos.length} <span className="text-xs font-normal text-slate-400">Unidades</span></p>
          <span className="text-[11px] text-amber-300/80 block mt-2">Com metas ativas</span>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">📈 Histórico de Consumo (kWh)</h2>
        <div className="h-48 flex items-end justify-between gap-2 pt-6 px-4 border-b border-slate-800">
          {historicoMensal.map((item) => {
            const alturaBarra = Math.min(100, (item.consumo / 10000) * 100);
            return (
              <div key={item.mes} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-all">{item.consumo} kWh</span>
                <div className="w-full bg-slate-800 rounded-t-lg relative flex items-end overflow-hidden" style={{ height: '100%' }}>
                  <div className="w-full bg-emerald-500 hover:bg-emerald-400 transition-all rounded-t-lg" style={{ height: `${alturaBarra}%` }}></div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{item.mes}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">🎯 Comparação Homóloga e Objetivos por Posto</h2>
        <div className="grid grid-cols-1 gap-4">
          {postos.map((p) => {
            const reducaoRealPct = p.consumoAnteriorKwh > 0 
              ? Math.round(((p.consumoAnteriorKwh - p.consumoAtualKwh) / p.consumoAnteriorKwh) * 100)
              : 0;
            const metaAtingida = reducaoRealPct >= p.objetivoReducaoPct;

            return (
              <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-white">📍 {p.nomePosto}</h3>
                    <p className="text-xs text-slate-400">Responsável: {p.funcionarioResponsavel} | CPE: {p.cpe}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    metaAtingida 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {metaAtingida ? '🏆 Meta Homóloga Atingida!' : '🔄 Em Progresso'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Objetivo (vs Período Homólogo): <strong className="text-white">-{p.objetivoReducaoPct}%</strong></span>
                    <span className={metaAtingida ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      Redução Homóloga Real: -{reducaoRealPct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${metaAtingida ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, Math.max(10, (reducaoRealPct / p.objetivoReducaoPct) * 100))}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Recompensa / Prémio:</span>
                  <span className="text-amber-300 font-semibold flex items-center gap-1">🎁 {p.premioMeta}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL (APP) ---
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
  const [novoConsumoAnterior, setNovoConsumoAnterior] = useState<number>(4000);
  const [novoFuncionario, setNovoFuncionario] = useState('');
  const [novoObjetivoPct, setNovoObjetivoPct] = useState<number>(10);
  const [novoPremio, setNovoPremio] = useState('');

  const [kwhInput, setKwhInput] = useState('');
  const [valorInput, setValorInput] = useState('');
  const [lendoContador, setLendoContador] = useState(false);

  const simularLeituraTelecontagem = () => {
    setLendoContador(true);
    setTimeout(() => {
      setKwhInput('3850');
      setValorInput('577.50');
      setLendoContador(false);
    }, 800); // Efeito de simulação de pedido à API E-Redes
  };

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
    objetivoReducaoPct: novoObjetivoPct || 10,
    premioMeta: novoPremio || 'Certificado de Eficiência Energética',
    consumoAtualKwh: 3500,
    consumoAnteriorKwh: novoConsumoAnterior || 4000, // 👈 Agora usa o valor do campo!
  };

  setPostos([...postos, novo]);
  setNovoNomePosto('');
  setNovoCpe('');
  setNovoFuncionario('');
  setNovoObjetivoPct(10);
  setNovoPremio('');
  setNovoConsumoAnterior(4000);
  setMostrarFormNovoPosto(false);
  alert(`Posto "${novo.nomePosto}" adicionado com sucesso!`);
};
  const submeterLeitura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kwhInput) {
      alert("Por favor introduza o consumo em kWh ou clique em 'Importar Leitura Automática'.");
      return;
    }
    alert(`Leitura de ${kwhInput} kWh submetida com sucesso! Créditos Verdes calculados.`);
    setKwhInput('');
    setValorInput('');
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
        'Detalhe dos Postos': postosEmpresa.map(p => `${p.nomePosto} (Meta Homóloga: -${p.objetivoReducaoPct}% | Prémio: ${p.premioMeta})`).join('; ')
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

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Postos, Metas (%) e Prémios de <span className="text-emerald-400">{utilizadorAtual.nome}</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Defina os locais de medição, os objetivos de poupança em % (vs Período Homólogo) e os prémios.
                  </p>
                </div>

                <button 
                  onClick={() => setMostrarFormNovoPosto(!mostrarFormNovoPosto)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition-all shadow"
                >
                  {mostrarFormNovoPosto ? '✕ Cancelar' : '📍 + Adicionar Novo Posto com Meta'}
                </button>
              </div>

              {/* FORMULÁRIO PARA CRIAR POSTO COM HISTÓRICO HOMÓLOGO */}
{mostrarFormNovoPosto && (
  <form onSubmit={adicionarPosto} className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3 mt-3">
    <h3 className="text-xs font-bold text-emerald-400 uppercase">Novo Contador / Instalação</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs text-slate-300 mb-1">Nome do Posto / Local</label>
        <input 
          type="text" 
          placeholder="Ex: Posto Central / Armazém 1" 
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
        <label className="block text-xs text-slate-300 mb-1">Responsável do Posto</label>
        <input 
          type="text" 
          placeholder="Ex: Responsável de Turno" 
          value={novoFuncionario} 
          onChange={(e) => setNovoFuncionario(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* 📊 NOVO CAMPO: CONSUMO HOMÓLOGO DO ANO ANTERIOR */}
      <div>
        <label className="block text-xs text-amber-300 mb-1 font-semibold">Consumo Homólogo Ano Anterior (kWh)</label>
        <input 
          type="number" 
          placeholder="Ex: 4000" 
          value={novoConsumoAnterior} 
          onChange={(e) => setNovoConsumoAnterior(Number(e.target.value))}
          className="w-full bg-slate-900 border border-amber-500/50 text-amber-300 font-bold text-xs rounded-lg p-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-300 mb-1">Meta Redução Homóloga (%)</label>
        <input 
          type="number" 
          placeholder="Ex: 15" 
          value={novoObjetivoPct} 
          onChange={(e) => setNovoObjetivoPct(Number(e.target.value))}
          className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-300 mb-1">Prémio / Recompensa</label>
        <input 
          type="text" 
          placeholder="Ex: Bónus de Equipa / Vale Compras" 
          value={novoPremio} 
          onChange={(e) => setNovoPremio(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
        />
      </div>
    </div>

    <div className="flex justify-end pt-2">
      <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg">
        Guardar Posto com Histórico
      </button>
    </div>
  </form>
)}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {postosDoCliente.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Nenhum posto associado a esta empresa ainda.</p>
                ) : (
                  postosDoCliente.map((p) => (
                    <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-emerald-300">📍 {p.nomePosto}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                          CPE: {p.cpe}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Meta Homóloga:</span>
                          <span className="text-emerald-400 font-bold">🎯 -{p.objetivoReducaoPct}% kWh</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Prémio Atribuído:</span>
                          <span className="text-amber-400 font-semibold truncate block">🏆 {p.premioMeta}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">
                        👤 Responsável: <strong className="text-slate-200">{p.funcionarioResponsavel}</strong>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: INTRODUÇÃO DE DADOS E TELECONTAGEM AUTOMÁTICA */}
        {abaAtiva === 'cliente-input' && (
          temAcesso ? (
            <form onSubmit={submeterLeitura} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white">Leitura do Contador Inteligente / Fatura</h2>
                  <p className="text-xs text-slate-400 mt-1">Importação automática via API de Telecontagem ou inserção manual.</p>
                </div>
                
                {/* BOTÃO DE TELECONTAGEM AUTOMÁTICA */}
                <button 
                  type="button"
                  onClick={simularLeituraTelecontagem}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow border border-emerald-500/50"
                >
                  {lendoContador ? '⏳ A consultar E-Redes...' : '⚡ Importar Leitura Automática (API E-Redes)'}
                </button>
              </div>
              
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Selecionar Posto / Contador Inteligente</label>
                  <select className="w-full bg-slate-900 border border-slate-700 text-emerald-400 text-sm font-semibold rounded-lg p-2.5 focus:outline-none cursor-pointer">
                    {postosDoCliente.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nomePosto} (CPE: {p.cpe}) — Meta Homóloga: -{p.objetivoReducaoPct}%
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Consumo do Mês (kWh)</label>
                    <input 
                      type="number" 
                      value={kwhInput}
                      onChange={(e) => setKwhInput(e.target.value)}
                      placeholder="Ex: 3850" 
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm font-mono focus:border-emerald-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Valor da Fatura (€)</label>
                    <input 
                      type="number" 
                      value={valorInput}
                      onChange={(e) => setValorInput(e.target.value)}
                      placeholder="Ex: 577.50" 
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm font-mono focus:border-emerald-500 focus:outline-none" 
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow">
                  Submeter Leitura e Calcular Créditos Verdes
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-900 p-8 rounded-2xl border border-red-800/50 text-center space-y-3">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-lg font-bold text-red-400">Licença Inativa ou Expirada</h2>
              <p className="text-xs text-slate-400">Ative a licença desta empresa na Consola Admin para permitir a introdução de leituras.</p>
            </div>
          )
        )}

        {/* ABA 3: RELATÓRIOS & DASHBOARD */}
        {abaAtiva === 'cliente-resultados' && (
          temAcesso ? (
            <PainelRelatorios 
              utilizador={utilizadorAtual} 
              postos={postosDoCliente} 
            />
          ) : (
            <div className="bg-slate-900 p-8 rounded-2xl border border-red-800/50 text-center space-y-3">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-lg font-bold text-red-400">Licença Inativa ou Expirada</h2>
              <p className="text-xs text-slate-400">Ative a licença desta empresa na Consola Admin para visualizar os relatórios ESG.</p>
            </div>
          )
        )}

      </main>
    </div>
  );
}
