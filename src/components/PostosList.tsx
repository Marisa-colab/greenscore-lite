import React, { useState } from 'react';

export interface Posto {
  id: string;
  nome: string;
  cpe: string;
  morada: string;
  tipo: string;
  estado: 'ativo' | 'inativo';
}

interface PostosListProps {
  postos: Posto[];
  onAddPosto?: (novo: { nome: string; cpe: string; morada: string; tipo: string }) => void;
  onUpdatePosto?: (id: string, dados: { nome: string; cpe: string; morada: string; tipo: string }) => void;
  readOnly?: boolean;
}

export function PostosList({ postos, onAddPosto, onUpdatePosto, readOnly = false }: PostosListProps) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados Adicionar
  const [nome, setNome] = useState('');
  const [cpe, setCpe] = useState('');
  const [morada, setMorada] = useState('');
  const [tipo, setTipo] = useState('Comercial / Industrial');

  // Estados Editar
  const [editNome, setEditNome] = useState('');
  const [editCpe, setEditCpe] = useState('');
  const [editMorada, setEditMorada] = useState('');
  const [editTipo, setEditTipo] = useState('Comercial / Industrial');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpe.trim() || !nome.trim() || !onAddPosto) return;
    onAddPosto({ nome, cpe, morada, tipo });
    setNome('');
    setCpe('');
    setMorada('');
    setMostrarForm(false);
  };

  const startEdit = (posto: Posto) => {
    setEditingId(posto.id);
    setEditNome(posto.nome);
    setEditCpe(posto.cpe);
    setEditMorada(posto.morada);
    setEditTipo(posto.tipo);
  };

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!onUpdatePosto) return;
    onUpdatePosto(id, { nome: editNome, cpe: editCpe, morada: editMorada, tipo: editTipo });
    setEditingId(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Postos de Consumo</h3>
          <p className="text-xs text-slate-400">Pontos de entrega associados ao contrato</p>
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-xs font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
            {postos.length} Registados
          </span>
          {!readOnly && onAddPosto && (
            <button 
              onClick={() => setMostrarForm(!mostrarForm)}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-2 rounded-xl transition shadow-lg shadow-emerald-950"
            >
              {mostrarForm ? 'Cancelar' : '+ Adicionar Contador'}
            </button>
          )}
        </div>
      </div>

      {/* Formulário Novo Contador (Apenas visível se NÃO for readOnly) */}
      {!readOnly && mostrarForm && onAddPosto && (
        <form onSubmit={handleAddSubmit} className="mb-6 p-4 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-4">
          <h4 className="text-sm font-semibold text-emerald-400">Registar Novo Contador / Ponto de Entrega</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Identificação / Nome *</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Armazém, Garagem" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Número do Contador (CPE) *</label>
              <input 
                type="text" 
                required
                placeholder="Ex: PT00080000..." 
                value={cpe}
                onChange={(e) => setCpe(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 font-mono text-amber-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Morada</label>
              <input 
                type="text" 
                placeholder="Ex: Angra do Heroísmo" 
                value={morada}
                onChange={(e) => setMorada(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Tipo de Instalação</label>
              <select 
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Doméstico">Doméstico</option>
                <option value="Comercial / Industrial">Comercial / Industrial</option>
                <option value="Mobilidade Elétrica">Mobilidade Elétrica</option>
                <option value="Produtor / Autoconsumo">Produtor / Autoconsumo</option>
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg text-xs transition"
          >
            Guardar Novo Contador
          </button>
        </form>
      )}

      {/* Lista de Contadores */}
      {postos.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
          <p className="text-slate-500 text-sm">Nenhum contador (CPE) associado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {postos.map((posto) => (
            <div key={posto.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3">
              {!readOnly && editingId === posto.id ? (
                /* MODO EDICÃO */
                <form onSubmit={(e) => handleEditSubmit(e, posto.id)} className="space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-semibold text-amber-400">✏️ Corrigir Contador / CPE</span>
                    <button 
                      type="button" 
                      onClick={() => setEditingId(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Nome da Instalação</label>
                    <input 
                      type="text" 
                      value={editNome} 
                      onChange={e => setEditNome(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Número do Contador (CPE)</label>
                    <input 
                      type="text" 
                      value={editCpe} 
                      onChange={e => setEditCpe(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 font-mono text-amber-400 font-semibold"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 rounded transition"
                  >
                    Guardar Correção
                  </button>
                </form>
              ) : (
                /* EXIBIÇÃO NORMAL (SEM BOTÃO DE EDITAR SE READONLY) */
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium">{posto.nome}</h4>
                      <p className="text-xs text-amber-400 font-mono font-semibold mt-1">{posto.cpe}</p>
                      <p className="text-xs text-slate-500 mt-1">{posto.morada || 'Morada não especificada'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {posto.estado}
                      </span>
                      {!readOnly && onUpdatePosto && (
                        <button 
                          onClick={() => startEdit(posto)}
                          className="text-xs text-amber-400 hover:text-amber-300 font-medium hover:underline mt-1"
                        >
                          ✏️ Corrigir CPE
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-900 text-xs text-slate-400">
                    <span>Tipo: <strong className="text-slate-200 font-normal">{posto.tipo}</strong></span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostosList;
