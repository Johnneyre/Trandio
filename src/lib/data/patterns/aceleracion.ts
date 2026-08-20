import { COLORS } from '$lib/chart/theme';
import type { Pattern, PatternVariant } from '$lib/types';
import { dateAt, genCandles, lineAt } from '$lib/data/candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);
const p = (bar: number, value: number) => ({ time: d(bar), value });

const aceleracionAlcista: PatternVariant = {
  candles: genCandles({
    seed: 71,
    startDate: START,
    spine: [
      { bar: 0, price: 100 },
      { bar: 5, price: 108 },
      { bar: 10, price: 104 },
      { bar: 14, price: 116 },
      { bar: 18, price: 112 },
      { bar: 22, price: 128 },
      { bar: 26, price: 124 },
      { bar: 32, price: 136 },
      { bar: 36, price: 129 },
      { bar: 40, price: 131 },
      { bar: 46, price: 120 },
      { bar: 50, price: 116 },
    ],
  }),
  overlays: [
    {
      kind: 'trendline',
      from: p(0, 100),
      to: p(22, lineAt(0, 100, 0.4, 22)),
      color: COLORS.neutral,
      width: 1,
      label: 'Aceleración 1',
    },
    {
      kind: 'trendline',
      from: p(10, 104),
      to: p(30, lineAt(10, 104, 1.0, 30)),
      color: COLORS.trend,
      width: 1,
      label: 'Aceleración 2',
    },
    {
      kind: 'trendline',
      from: p(18, 112),
      to: p(34, lineAt(18, 112, 1.5, 34)),
      color: COLORS.maFast,
      width: 1,
      label: 'Aceleración 3',
    },
    { kind: 'marker', time: d(36), position: 'aboveBar', shape: 'arrowDown', text: 'Desaceleración' },
  ],
};

const aceleracionBajista: PatternVariant = {
  candles: genCandles({
    seed: 72,
    startDate: START,
    spine: [
      { bar: 0, price: 136 },
      { bar: 5, price: 128 },
      { bar: 10, price: 132 },
      { bar: 14, price: 120 },
      { bar: 18, price: 124 },
      { bar: 22, price: 108 },
      { bar: 26, price: 112 },
      { bar: 32, price: 100 },
      { bar: 36, price: 107 },
      { bar: 40, price: 105 },
      { bar: 46, price: 116 },
      { bar: 50, price: 120 },
    ],
  }),
  overlays: [
    {
      kind: 'trendline',
      from: p(0, 136),
      to: p(22, lineAt(0, 136, -0.4, 22)),
      color: COLORS.neutral,
      width: 1,
      label: 'Aceleración 1',
    },
    {
      kind: 'trendline',
      from: p(10, 132),
      to: p(30, lineAt(10, 132, -1.0, 30)),
      color: COLORS.trend,
      width: 1,
      label: 'Aceleración 2',
    },
    {
      kind: 'trendline',
      from: p(18, 124),
      to: p(34, lineAt(18, 124, -1.5, 34)),
      color: COLORS.maFast,
      width: 1,
      label: 'Aceleración 3',
    },
    { kind: 'marker', time: d(36), position: 'belowBar', shape: 'arrowUp', text: 'Desaceleración' },
  ],
};

export const aceleracion: Pattern = {
  id: 'aceleracion',
  name: 'Aceleración y desaceleración',
  description:
    'Cada corrección de la tendencia deja una línea directriz más empinada que la anterior, formando un abanico que mide la aceleración del movimiento. ' +
    'Cuando el precio no consigue sostener la pendiente más empinada y la rompe, la tendencia se desacelera: es el primer aviso de corrección o de giro. ' +
    'Funciona igual en tendencias alcistas y bajistas.',
  trends: ['alcista', 'bajista'],
  signal: 'continuacion',
  category: 'continuacion',
  candles: aceleracionAlcista.candles,
  overlays: aceleracionAlcista.overlays,
  variants: { alcista: aceleracionAlcista, bajista: aceleracionBajista },
  defaultDirection: 'alcista',
};
