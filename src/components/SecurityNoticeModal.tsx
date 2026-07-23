import React from 'react';
import { ShieldCheck, X, Lock, Key, Server, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SecurityNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityNoticeModal: React.FC<SecurityNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Arquitetura de Segurança para Venda Comercial</h3>
            <p className="text-xs text-slate-400">Como o GreenScore protege o código-fonte e os dados do proprietário</p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="space-y-4 text-xs text-slate-300">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="font-semibold text-emerald-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              1. Execução Segura no Servidor (Server-Side Execution)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Toda a lógica de cálculo de créditos verdes (1 kWh = 2 créditos), gravação SQLite (<code>greenscore.db</code>) e validação de chaves reside estritamente no backend Express/Node ou FastAPI. O comprador nunca tem acesso direto aos ficheiros de código ou credenciais da base de dados.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="font-semibold text-amber-400 flex items-center gap-2">
              <Key className="w-4 h-4" />
              2. Autenticação via Cabeçalho `x-api-key` (`GREENSCORE_API_KEY`)
            </div>
            <p className="text-slate-400 leading-relaxed">
              O comprador utiliza apenas tokens restritos de API para comunicar com os endpoints <code>/api/v1/medicoes/processar</code> e <code>/api/v1/assistente-voz</code>. Caso deseje revogar ou expirar a licença de um cliente, basta desativar a chave no Painel Mestre.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="font-semibold text-blue-400 flex items-center gap-2">
              <Server className="w-4 h-4" />
              3. Separação de Papeis (Modo Cliente vs. Modo Gestor)
            </div>
            <p className="text-slate-400 leading-relaxed">
              A interface do comprador exibe apenas métricas de consumo, assistente de voz e telecontagem sem expor tabelas internas ou o PIN de gestão mestre (padrão: <code>3662</code>).
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            Compreendi
          </button>
        </div>
      </div>
    </div>
  );
};
