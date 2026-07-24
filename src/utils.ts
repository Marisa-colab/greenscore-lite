import { Utilizador } from './types';

export function verificarLicenca(utilizador: Utilizador): boolean {
  if (!utilizador || !utilizador.licencaAtiva || !utilizador.dataInicioLicenca) {
    return false;
  }

  const dataInicio = new Date(utilizador.dataInicioLicenca);
  const duracaoMeses = utilizador.duracaoMeses || 12;

   const dataFim = new Date(dataInicio);
  dataFim.setMonth(dataFim.getMonth() + duracaoMeses);

  const agora = new Date();

  return agora <= dataFim;
}
