import { t, tv, locale } from './i18n';
import { LanguageToggle } from './components/LanguageToggle';
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
  mesReferencia: string;
  consumoAtualKwh: number;
  consumoHomologoKwh: number;
}

// VALIDAÇÃO RIGOROSA DA LICENÇA
function verificarLicenca(u: Utilizador): boolean {
  if (!u) return false;
  if (u.licencaAtiva === false) return false;
  if (!u.dataInicioLicenca || !u.duracaoMeses) return u.licencaAtiva;

  const inicio = new Date(u.dataInicioLicenca);
  const fim = new Date(inicio);
  fim.setMonth(fim.getMonth() + u.duracaoMeses);

  return new Date() <= fim;
}

// --- DADOS INICIAIS ---
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
  },
  {
    id: 2,
    nome: 'Indústrias Sustentáveis SA',
    email: 'geral@industrias-sustentaveis.pt',
    cpe: 'PT0002000099999999FC',
    creditos_acumulados: 120,
    role: 'cliente',
    licencaAtiva: false,
    dataInicioLicenca: '2025-01-01',
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
    mesReferencia: 'Julho',
    consumoAtualKwh: 3200,
    consumoHomologoKwh: 4000,
  },
  {
    id: 102,
    clienteId: 1,
    nomePosto: 'Centro Logístico B',
    cpe: 'PT0002000088888888FB',
    funcionarioResponsavel: 'Responsável Operacional 2',
    objetivoReducaoPct: 10,
    premioMeta: 'Vale Compras Sustentáveis 50€',
    mesReferencia: 'Julho',
    consumoAtualKwh: 5100,
    consumoHomologoKwh: 5700,
  }
];

