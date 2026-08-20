import { COLORS } from '$lib/chart/theme';
import type { Pattern } from '$lib/types';
import { dateAt, genCandles, lineAt } from '$lib/data/candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);
const p = (bar: number, value: number) => ({ time: d(bar), value });

export const cunaAscendente: Pattern = {
  id: 'cuna-ascendente',
  name: 'Cuña ascendente',
  description:
    'Máximos y mínimos crecientes encajados entre dos líneas convergentes con pendiente alcista: los mínimos suben más rápido que los máximos. ' +
    'Esa compresión delata agotamiento comprador, y la ruptura del soporte de la cuña suele dar paso a una tendencia bajista.',
  trends: ['bajista'],
  signal: 'reversion',
  category: 'reversion',
  candles: genCandles({
    seed: 23,
    startDate: START,
    spine: [
      { bar: 0, price: 100.3 },
      { bar: 6, price: 110.4 },
      { bar: 12, price: 106.6 },
      { bar: 18, price: 115.2 },
      { bar: 24, price: 113.2 },
      { bar: 30, price: 120 },
      { bar: 35, price: 119.3 },
      { bar: 38, price: 121.5 },
      { bar: 40, price: 118 },
      { bar: 44, price: 110 },
      { bar: 50, price: 104 },
    ],
  }),
  overlays: [
    {
      kind: 'trendline',
      from: p(0, 100),
      to: p(42, lineAt(0, 100, 0.55, 42)),
      color: COLORS.trend,
      label: 'Soporte de la cuña',
    },
    {
      kind: 'trendline',
      from: p(0, 108),
      to: p(42, lineAt(0, 108, 0.4, 42)),
      color: COLORS.trend,
      label: 'Resistencia de la cuña',
    },
    { kind: 'hline', price: 122.5, color: COLORS.down, style: 'dotted', label: 'Stop Loss' },
    { kind: 'hline', price: 104, color: COLORS.up, style: 'dotted', label: 'Take Profit' },
    { kind: 'marker', time: d(40), position: 'aboveBar', shape: 'arrowDown', text: 'Ruptura' },
  ],
};

export const cunaDescendente: Pattern = {
  id: 'cuna-descendente',
  name: 'Cuña descendente',
  description:
    'Máximos y mínimos decrecientes entre dos líneas convergentes con pendiente bajista: los máximos caen más rápido que los mínimos. ' +
    'La presión vendedora se agota y la ruptura al alza de la resistencia de la cuña suele iniciar una tendencia alcista.',
  trends: ['alcista'],
  signal: 'reversion',
  category: 'reversion',
  candles: genCandles({
    seed: 24,
    startDate: START,
    spine: [
      { bar: 0, price: 119.7 },
      { bar: 6, price: 109.6 },
      { bar: 12, price: 113.4 },
      { bar: 18, price: 104.8 },
      { bar: 24, price: 106.8 },
      { bar: 30, price: 100 },
      { bar: 35, price: 100.8 },
      { bar: 38, price: 99 },
      { bar: 40, price: 103 },
      { bar: 44, price: 112 },
      { bar: 50, price: 118 },
    ],
  }),
  overlays: [
    {
      kind: 'trendline',
      from: p(0, 120),
      to: p(42, lineAt(0, 120, -0.55, 42)),
      color: COLORS.trend,
      label: 'Resistencia de la cuña',
    },
    {
      kind: 'trendline',
      from: p(0, 112),
      to: p(42, lineAt(0, 112, -0.4, 42)),
      color: COLORS.trend,
      label: 'Soporte de la cuña',
    },
    { kind: 'hline', price: 97.5, color: COLORS.down, style: 'dotted', label: 'Stop Loss' },
    { kind: 'hline', price: 116, color: COLORS.up, style: 'dotted', label: 'Take Profit' },
    { kind: 'marker', time: d(40), position: 'belowBar', shape: 'arrowUp', text: 'Ruptura' },
  ],
};
