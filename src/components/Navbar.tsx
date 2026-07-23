import React from 'react';
import { Leaf, Award, UserCheck, Unlock, Shield, HelpCircle } from 'lucide-react';

interface NavbarProps {
  mode: 'client' | 'admin';
  setMode: (mode: 'client' | 'admin') => void;
  userCredits?: number;
  userName?: string;
  userCpe?: string;
  onOpenSecurityModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  setMode,
  userCredits = 0,
  userName = 'Cliente Demo',
  userCpe = 'PT0002000012345678AB',
  onOpenSecurityModal
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-emerald-900/40 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center justify-center shadow-inner">
            <Leaf className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">GreenScore</span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-md uppercase font-semibold">
                Core Engine v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Gestão de Eficiência Energética, Créditos Verdes e Assistente
            </p>
          </div>
        </div>

        {/* User Credits Badge & Mode Switcher */}
        <div className="flex items-center space-x-3">
          {/* Credits pill */}
          <div className="hidden md:flex items-center space-x-2 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
            <Award className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <div className="text-[10px] text-emerald-400 uppercase font-mono font-semibold">Créditos Verdes</div>
              <div className="text-xs font-bold text-white font-mono">
                {(userCredits ?? 0).toLocaleString('pt-PT')} pts
              </div>
            </div>
          </div>

          {/* User Profile Badge */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-semibold text-slate-200">{userName}</div>
              <div className="text-[10px] text-slate-400 font-mono">{userCpe}</div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMode('client')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
                mode === 'client'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Cliente</span>
            </button>
            <button
              onClick={() => setMode('admin')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
                mode === 'admin'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Gestor / Admin</span>
            </button>
          </div>

          {/* Security Info Button */}
          <button
            onClick={onOpenSecurityModal}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition"
            title="Informação de Segurança para Venda / Licenciamento"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};