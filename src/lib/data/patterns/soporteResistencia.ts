import { COLORS } from '../../chart/theme';
import type { Pattern } from '../../types';
import { dateAt, genCandles } from '../candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);

export const soporteResistencia: Pattern = {
  id: 'soporte-resistencia',
  name: 'Soporte y resistencia',
  description:
    'Niveles horizontales donde el precio reacciona una y otra vez: el soporte frena las caídas y la resistencia frena las subidas. ' +
    'Cuantos más toques acumula un nivel, más relevante es; su ruptura convierte el soporte en resistencia y viceversa.',
  trends: ['rango'],
  signal: 'nivel',
  category: 'nivel',
  candles: genCandles({
    seed: 99,
    startDate: START,
    spine: [
      { bar: 0, price: 101 },
      { bar: 6, price: 111.8 },
      { bar: 12, price: 100.2 },
      { bar: 18, price: 111.5 },
      { bar: 24, price: 100 },
      { bar: 30, price: 112 },
      { bar: 36, price: 100.3 },
      { bar: 42, price: 111.7 },
      { bar: 48, price: 105 },
    ],
  }),
  overlays: [
    { kind: 'hline', price: 112, color: COLORS.down, style: 'solid', label: 'Resistencia' },
    { kind: 'hline', price: 100, color: COLORS.up, style: 'solid', label: 'Soporte' },
    { kind: 'marker', time: d(24), position: 'belowBar', shape: 'circle' },
    { kind: 'marker', time: d(30), position: 'aboveBar', shape: 'circle' },
  ],
};
