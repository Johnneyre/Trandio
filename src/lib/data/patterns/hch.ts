import type { Pattern } from '../../types';
import { dateAt, genCandles } from '../candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);

export const hch: Pattern = {
  id: 'hch',
  name: 'Hombro-cabeza-hombro',
  description:
    'Tres máximos consecutivos donde el central (la cabeza) es el más alto y los laterales (hombros) quedan a niveles similares. ' +
    'La línea que une los valles es la neckline: su ruptura a la baja confirma el fin de la tendencia alcista y el inicio de una bajista.',
  trends: ['bajista'],
  signal: 'reversion',
  category: 'reversion',
  candles: genCandles({
    seed: 13,
    startDate: START,
    spine: [
      { bar: 0, price: 98 },
      { bar: 10, price: 110 },
      { bar: 15, price: 105 },
      { bar: 24, price: 120 },
      { bar: 30, price: 105.5 },
      { bar: 38, price: 111 },
      { bar: 44, price: 104.8 },
      { bar: 52, price: 92 },
    ],
  }),
  overlays: [
    { kind: 'hline', price: 105, style: 'dashed', label: 'Neckline' },
    { kind: 'marker', time: d(10), position: 'aboveBar', shape: 'circle', text: 'Hombro' },
    { kind: 'marker', time: d(24), position: 'aboveBar', shape: 'circle', text: 'Cabeza' },
    { kind: 'marker', time: d(38), position: 'aboveBar', shape: 'circle', text: 'Hombro' },
    { kind: 'marker', time: d(46), position: 'aboveBar', shape: 'arrowDown', text: 'Ruptura' },
  ],
};

export const hchInvertido: Pattern = {
  id: 'hch-invertido',
  name: 'HCH invertido',
  description:
    'Versión especular del hombro-cabeza-hombro: tres mínimos donde el central es el más profundo. ' +
    'La ruptura al alza de la neckline confirma el giro de bajista a alcista.',
  trends: ['alcista'],
  signal: 'reversion',
  category: 'reversion',
  candles: genCandles({
    seed: 14,
    startDate: START,
    spine: [
      { bar: 0, price: 122 },
      { bar: 10, price: 110 },
      { bar: 15, price: 115 },
      { bar: 24, price: 100 },
      { bar: 30, price: 114.5 },
      { bar: 38, price: 109 },
      { bar: 44, price: 115.2 },
      { bar: 52, price: 128 },
    ],
  }),
  overlays: [
    { kind: 'hline', price: 115, style: 'dashed', label: 'Neckline' },
    { kind: 'marker', time: d(10), position: 'belowBar', shape: 'circle', text: 'Hombro' },
    { kind: 'marker', time: d(24), position: 'belowBar', shape: 'circle', text: 'Cabeza' },
    { kind: 'marker', time: d(38), position: 'belowBar', shape: 'circle', text: 'Hombro' },
    { kind: 'marker', time: d(46), position: 'belowBar', shape: 'arrowUp', text: 'Ruptura' },
  ],
};
