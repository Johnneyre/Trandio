import type { Pattern } from '../../types';
import { dateAt, genCandles } from '../candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);
const p = (bar: number, value: number) => ({ time: d(bar), value });

export const pitchfork: Pattern = {
  id: 'pitchfork',
  name: 'Tridente de Andrews',
  description:
    'Se traza con tres pivotes: un extremo (A) y los dos puntos del retroceso siguiente (B y C). ' +
    'La mediana parte de A hacia el punto medio de BC y actúa como imán del precio, mientras las púas paralelas funcionan como soporte y resistencia dinámicos. ' +
    'Sirve para operar la continuación tanto en tendencias alcistas como bajistas.',
  trends: ['alcista', 'bajista'],
  signal: 'continuacion',
  category: 'canal',
  candles: genCandles({
    seed: 51,
    startDate: START,
    spine: [
      { bar: 0, price: 104 },
      { bar: 4, price: 100 },
      { bar: 16, price: 116 },
      { bar: 24, price: 108 },
      { bar: 30, price: 120 },
      { bar: 36, price: 128 },
      { bar: 42, price: 127 },
      { bar: 48, price: 137 },
      { bar: 52, price: 136 },
    ],
  }),
  overlays: [
    {
      kind: 'pitchfork',
      a: p(4, 100),
      b: p(16, 116),
      c: p(24, 108),
      extendToTime: d(52),
      label: 'Tridente',
    },
    { kind: 'marker', time: d(4), position: 'belowBar', shape: 'circle', text: 'A' },
    { kind: 'marker', time: d(16), position: 'aboveBar', shape: 'circle', text: 'B' },
    { kind: 'marker', time: d(24), position: 'belowBar', shape: 'circle', text: 'C' },
  ],
};
