import React, { useState } from 'react';
import { Send, Key, RefreshCw, CheckCircle2, AlertCircle, Zap, Calculator, ShieldCheck } from 'lucide-react';
import { ProcessResponse } from '../types';

interface TelecontagemFormProps {
  cpe: string;
  onSuccess: () => void;
}

export const TelecontagemForm: React.FC<TelecontagemFormProps> = ({ cpe, onSuccess }) => {
  const [apiKey, setApiKey] = useState<string>('valor_de_teste');
  const [kwhAtual, setKwhAtual] = useState<string>('175.0');
  const [kwhHistorico, setKwhHistorico] = useState<string>('210.0');
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ProcessResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculated preview
  const numAtual = parseFloat(kwhAtual) || 0;
  const numHist = parseFloat(kwhHistorico) || 0;
  const poupancaPreview = Math.max(0, numHist - numAtual);
  const creditosPreview = Math.floor(poupancaPreview * 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setResponse(null);

    try {
      const res = await fetch('/api/v1/medicoes/processar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          user_id: 1,
          cpe: cpe.trim(),
          kwh_atual: numAtual,
          kwh_historico: numHist
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.detail || 'Erro ao processar medição.');
      }

      setResponse(json);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na autenticação ou ligação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2 text-emerald-400 font-medium text-sm">
          <Zap className="w-4 h-4" />
          <span>Telecontagem / Processador de Medições</span>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
          POST /api/v1/medicoes/processar
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* API Key Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Chave de API (`GREENSCORE_API_KEY`)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Header: x-api-key</span>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Insira a GREENSCORE_API_KEY"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
            required
          />
        </div>

        {/* CPE and Readings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Consumo Atual (kWh)
            </label>
            <input
              type="number"
              step="0.1"
              value={kwhAtual}
              onChange={(e) => setKwhAtual(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Histórico Homólogo (kWh)
            </label>
            <input
              type="number"
              step="0.1"
              value={kwhHistorico}
              onChange={(e) => setKwhHistorico(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>
        </div>

        {/* Live Calculation Preview Badge */}
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Estimativa de Geração de Créditos:</span>
          </div>
          <div className="text-xs font-bold text-emerald-400 font-mono">
            {poupancaPreview.toFixed(1)} kWh = <span className="text-amber-300 font-extrabold">{creditosPreview} Créditos</span>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>A autenticar e processar...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Enviar Leitura para Engine API</span>
            </>
          )}
        </button>
      </form>

      {/* Response Display */}
      {errorMsg && (
        <div className="bg-rose-950/30 border border-rose-800/50 p-3 rounded-xl flex items-start space-x-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {response && (
        <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {response.status}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{response.timestamp}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400">Poupança</div>
              <div className="text-xs font-bold text-white font-mono">{response.poupanca_kwh} kWh</div>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400">Créditos</div>
              <div className="text-xs font-bold text-amber-400 font-mono">+{response.creditos_gerados}</div>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400">Alerta</div>
              <div className={`text-xs font-bold font-mono ${response.alerta_status === 'OK' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {response.alerta_status}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
