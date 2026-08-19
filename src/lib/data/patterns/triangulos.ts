import { COLORS } from '../../chart/theme';
import type { Pattern } from '../../types';
import { dateAt, genCandles } from '../candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);
const p = (bar: number, value: number) => ({ time: d(bar), value });

export const trianguloAscendente: Pattern = {
  id: 'triangulo-ascendente',
  name: 'Triángulo ascendente',
  description:
    'Resistencia horizontal con mínimos cada vez más altos: los compradores presionan contra un techo fijo. ' +
    'La ruptura al alza de la resistencia suele continuar la tendencia alcista con objetivo igual a la altura del triángulo.',
  trends: ['alcista'],
  signal: 'continuacion',
  category: 'continuacion',
  candles: genCandles({
    seed: 81,
    startDate: START,
    spine: [
      { bar: 0, price: 100 },
      { bar: 5, price: 112 },
      { bar: 10, price: 104 },
      { bar: 15, price: 111.8 },
      { bar: 20, price: 107.5 },
      { bar: 25, price: 112 },
      { bar: 30, price: 110 },
      { bar: 33, price: 111.3 },
      { bar: 35, price: 114 },
      { bar: 42, price: 122 },
    ],
  }),
  overlays: [
    { kind: 'hline', price: 112, color: COLORS.down, style: 'dashed', label: 'Resistencia' },
    {
      kind: 'trendline',
      from: p(0, 100.2),
      to: p(33, 111.2),
      color: COLORS.trend,
      label: 'Soporte ascendente',
    },
    { kind: 'marker', time: d(35), position: 'belowBar', shape: 'arrowUp', text: 'Ruptura' },
  ],
};

export const trianguloDescendente: Pattern = {
  id: 'triangulo-descendente',
  name: 'Triángulo descendente',
  description:
    'Soporte horizontal con máximos cada vez más bajos: los vendedores presionan contra un suelo fijo. ' +
    'La ruptura a la baja del soporte suele continuar la tendencia bajista.',
  trends: ['bajista'],
  signal: 'continuacion',
  category: 'continuacion',
  candles: genCandles({
    seed: 82,
    startDate: START,
    spine: [
      { bar: 0, price: 112 },
      { bar: 5, price: 100.2 },
      { bar: 10, price: 108 },
      { bar: 15, price: 100.4 },
      { bar: 20, price: 104.8 },
      { bar: 25, price: 100.1 },
      { bar: 30, price: 102 },
      { bar: 33, price: 100.6 },
      { bar: 35, price: 97 },
      { bar: 42, price: 90 },
    ],
  }),
  overlays: [
    { kind: 'hline', price: 100, color: COLORS.up, style: 'dashed', label: 'Soporte' },
    {
      kind: 'trendline',
      from: p(0, 111),
      to: p(33, 101.1),
      color: COLORS.trend,
      label: 'Resistencia descendente',
    },
    { kind: 'marker', time: d(35), position: 'aboveBar', shape: 'arrowDown', text: 'Ruptura' },
  ],
};

export const trianguloSimetrico: Pattern = {
  id: 'triangulo-simetrico',
  name: 'Triángulo simétrico',
  description:
    'Máximos decrecientes y mínimos crecientes que comprimen el precio hacia un vértice: el mercado está en pausa y acumula energía. ' +
    'Es típico de fases de rango; la dirección de la ruptura (habitualmente la de la tendencia previa) define el siguiente movimiento.',
  trends: ['rango'],
  signal: 'continuacion',
  category: 'continuacion',
  candles: genCandles({
    seed: 83,
    startDate: START,
    spine: [
      { bar: 0, price: 106 },
      { bar: 4, price: 111.3 },
      { bar: 9, price: 101.6 },
      { bar: 14, price: 109.5 },
      { bar: 19, price: 103.4 },
      { bar: 24, price: 107.7 },
      { bar: 27, price: 104.9 },
      { bar: 30, price: 106.5 },
      { bar: 34, price: 112 },
      { bar: 42, price: 118 },
    ],
  }),
  overlays: [
    {
      kind: 'trendline',
      from: p(0, 112),
      to: p(31, 106.4),
      color: COLORS.trend,
      label: 'Resistencia',
    },
    {
      kind: 'trendline',
      from: p(0, 100),
      to: p(31, 105.6),
      color: COLORS.trend,
      label: 'Soporte',
    },
    { kind: 'marker', time: d(33), position: 'belowBar', shape: 'arrowUp', text: 'Ruptura' },
  ],
};
