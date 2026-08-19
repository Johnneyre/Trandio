import { COLORS } from '../../chart/theme';
import type { Pattern } from '../../types';
import { dateAt, genCandles } from '../candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);
const p = (bar: number, value: number) => ({ time: d(bar), value });

// Canal alcista: línea media 100 + 0.4·barra, bandas a ±4.
export const canalAlcista: Pattern = {
  id: 'canal-alcista',
  name: 'Canal alcista',
  description:
    'El precio avanza dentro de dos líneas paralelas con pendiente positiva, rebotando entre soporte y resistencia dinámicos. ' +
    'Mientras el canal se respete, cada toque de la banda inferior es una oportunidad de continuación alcista.',
  trends: ['alcista'],
  signal: 'continuacion',
  category: 'canal',
  candles: genCandles({
    seed: 37,
    startDate: START,
    spine: [
      { bar: 0, price: 100 },
      { bar: 6, price: 106.4 },
      { bar: 13, price: 101.2 },
      { bar: 20, price: 112 },
      { bar: 27, price: 106.8 },
      { bar: 34, price: 117.6 },
      { bar: 41, price: 112.4 },
      { bar: 48, price: 123.2 },
      { bar: 54, price: 120 },
    ],
  }),
  overlays: [
    {
      kind: 'channel',
      upper: [p(0, 104), p(54, 125.6)],
      lower: [p(0, 96), p(54, 117.6)],
      color: COLORS.trend,
      label: 'Canal alcista',
    },
    { kind: 'marker', time: d(13), position: 'belowBar', shape: 'circle' },
    { kind: 'marker', time: d(27), position: 'belowBar', shape: 'circle', text: 'Rebote' },
    { kind: 'marker', time: d(41), position: 'belowBar', shape: 'circle' },
  ],
};

// Canal bajista: línea media 120 − 0.4·barra, bandas a ±4.
export const canalBajista: Pattern = {
  id: 'canal-bajista',
  name: 'Canal bajista',
  description:
    'El precio desciende dentro de dos líneas paralelas con pendiente negativa. ' +
    'Cada toque de la banda superior suele ofrecer continuación bajista mientras el canal no se rompa al alza.',
  trends: ['bajista'],
  signal: 'continuacion',
  category: 'canal',
  candles: genCandles({
    seed: 38,
    startDate: START,
    spine: [
      { bar: 0, price: 120 },
      { bar: 6, price: 121.6 },
      { bar: 13, price: 110.8 },
      { bar: 20, price: 116 },
      { bar: 27, price: 105.2 },
      { bar: 34, price: 110.4 },
      { bar: 41, price: 99.6 },
      { bar: 48, price: 104.8 },
      { bar: 54, price: 101 },
    ],
  }),
  overlays: [
    {
      kind: 'channel',
      upper: [p(0, 124), p(54, 102.4)],
      lower: [p(0, 116), p(54, 94.4)],
      color: COLORS.trend,
      label: 'Canal bajista',
    },
    { kind: 'marker', time: d(20), position: 'aboveBar', shape: 'circle', text: 'Rebote' },
    { kind: 'marker', time: d(34), position: 'aboveBar', shape: 'circle' },
    { kind: 'marker', time: d(48), position: 'aboveBar', shape: 'circle' },
  ],
};

// Canal lateral: rango horizontal entre 100 y 110.
export const canalLateral: Pattern = {
  id: 'canal-lateral',
  name: 'Canal lateral (rango)',
  description:
    'El precio oscila sin dirección entre un soporte y una resistencia horizontales. ' +
    'La estrategia clásica es comprar en el soporte y vender en la resistencia hasta que una ruptura con volumen defina la nueva tendencia.',
  trends: ['rango'],
  signal: 'continuacion',
  category: 'canal',
  candles: genCandles({
    seed: 39,
    startDate: START,
    spine: [
      { bar: 0, price: 100.5 },
      { bar: 8, price: 110 },
      { bar: 16, price: 100 },
      { bar: 24, price: 109.8 },
      { bar: 32, price: 100.2 },
      { bar: 40, price: 110 },
      { bar: 46, price: 100 },
      { bar: 52, price: 109.5 },
      { bar: 56, price: 105 },
    ],
  }),
  overlays: [
    { kind: 'hline', price: 110, color: COLORS.down, style: 'dashed', label: 'Resistencia' },
    { kind: 'hline', price: 100, color: COLORS.up, style: 'dashed', label: 'Soporte' },
    { kind: 'marker', time: d(24), position: 'aboveBar', shape: 'circle' },
    { kind: 'marker', time: d(32), position: 'belowBar', shape: 'circle' },
  ],
};
