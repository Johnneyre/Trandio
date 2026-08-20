import { COLORS } from '$lib/chart/theme';
import type { Pattern, PatternVariant } from '$lib/types';
import { dateAt, genCandles } from '$lib/data/candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);

const cruceDorado: PatternVariant = {
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

const cruceMuerte: PatternVariant = {
  candles: genCandles({
    seed: 62,
    startDate: START,
    spine: [
      { bar: 0, price: 110 },
      { bar: 20, price: 130 },
      { bar: 28, price: 127 },
      { bar: 56, price: 100 },
    ],
  }),
  overlays: [
    { kind: 'ma', period: 10, color: COLORS.maFast, label: 'SMA 10' },
    { kind: 'ma', period: 30, color: COLORS.maSlow, label: 'SMA 30' },
    {
      kind: 'marker',
      time: d(36),
      position: 'aboveBar',
      shape: 'arrowDown',
      text: 'Cruce de la muerte',
    },
  ],
};

export const mediasMoviles: Pattern = {
  id: 'medias-moviles',
  name: 'Medias móviles (cruce)',
  description:
    'Dos medias móviles de distinto periodo suavizan el precio: cuando la rápida cruza por encima de la lenta se produce el "cruce dorado" (señal alcista) y cuando cruza por debajo, el "cruce de la muerte" (señal bajista). ' +
    'Además de dar señales de entrada, la media lenta actúa como soporte o resistencia dinámica de la tendencia.',
  trends: ['alcista', 'bajista'],
  signal: 'indicador',
  category: 'indicador',
  candles: cruceDorado.candles,
  overlays: cruceDorado.overlays,
  variants: { alcista: cruceDorado, bajista: cruceMuerte },
  defaultDirection: 'alcista',
};
