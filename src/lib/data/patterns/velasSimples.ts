import type { Pattern, PatternVariant } from '$lib/types';
import { dateAt, genCandles } from '$lib/data/candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);

export const martillo: Pattern = {
  id: 'martillo',
  name: 'Martillo',
  description:
    'Tras una caída, vela de cuerpo pequeño con una mecha inferior de al menos dos veces el cuerpo: los vendedores empujaron el precio abajo pero los compradores lo recuperaron antes del cierre. ' +
    'Es una señal de reversión alcista, sobre todo si la vela siguiente confirma cerrando por encima.',
  trends: ['alcista'],
  signal: 'reversion',
  category: 'vela',
  candles: genCandles({
    seed: 95,
    startDate: START,
    spine: [
      { bar: 0, price: 116 },
      { bar: 22, price: 100 },
      { bar: 26, price: 103 },
      { bar: 38, price: 112 },
    ],
    overrides: {
      22: { open: 100.6, close: 101.2, high: 101.4, low: 97.6 },
    },
  }),
  overlays: [
    { kind: 'marker', time: d(22), position: 'aboveBar', shape: 'circle', text: 'Martillo' },
    { kind: 'marker', time: d(22), position: 'belowBar', shape: 'arrowUp', text: 'Compra' },
  ],
};

export const estrellaFugaz: Pattern = {
  id: 'estrella-fugaz',
  name: 'Estrella fugaz',
  description:
    'Tras una subida, vela de cuerpo pequeño con una mecha superior larga: los compradores intentaron seguir subiendo pero los vendedores rechazaron el avance. ' +
    'Anticipa una reversión bajista, especialmente bajo una resistencia.',
  trends: ['bajista'],
  signal: 'reversion',
  category: 'vela',
  candles: genCandles({
    seed: 96,
    startDate: START,
    spine: [
      { bar: 0, price: 100 },
      { bar: 22, price: 116 },
      { bar: 26, price: 113 },
      { bar: 38, price: 104 },
    ],
    overrides: {
      22: { open: 115.5, close: 114.9, high: 118.9, low: 114.6 },
    },
  }),
  overlays: [
    { kind: 'marker', time: d(22), position: 'belowBar', shape: 'circle', text: 'Estrella fugaz' },
    { kind: 'marker', time: d(22), position: 'aboveBar', shape: 'arrowDown', text: 'Venta' },
  ],
};

const dojiBajista: PatternVariant = {
  candles: genCandles({
    seed: 97,
    startDate: START,
    spine: [
      { bar: 0, price: 100 },
      { bar: 20, price: 112 },
      { bar: 24, price: 110 },
      { bar: 34, price: 104 },
    ],
    overrides: {
      20: { open: 112, close: 112.1, high: 113.9, low: 110.4 },
    },
  }),
  overlays: [
    { kind: 'marker', time: d(20), position: 'aboveBar', shape: 'circle', text: 'Doji' },
  ],
};

const dojiAlcista: PatternVariant = {
  candles: genCandles({
    seed: 98,
    startDate: START,
    spine: [
      { bar: 0, price: 112 },
      { bar: 20, price: 100 },
      { bar: 24, price: 102 },
      { bar: 34, price: 108 },
    ],
    overrides: {
      20: { open: 100, close: 99.9, high: 101.6, low: 98.1 },
    },
  }),
  overlays: [
    { kind: 'marker', time: d(20), position: 'belowBar', shape: 'circle', text: 'Doji' },
  ],
};

export const doji: Pattern = {
  id: 'doji',
  name: 'Doji',
  description:
    'Apertura y cierre prácticamente iguales: equilibrio total entre compradores y vendedores. ' +
    'Por sí solo marca indecisión; tras un impulso o en los extremos de un rango suele preceder a un giro del precio.',
  trends: ['rango', 'alcista', 'bajista'],
  signal: 'reversion',
  category: 'vela',
  candles: dojiAlcista.candles,
  overlays: dojiAlcista.overlays,
  variants: { alcista: dojiAlcista, bajista: dojiBajista },
  defaultDirection: 'alcista',
};
