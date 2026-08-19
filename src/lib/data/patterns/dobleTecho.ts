import type { Pattern } from '../../types';
import { dateAt, genCandles } from '../candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);

export const dobleTecho: Pattern = {
  id: 'doble-techo',
  name: 'Doble techo',
  description:
    'Dos máximos consecutivos a un nivel similar separados por un valle que define la neckline. ' +
    'Cuando el precio rompe por debajo de la neckline se confirma el giro de alcista a bajista. ' +
    'Es uno de los patrones de reversión más fiables para anticipar una tendencia bajista.',
  trends: ['bajista'],
  signal: 'reversion',
  category: 'reversion',
  candles: genCandles({
    seed: 11,
    startDate: START,
    spine: [
      { bar: 0, price: 100 },
      { bar: 18, price: 118 },
      { bar: 26, price: 109 },
      { bar: 36, price: 117.8 },
      { bar: 42, price: 108.8 },
      { bar: 54, price: 96 },
    ],
  }),
  overlays: [
    { kind: 'hline', price: 109, style: 'dashed', label: 'Neckline' },
    { kind: 'marker', time: d(18), position: 'aboveBar', shape: 'arrowDown', text: 'Techo 1' },
    { kind: 'marker', time: d(36), position: 'aboveBar', shape: 'arrowDown', text: 'Techo 2' },
    { kind: 'marker', time: d(44), position: 'aboveBar', shape: 'arrowDown', text: 'Ruptura' },
  ],
};
