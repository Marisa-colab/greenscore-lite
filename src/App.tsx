import React, { useState } from 'react';
import { verificarLicenca } from './utils';
import { Utilizador } from './types';
import * as XLSX from 'xlsx';

export function App() {
  const [vista, setVista] = useState<'admin' | 'cliente'>('admin');
  const [adminAba, setAdminAba] = useState<'clientes' | 'historico' | 'equipa'>('historico');
  const [clienteAba, setClienteAba] = useState<'historico' | 'equipa' | 'postos'>('historico');

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('gs_clientes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return []; // Se falhar, devolve um array vazio (e NÃO um ecrã)
  });

  const [clienteAtivoId, setClienteAtivoId] = useState<string>(() => {
    return localStorage.getItem('gs_ativo_id') || 'cli_ps_acores';
  });

  if (utilizadorAtual) {
    const temAcesso = verificarLicenca(utilizadorAtual);
    if (!temAcesso) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg shadow-red-500/10">
            🔒
          </div>
          <h1 className="text-3xl font-bold mb-4 text-slate-100">Licença Expirada</h1>
          <div className="w-16 h-1 bg-green-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-slate-400 max-w-md text-lg leading-relaxed">
            A licença de utilização do <span className="text-green-400 font-semibold">GreenScore Lite</span> para a sua entidade chegou ao fim. 
            <br/><br/>
           </p>
        </div>
      );
    }
  }

  return (
    <div>
      {/* Aqui fica o resto da tua aplicação GreenScore Lite... */}
    </div>
  );
}
       
   
