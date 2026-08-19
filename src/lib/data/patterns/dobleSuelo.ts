import type { Pattern } from '../../types';
import { dateAt, genCandles } from '../candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);

export const dobleSuelo: Pattern = {
  id: 'doble-suelo',
  name: 'Doble suelo',
  description:
    'Dos mínimos consecutivos a un nivel similar separados por un rebote que define la neckline. ' +
    'La ruptura por encima de la neckline confirma el giro de bajista a alcista. ' +
    'Es la imagen especular del doble techo y anticipa una tendencia alcista.',
  trends: ['alcista'],
  signal: 'reversion',
  category: 'reversion',
  candles: genCandles({
    seed: 12,
    startDate: START,
    spine: [
      { bar: 0, price: 118 },
      { bar: 18, price: 100 },
      { bar: 26, price: 109 },
      { bar: 36, price: 100.3 },
      { bar: 42, price: 109.3 },
      { bar: 54, price: 122 },
    ],
  }),
  overlays: [
    { kind: 'hline', price: 109, style: 'dashed', label: 'Neckline' },
    { kind: 'marker', time: d(18), position: 'belowBar', shape: 'arrowUp', text: 'Suelo 1' },
    { kind: 'marker', time: d(36), position: 'belowBar', shape: 'arrowUp', text: 'Suelo 2' },
    { kind: 'marker', time: d(44), position: 'belowBar', shape: 'arrowUp', text: 'Ruptura' },
  ],
};
