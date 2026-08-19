import { COLORS } from '../../chart/theme';
import type { Pattern } from '../../types';
import { dateAt, genCandles } from '../candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);

export const mediasMoviles: Pattern = {
  id: 'medias-moviles',
  name: 'Medias móviles (cruce)',
  description:
    'Dos medias móviles de distinto periodo suavizan el precio: cuando la rápida cruza por encima de la lenta se produce el "cruce dorado" (señal alcista) y cuando cruza por debajo, el "cruce de la muerte" (señal bajista). ' +
    'Además de dar señales de entrada, la media lenta actúa como soporte o resistencia dinámica de la tendencia.',
  trends: ['alcista', 'bajista'],
  signal: 'indicador',
  category: 'indicador',
  candles: genCandles({
    seed: 61,
    startDate: START,
    spine: [
      { bar: 0, price: 120 },
      { bar: 20, price: 100 },
      { bar: 28, price: 103 },
      { bar: 56, price: 130 },
    ],
  }),
  overlays: [
    { kind: 'ma', period: 10, color: COLORS.maFast, label: 'SMA 10' },
    { kind: 'ma', period: 30, color: COLORS.maSlow, label: 'SMA 30' },
    { kind: 'marker', time: d(36), position: 'belowBar', shape: 'arrowUp', text: 'Cruce dorado' },
  ],
};
