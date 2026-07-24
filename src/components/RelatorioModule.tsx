import React, { useState } from 'react';

interface RelatorioProps {
  nomeEmpresa: string;
}

export function RelatorioModule({ nomeEmpresa }: RelatorioProps) {
  const [periodo, setPeriodo] = useState('2026-07');

  // Dados simulados baseados no período selecionado (serão alimentados pelo Excel/Base de dados)
  const dados = {
    periodoExtenso: 'Julho 2026',
    consumoRealKWh: 10200,
    consumoMetaKWh: 12000,
    poupancaKWh: 1800,           // 12000 - 10200
    poupancaEuros: 414.00,       // Calculado a ~0.23€/kWh
    co2EvitadoKg: 432,           // ~0.24 kg CO₂ por kWh poupado
    creditosGanhosMes: 18,       // Regra: 1 Crédito por cada 100 kWh poupados
    totalCreditosAcumulados: 142
  };

  const dispararImpressao = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Barra de Controlo e Exportação */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap justify-between items-center gap-4 print:hidden">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Selecionar Período do Relatório:</label>
          <input
            type="month"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={dispararImpressao}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
          >
            📄 Exportar PDF / Imprimir Relatório
          </button>
        </div>
      </div>

      {/* ÁREA DO RELATÓRIO (Pronta para Impressão) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-8 print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Cabecalho do Relatorio */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white print:text-black">Relatório ESG & Eficiência Energética</h2>
            <p className="text-emerald-400 font-medium print:text-emerald-700">{nomeEmpresa}</p>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">Referência: {dados.periodoExtenso}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full print:border-emerald-600 print:text-emerald-800">
              Certificado GreenScore Lite
            </span>
          </div>
        </div>

        {/* Módulos do Relatório: Consumos, Poupanças e Créditos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. MÓDULO CONSUMO */}
          <div className="bg-slate-800/60 print:bg-slate-100 p-5 rounded-xl border border-slate-700/50 print:border-slate-300">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">⚡ Consumo Energético</span>
            </div>
            <p className="text-3xl font-extrabold text-white print:text-black">{dados.consumoRealKWh.toLocaleString()} <span className="text-base font-normal text-slate-400">kWh</span></p>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-2">
              Meta estipulada: <strong className="text-slate-200 print:text-black">{dados.consumoMetaKWh.toLocaleString()} kWh</strong>
            </p>
            <div className="w-full bg-slate-700 print:bg-slate-300 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full" 
                style={{ width: `${Math.min((dados.consumoRealKWh / dados.consumoMetaKWh) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* 2. MÓDULO POUPANÇA */}
          <div className="bg-slate-800/60 print:bg-slate-100 p-5 rounded-xl border border-slate-700/50 print:border-slate-300">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-700">💰 Poupança Directa</span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-400 print:text-emerald-700">+{dados.poupancaEuros.toFixed(2)} €</p>
            <div className="space-y-1 mt-2 text-xs text-slate-300 print:text-slate-700">
              <p>• Energy Poupar: <strong>{dados.poupancaKWh} kWh</strong></p>
              <p>• Pegada CO₂ Evitada: <strong className="text-emerald-400 print:text-emerald-700">{dados.co2EvitadoKg} kg CO₂</strong></p>
            </div>
          </div>

          {/* 3. MÓDULO CRÉDITOS VERDES */}
          <div className="bg-emerald-950/30 print:bg-emerald-50 p-5 rounded-xl border border-emerald-500/30 print:border-emerald-300">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 print:text-emerald-800">🌱 Créditos Verdes</span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-300 print:text-emerald-800">+{dados.creditosGanhosMes} <span className="text-sm font-normal">créditos</span></p>
            <p className="text-xs text-emerald-400/80 print:text-emerald-700 mt-2">
              Saldo acumulado: <strong>{dados.totalCreditosAcumulados} Créditos Verdes</strong>
            </p>
            <p className="text-[10px] text-slate-400 print:text-slate-500 mt-2">
              * Relação: 1 Crédito por cada 100 kWh poupados face à meta.
            </p>
          </div>

        </div>

        {/* Tabela Resumo do Mês */}
        <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300 print:text-black">
            <thead className="bg-slate-800 print:bg-slate-200 text-xs uppercase text-slate-400 print:text-slate-700">
              <tr>
                <th className="p-3">Indicador</th>
                <th className="p-3">Valor Registado</th>
                <th className="p-3">Meta / Referência</th>
                <th className="p-3">Impacto / Desvio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-200">
              <tr>
                <td className="p-3 font-medium">Consumo Total de Electricidade</td>
                <td className="p-3">{dados.consumoRealKWh} kWh</td>
                <td className="p-3">{dados.consumoMetaKWh} kWh</td>
                <td className="p-3 text-emerald-400 print:text-emerald-700 font-semibold">
                  -{(100 - (dados.consumoRealKWh / dados.consumoMetaKWh) * 100).toFixed(1)}% (Abaixo da Meta)
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Poupança Financeira Estimada</td>
                <td className="p-3">{dados.poupancaEuros.toFixed(2)} €</td>
                <td className="p-3">0.00 €</td>
                <td className="p-3 text-emerald-400 print:text-emerald-700 font-semibold">Redução de Custo</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Emissões CO₂ Evitadas</td>
                <td className="p-3">{dados.co2EvitadoKg} kg CO₂</td>
                <td className="p-3">0 kg</td>
                <td className="p-3 text-emerald-400 print:text-emerald-700 font-semibold">Impacto Ambiental Positivo</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rodapé de Validação */}
        <div className="pt-4 border-t border-slate-800 print:border-slate-300 flex justify-between items-center text-xs text-slate-400 print:text-slate-600">
          <p>Relatório gerado automaticamente pelo software <strong>GreenScore Lite</strong></p>
          <p>Data do documento: {new Date().toLocaleDateString('pt-PT')}</p>
        </div>

      </div>
    </div>
  );
}
