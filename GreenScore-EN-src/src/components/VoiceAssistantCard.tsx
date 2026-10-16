import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, RefreshCw, AlertTriangle, CheckCircle, Zap, ShieldAlert } from 'lucide-react';
import { VoiceAssistantResponse } from '../types';

interface VoiceAssistantCardProps {
  userId: number;
}

export const VoiceAssistantCard: React.FC<VoiceAssistantCardProps> = ({ userId }) => {
  const [data, setData] = useState<VoiceAssistantResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [standbyMissionActive, setStandbyMissionActive] = useState<boolean>(false);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/assistente-voz/${userId}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Erro ao carregar assistente de voz:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [userId]);

  const handleSpeak = () => {
    if (!data?.mensagem) return;

    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.mensagem);
        utterance.lang = 'pt-PT';
        utterance.rate = 0.95;
        
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert('Síntese de voz não suportada neste navegador.');
    }
  };

  const isOk = data?.status === 'OK';

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 shadow-xl transition-all ${
      isOk
        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border-emerald-500/30'
        : 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/60 border-amber-500/30'
    }`}>
      {/* Decorative Glow */}
      <div className={`absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
        isOk ? 'bg-emerald-500/10' : 'bg-amber-500/10'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
            isOk 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              Assistente de Voz GreenScore
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                isOk
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {isOk ? 'Poupança Ativa' : 'Alerta de Consumo'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Resumo diário e recomendações inteligentes personalizadas</p>
          </div>
        </div>

        <button
          onClick={fetchBriefing}
          disabled={loading}
          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
          title="Atualizar Briefing de Voz"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Audio Playback Controls & Waveform */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleSpeak}
            disabled={loading || !data?.mensagem}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition border ${
              isPlaying
                ? 'bg-rose-600/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
            }`}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Parar Áudio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Ouvir Relatório de Voz</span>
              </>
            )}
          </button>

          {/* Waveform indicator */}
          <div className="flex items-center space-x-1">
            {[0.4, 0.8, 1.0, 0.6, 0.9, 0.3, 0.7].map((val, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying ? 'bg-emerald-400 animate-bounce' : 'bg-slate-700'
                }`}
                style={{
                  height: isPlaying ? `${val * 24}px` : '8px',
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
          </div>
        </div>

        {/* Message Text */}
        <div className="text-sm text-slate-200 leading-relaxed font-sans italic border-l-2 border-emerald-500/50 pl-3 py-1">
          {loading ? (
            <span className="text-slate-500 animate-pulse">A carregar o boletim de voz do GreenScore...</span>
          ) : (
            `"${data?.mensagem}"`
          )}
        </div>
      </div>

      {/* Key Metrics extracted from response */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Poupança kWh</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              +{data.poupanca_kwh || 0} kWh
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Poupança Estimada</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              {data.valor_poupado_eur?.toFixed(2) || "0.00"} €
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl col-span-2 sm:col-span-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Estado Atual</div>
            <div className={`text-sm font-bold font-mono mt-0.5 flex items-center gap-1 ${
              isOk ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {isOk ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {isOk ? 'OK (Eficiente)' : 'Crítico (Elevado)'}
            </div>
          </div>
        </div>
      )}

      {/* Mission Action Toggle */}
      {!isOk && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-amber-300 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Recomendação: Operação Standby Zero</span>
          </div>
          <button
            onClick={() => setStandbyMissionActive(!standbyMissionActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              standbyMissionActive
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30'
            }`}
          >
            {standbyMissionActive ? 'Missão Ativada ✓' : 'Ativar Missão Agora'}
          </button>
        </div>
      )}
    </div>
  );
};