const MESES_DO_ANO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// --- COMPONENTE DE RELATÓRIOS (ABA 3) ---
function PainelRelatorios({ utilizador, postos }: { utilizador: Utilizador; postos: Posto[] }) {
  const historicoMensal = [
    { mes: 'Jan', consumo: 9200 },
    { mes: 'Fev', consumo: 8800 },
    { mes: 'Mar', consumo: 8500 },
    { mes: 'Abr', consumo: 8100 },
    { mes: 'Mai', consumo: 8300 },
    { mes: 'Jun', consumo: 8300 },
    { mes: 'Jul', consumo: 8300 },
    { mes: 'Ago', consumo: 8200 },
    { mes: 'Set', consumo: 8000 },
    { mes: 'Out', consumo: 7900 },
    { mes: 'Nov', consumo: 8100 },
    { mes: 'Dez', consumo: 8400 },
  ];

  const totalConsumoAtual = postos.reduce((acc, p) => acc + (p.consumoAtualKwh || 0), 0);
  const totalConsumoHomologo = postos.reduce((acc, p) => acc + (p.consumoHomologoKwh || 0), 0);
  const poupancaKwh = Math.max(0, totalConsumoHomologo - totalConsumoAtual);
  const poupancaEuro = (poupancaKwh * 0.22).toFixed(2);
  const co2EvitadoKg = (poupancaKwh * 0.25).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {t("📊 Relatório ESG & Desempenho Energético Real")}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t("Análise real comparando a leitura descarregada com o")} <strong className="text-emerald-400">{t("Mês Homólogo do Ano Anterior")}</strong> {t("para")} {tv(utilizador.nome)}
          </p>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-800/80 px-4 py-2 rounded-xl text-right">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">{t("Créditos Verdes Acumulados")}</span>
          <span className="text-xl font-extrabold text-emerald-300">🌱 {tv(utilizador.creditos_acumulados)} {t("PTS")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">{t("Consumo Total Registado")}</span>
          <p className="text-2xl font-bold text-white mt-1">{totalConsumoAtual.toLocaleString()} <span className="text-xs font-normal text-slate-400">{t("kWh")}</span></p>
          <span className="text-[11px] text-slate-400 block mt-2">{t("vs")} {totalConsumoHomologo.toLocaleString()} {t("kWh no Ano Anterior")}</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">{t("Poupança Homóloga (€)")}</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{tv(poupancaEuro)} €</p>
          <span className="text-[11px] text-emerald-400 block mt-2">{t("Diferença real:")} {tv(poupancaKwh)} {t("kWh economizados")}</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">{t("Impacto Ambiental")}</span>
          <p className="text-2xl font-bold text-teal-300 mt-1">{tv(co2EvitadoKg)} <span className="text-xs font-normal text-slate-400">{t("kg CO₂")}</span></p>
          <span className="text-[11px] text-teal-400 block mt-2">{t("Redução de emissões atingida")}</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">{t("Postos Monitorizados")}</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{tv(postos.length)} <span className="text-xs font-normal text-slate-400">{t("Instalações")}</span></p>
          <span className="text-[11px] text-amber-300/80 block mt-2">{t("Com métricas ativas")}</span>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">{t("📈 Histórico de Consumo Anual (kWh)")}</h2>
        <div className="h-48 flex items-end justify-between gap-2 pt-6 px-4 border-b border-slate-800">
          {historicoMensal.map((item) => {
            const alturaBarra = Math.min(100, (item.consumo / 10000) * 100);
            return (
              <div key={item.mes} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-all">{tv(item.consumo)} {t("kWh")}</span>
                <div className="w-full bg-slate-800 rounded-t-lg relative flex items-end overflow-hidden" style={{ height: '100%' }}>
                  <div className="w-full bg-emerald-500 hover:bg-emerald-400 transition-all rounded-t-lg" style={{ height: `${alturaBarra}%` }}></div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{tv(item.mes)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">{t("🎯 Comparativo do Mês de Referência por Posto")}</h2>
        <div className="grid grid-cols-1 gap-4">
          {postos.map((p) => {
            const reducaoKwh = (p.consumoHomologoKwh || 0) - (p.consumoAtualKwh || 0);
            const reducaoRealPct = p.consumoHomologoKwh > 0 
              ? Math.round((reducaoKwh / p.consumoHomologoKwh) * 100)
              : 0;
            const metaAtingida = reducaoRealPct >= p.objetivoReducaoPct;

            return (
              <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-white">📍 {tv(p.nomePosto)}</h3>
                    <p className="text-xs text-slate-400">
                      {t("Mês de Referência:")} <strong className="text-emerald-400">{tv(p.mesReferencia) || t("Julho")}</strong> {t("| CPE:")} {tv(p.cpe)}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    metaAtingida 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {metaAtingida ? t("🏆 Meta Atingida neste Mês!") : t("🔄 Em Progresso")}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 p-3 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 block">{t("Consumo Mês Atual:")}</span>
                    <strong className="text-white text-sm">{tv(p.consumoAtualKwh)} {t("kWh")}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t("Consumo Mês Homólogo (Ano Ant.):")}</span>
                    <strong className="text-amber-300 text-sm">{tv(p.consumoHomologoKwh)} {t("kWh")}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t("Redução Calculada:")}</span>
                    <strong className={reducaoRealPct >= 0 ? 'text-emerald-400 text-sm' : 'text-red-400 text-sm'}>
                      {tv(reducaoKwh)} {t("kWh (")}{tv(reducaoRealPct)}%)
                    </strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{t("Meta Estabelecida:")} <strong className="text-white">-{tv(p.objetivoReducaoPct)}%</strong></span>
                    <span className={metaAtingida ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {t("Desempenho Real:")} {tv(reducaoRealPct)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${metaAtingida ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, Math.max(5, (reducaoRealPct / p.objetivoReducaoPct) * 100))}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t("Prémio de Eficiência Associado:")}</span>
                  <span className="text-amber-300 font-semibold flex items-center gap-1">🎁 {tv(p.premioMeta)}</span>
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
  const [novoFuncionario, setNovoFuncionario] = useState('');
  const [novoObjetivoPct, setNovoObjetivoPct] = useState<number>(10);
  const [novoPremio, setNovoPremio] = useState('');

  // ESTADOS DA LEITURA (ABA 2)
  const [postoSelecionadoId, setPostoSelecionadoId] = useState<number>(101);
  const [mesReferenciaInput, setMesReferenciaInput] = useState('Julho');
  const [kwhAtualInput, setKwhAtualInput] = useState('');
  const [kwhHomologoInput, setKwhHomologoInput] = useState('');
  const [valorInput, setValorInput] = useState('');
  const [lendoContador, setLendoContador] = useState(false);

  // SIMULAÇÃO DE PEDIDO À API E-REDES
  const simularLeituraTelecontagem = () => {
    setLendoContador(true);
    setTimeout(() => {
      setKwhAtualInput('3850');
      setKwhHomologoInput('4400');
      setValorInput('577.50');
      setLendoContador(false);
    }, 800);
  };

  const utilizadorAtual = clientes.find((c) => Number(c.id) === clienteAtivoId) || clientes[0];
  const postosDoCliente = postos.filter((p) => p.clienteId === clienteAtivoId);

  const adicionarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNomeEmpresa || !novoEmailEmpresa) {
      alert(t("Por favor preencha o Nome e o Email da Empresa."));
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
    alert(t('Empresa "{n}" criada com sucesso com licença de 12 meses!', { n: novoCliente.nome }));
  };

  // ALTERNAR STATUS DA LICENÇA
  const alternarLicenca = (id: number) => {
    setClientes(clientes.map((c) => 
      c.id === id ? { ...c, licencaAtiva: !c.licencaAtiva } : c
    ));
  };

  // REGISTAR NOVO POSTO
  const adicionarPosto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNomePosto || !novoCpe) {
      alert(t("Por favor preencha o Nome do Posto e o CPE."));
      return;
    }

    const novo: Posto = {
      id: Date.now(),
      clienteId: clienteAtivoId,
      nomePosto: novoNomePosto,
      cpe: novoCpe,
      funcionarioResponsavel: novoFuncionario || t('Não atribuído'),
      objetivoReducaoPct: novoObjetivoPct || 10,
      premioMeta: novoPremio || t('Certificado de Eficiência Energética'),
      mesReferencia: 'Julho',
      consumoAtualKwh: 0,
      consumoHomologoKwh: 0,
    };

    setPostos([...postos, novo]);
    setNovoNomePosto('');
    setNovoCpe('');
    setNovoFuncionario('');
    setNovoObjetivoPct(10);
    setNovoPremio('');
    setMostrarFormNovoPosto(false);
    alert(`Posto "${novo.nomePosto}" registado com sucesso!`);
  };

  // SUBMETER LEITURA REAL
  const submeterLeitura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kwhAtualInput || !kwhHomologoInput) {
      alert(t("Por favor preencha o consumo atual e o consumo homólogo do mês correspondente."));
      return;
    }

    setPostos(postos.map(p => {
      if (p.id === Number(postoSelecionadoId)) {
        return {
          ...p,
          mesReferencia: mesReferenciaInput,
          consumoAtualKwh: Number(kwhAtualInput),
          consumoHomologoKwh: Number(kwhHomologoInput),
        };
      }
      return p;
    }));

    alert(t('Leituras do mês de {m} guardadas com sucesso para o posto selecionado!', { m: t(mesReferenciaInput) }));
    setKwhAtualInput('');
    setKwhHomologoInput('');
    setValorInput('');
  };

  const exportarParaExcel = () => {
    const dadosExcel = clientes.map(c => {
      const postosEmpresa = postos.filter(p => p.clienteId === c.id);
      return {
        [t('ID Cliente')]: c.id,
        [t('Nome Empresa')]: c.nome,
        'Email': c.email,
        [t('Licença Ativa')]: c.licencaAtiva ? t('Sim') : t('Não'),
        [t('Início Licença')]: c.dataInicioLicenca || 'N/A',
        [t('Duração (Meses)')]: c.duracaoMeses || 12,
        [t('Total Postos')]: postosEmpresa.length,
        [t('Detalhe dos Postos')]: postosEmpresa.map(p => `${tv(p.nomePosto)} (${t('Mês:')} ${t(p.mesReferencia)} | ${t('Atual:')} ${p.consumoAtualKwh} kWh | ${t('Homólogo:')} ${p.consumoHomologoKwh} kWh)`).join('; ')
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
      
      {/* BARRA SUPERIOR DE NAVEGAÇÃO */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            {t("🌱 GreenScore Lite")}
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">{t("Empresa Selecionada:")}</span>
            <select 
              value={clienteAtivoId} 
              onChange={(e) => setClienteAtivoId(Number(e.target.value))}
              className="bg-slate-900 text-emerald-400 text-xs font-semibold px-2 py-1 rounded border border-slate-700 focus:outline-none cursor-pointer"
            >
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {tv(c.nome)} ({tv(postos.filter(p => p.clienteId === c.id).length)} {t("Postos)")}
                </option>
              ))}
            </select>
          </div>

          <LanguageToggle />

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setAbaAtiva('admin')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'admin' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t("1. Consola Admin")}
            </button>
            <button 
              onClick={() => setAbaAtiva('cliente-input')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'cliente-input' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t("2. Introduzir Dados")}
            </button>
            <button 
              onClick={() => setAbaAtiva('cliente-resultados')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'cliente-resultados' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t("3. Relatórios & Resultados")}
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
                <h1 className="text-2xl font-bold">{t("🛡️ Consola Máxima (Super Admin)")}</h1>
                <p className="text-xs text-slate-400">{t("Gestão central de empresas, licenças de utilização e postos de medição.")}</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={exportarParaExcel}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 shadow"
                >
                  {t("📊 Exportar Excel")}
                </button>
                <button 
                  onClick={() => setMostrarFormNovoCliente(!mostrarFormNovoCliente)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition-all shadow"
                >
                  {mostrarFormNovoCliente ? t("✕ Cancelar") : t("🏢 + Nova Empresa")}
                </button>
              </div>
            </div>

            {mostrarFormNovoCliente && (
              <form onSubmit={adicionarCliente} className="bg-slate-900 p-5 rounded-2xl border border-emerald-500/40 space-y-3">
                <h3 className="text-sm font-bold text-emerald-400 uppercase">{t("Cadastrar Nova Empresa")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">{t("Nome da Empresa")}</label>
                    <input 
                      type="text" 
                      placeholder={t("Ex: Empresa XYZ Unipessoal")} 
                      value={novoNomeEmpresa} 
                      onChange={(e) => setNovoNomeEmpresa(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">{t("Email de Contacto")}</label>
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
                    {t("Guardar Empresa")}
                  </button>
                </div>
              </form>
            )}

            {/* 🔑 BLOCO RECUPERADO: GESTÃO DE EMPRESAS E LICENÇAS */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">{t("🏢 Gestão de Empresas e Licenças de Acesso")}</h2>
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
                          <h3 className="font-bold text-sm text-white">{tv(c.nome)}</h3>
                          <p className="text-xs text-slate-400">{tv(c.email)}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          licencaOk 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {licencaOk ? t("✓ Licença Ativa") : t("✕ Licença Inativa")}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1 my-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <p>{t("📍 Total de Postos Registados:")} <strong className="text-slate-200">{tv(numPostos)}</strong></p>
                        <p>{t("📅 Data de Início da Licença:")} <strong className="text-slate-200">{c.dataInicioLicenca || '2026-01-01'}</strong></p>
                        <p>{t("⏳ Duração Contratada:")} <strong className="text-slate-200">{c.duracaoMeses || 12} {t("meses")}</strong></p>
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
                          {c.id === clienteAtivoId ? t("✓ Selecionada") : t("Gerir esta Empresa")}
                        </button>

                        <button 
                          onClick={() => alternarLicenca(c.id)}
                          className="text-xs text-slate-400 hover:text-white underline font-medium"
                        >
                          {c.licencaAtiva ? t("Desativar Licença") : t("Ativar Licença")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CONFIGURAÇÃO DE POSTOS E METAS */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {t("Postos / Instalações de")} <span className="text-emerald-400">{tv(utilizadorAtual.nome)}</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t("Cadastre os locais físicos, respetivos CPEs e as metas de redução pretendidas.")}
                  </p>
                </div>

                <button 
                  onClick={() => setMostrarFormNovoPosto(!mostrarFormNovoPosto)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition-all shadow"
                >
                  {mostrarFormNovoPosto ? t("✕ Cancelar") : t("📍 + Registar Novo Posto")}
                </button>
              </div>

              {mostrarFormNovoPosto && (
                <form onSubmit={adicionarPosto} className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3 mt-3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase">{t("Novo Contador / Instalação")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">{t("Nome do Posto / Local")}</label>
                      <input 
                        type="text" 
                        placeholder={t("Ex: Posto Central / Armazém 1")} 
                        value={novoNomePosto} 
                        onChange={(e) => setNovoNomePosto(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">{t("CPE da Instalação")}</label>
                      <input 
                        type="text" 
                        placeholder={t("Ex: PT0002000012345678FA")} 
                        value={novoCpe} 
                        onChange={(e) => setNovoCpe(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">{t("Responsável")}</label>
                      <input 
                        type="text" 
                        placeholder={t("Ex: Responsável de Turno")} 
                        value={novoFuncionario} 
                        onChange={(e) => setNovoFuncionario(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">{t("Meta Pretendida (%)")}</label>
                      <input 
                        type="number" 
                        placeholder={t("Ex: 15")} 
                        value={novoObjetivoPct} 
                        onChange={(e) => setNovoObjetivoPct(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-300 mb-1">{t("Prémio de Eficiência")}</label>
                      <input 
                        type="text" 
                        placeholder={t("Ex: Bónus de Equipa 100€ / Vale Compras")} 
                        value={novoPremio} 
                        onChange={(e) => setNovoPremio(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                      {t("Guardar Posto")}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {postosDoCliente.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">{t("Nenhum posto associado a esta empresa ainda.")}</p>
                ) : (
                  postosDoCliente.map((p) => (
                    <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-emerald-300">📍 {tv(p.nomePosto)}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                          {t("CPE:")} {tv(p.cpe)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">{t("Meta Registada:")}</span>
                          <span className="text-emerald-400 font-bold">🎯 -{tv(p.objetivoReducaoPct)}{t("% kWh")}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">{t("Prémio Atribuído:")}</span>
                          <span className="text-amber-400 font-semibold truncate block">🏆 {tv(p.premioMeta)}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">
                        {t("👤 Responsável:")} <strong className="text-slate-200">{tv(p.funcionarioResponsavel)}</strong>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: INTRODUÇÃO DE DADOS E DESCARGA DE LEITURAS */}
        {abaAtiva === 'cliente-input' && (
          temAcesso ? (
            <form onSubmit={submeterLeitura} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white">{t("Registo e Descarga de Leituras do Contador")}</h2>
                  <p className="text-xs text-slate-400 mt-1">{t("Selecione o mês e insira os consumos reais ou descarregue automaticamente a telecontagem.")}</p>
                </div>
                
                <button 
                  type="button"
                  onClick={simularLeituraTelecontagem}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow border border-emerald-500/50"
                >
                  {lendoContador ? t("⏳ A consultar E-Redes...") : t("⚡ Importar Leitura Automática (API E-Redes)")}
                </button>
              </div>
              
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">{t("Posto / Contador Inteligente")}</label>
                    <select 
                      value={postoSelecionadoId}
                      onChange={(e) => setPostoSelecionadoId(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-emerald-400 text-sm font-semibold rounded-lg p-2.5 focus:outline-none cursor-pointer"
                    >
                      {postosDoCliente.map((p) => (
                        <option key={p.id} value={p.id}>
                          {tv(p.nomePosto)} {t("(CPE:")} {tv(p.cpe)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-amber-300 mb-1 font-semibold">{t("Mês de Referência da Leitura")}</label>
                    <select 
                      value={mesReferenciaInput}
                      onChange={(e) => setMesReferenciaInput(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/50 text-amber-300 text-sm font-semibold rounded-lg p-2.5 focus:outline-none cursor-pointer"
                    >
                      {MESES_DO_ANO.map((m) => (
                        <option key={m} value={m}>{tv(m)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">
                      {t("Consumo Mês Atual (")}{tv(mesReferenciaInput)}{t(") - kWh")}
                    </label>
                    <input 
                      type="number" 
                      value={kwhAtualInput}
                      onChange={(e) => setKwhAtualInput(e.target.value)}
                      placeholder={t("Ex: 3850")} 
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm font-mono focus:border-emerald-500 focus:outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-amber-300 mb-1 font-semibold">
                      {t("Consumo Homólogo (")}{tv(mesReferenciaInput)} {t("Ano Anterior) - kWh")}
                    </label>
                    <input 
                      type="number" 
                      value={kwhHomologoInput}
                      onChange={(e) => setKwhHomologoInput(e.target.value)}
                      placeholder={t("Ex: 4400")} 
                      className="w-full bg-slate-900 border border-amber-500/50 text-amber-300 rounded-lg p-2.5 text-sm font-mono focus:border-amber-400 focus:outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">{t("Valor da Fatura (€)")}</label>
                    <input 
                      type="number" 
                      value={valorInput}
                      onChange={(e) => setValorInput(e.target.value)}
                      placeholder={t("Ex: 577.50")} 
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm font-mono focus:border-emerald-500 focus:outline-none" 
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow">
                  {t("Submeter Leitura e Processar Comparativo Real")}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-900 p-8 rounded-2xl border border-red-800/50 text-center space-y-3">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-lg font-bold text-red-400">{t("Licença Inativa ou Expirada")}</h2>
              <p className="text-xs text-slate-400">
                {t("A licença da empresa")} <strong className="text-white">{tv(utilizadorAtual.nome)}</strong> {t("está inativa ou expirada. Ative-a na Consola Admin.")}
              </p>
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
              <h2 className="text-lg font-bold text-red-400">{t("Licença Inativa ou Expirada")}</h2>
              <p className="text-xs text-slate-400">
                {t("A licença da empresa")} <strong className="text-white">{tv(utilizadorAtual.nome)}</strong> {t("está inativa ou expirada. Ative-a na Consola Admin para consultar os relatórios.")}
              </p>
            </div>
          )
        )}

      </main>
    </div>
  );
}
