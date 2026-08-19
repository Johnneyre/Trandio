import { COLORS } from '../../chart/theme';
import type { Pattern } from '../../types';
import { dateAt, genCandles } from '../candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);
const p = (bar: number, value: number) => ({ time: d(bar), value });

// Mástil (0→11) + bandera: mini-canal contratendencia con pendiente −0.3/barra.
export const bandera: Pattern = {
  id: 'bandera',
  name: 'Bandera',
  description:
    'Tras un impulso fuerte y casi vertical (el mástil), el precio descansa en un pequeño canal en contra de la tendencia (la bandera). ' +
    'La ruptura de la bandera en la dirección del mástil continúa el movimiento, con objetivo aproximado igual a la longitud del mástil. ' +
    'En tendencia bajista el patrón es idéntico pero invertido.',
  trends: ['alcista'],
  signal: 'continuacion',
  category: 'continuacion',
  candles: genCandles({
    seed: 91,
    startDate: START,
    spine: [
      { bar: 0, price: 100 },
      { bar: 11, price: 124 },
      { bar: 14, price: 119.1 },
      { bar: 17, price: 122.2 },
      { bar: 20, price: 117.3 },
      { bar: 23, price: 120.4 },
      { bar: 26, price: 115.5 },
      { bar: 28, price: 120 },
      { bar: 36, price: 138 },
    ],
  }),
  overlays: [
    {
      kind: 'trendline',
      from: p(0, 100),
      to: p(11, 124),
      color: COLORS.neutral,
      style: 'dotted',
      label: 'Mástil',
    },
    {
      kind: 'channel',
      upper: [p(11, 124), p(27, 119.2)],
      lower: [p(13, 119.4), p(27, 115.2)],
      color: COLORS.trend,
      label: 'Bandera',
    },
    { kind: 'marker', time: d(28), position: 'belowBar', shape: 'arrowUp', text: 'Ruptura' },
  ],
};
