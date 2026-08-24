import type { Signal, Trend } from './types';

export const TREND_LABEL: Record<Trend, string> = {
  alcista: 'Alcista',
  bajista: 'Bajista',
  rango: 'Rango',
};

export const SIGNAL_LABEL: Record<Signal, string> = {
  continuacion: 'Continuación',
  reversion: 'Reversión',
  indicador: 'Indicador',
  nivel: 'Nivel',
};
