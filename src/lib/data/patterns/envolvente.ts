import { COLORS } from '$lib/chart/theme';
import type { Pattern } from '$lib/types';
import { dateAt, genCandles } from '$lib/data/candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);

export const envolventeAlcista: Pattern = {
  id: 'envolvente-alcista',
  name: 'Vela envolvente alcista',
  description:
    'Tras una caída, una vela verde cuyo cuerpo envuelve por completo el cuerpo de la vela roja anterior. ' +
    'Muestra que los compradores absorbieron toda la presión vendedora en una sola sesión. ' +
    'Gana fiabilidad cuando aparece sobre un soporte o en la zona baja de un rango.',
  trends: ['alcista', 'rango'],
  signal: 'reversion',
  category: 'vela',
  candles: genCandles({
    seed: 42,
    startDate: START,
    spine: [
      { bar: 0, price: 112 },
      { bar: 23, price: 99 },
      { bar: 28, price: 103.5 },
      { bar: 40, price: 112 },
    ],
    overrides: {
      23: { open: 99.6, close: 98.9, high: 99.8, low: 98.6 },
      24: { open: 98.6, close: 101.0, high: 101.3, low: 98.3 },
    },
  }),
  overlays: [
    { kind: 'ma', period: 9, color: COLORS.maFast, label: 'SMA 9' },
    { kind: 'marker', time: d(24), position: 'aboveBar', shape: 'circle', text: 'Envolvente' },
    { kind: 'marker', time: d(24), position: 'belowBar', shape: 'arrowUp', text: 'Compra' },
  ],
};

export const envolventeBajista: Pattern = {
  id: 'envolvente-bajista',
  name: 'Vela envolvente bajista',
  description:
    'Tras una subida, una vela roja cuyo cuerpo envuelve por completo el cuerpo de la vela verde anterior. ' +
    'Indica que los vendedores tomaron el control de la sesión y suele anticipar el inicio de un tramo bajista. ' +
    'Gana fiabilidad cuando aparece bajo una resistencia o en la zona alta de un rango.',
  trends: ['bajista', 'rango'],
  signal: 'reversion',
  category: 'vela',
  candles: genCandles({
    seed: 43,
    startDate: START,
    spine: [
      { bar: 0, price: 98 },
      { bar: 23, price: 111 },
      { bar: 28, price: 106.5 },
      { bar: 40, price: 98 },
    ],
    overrides: {
      23: { open: 110.4, close: 111.1, high: 111.4, low: 110.2 },
      24: { open: 111.4, close: 109.0, high: 111.7, low: 108.7 },
    },
  }),
  overlays: [
    { kind: 'ma', period: 9, color: COLORS.maFast, label: 'SMA 9' },
    { kind: 'marker', time: d(24), position: 'belowBar', shape: 'circle', text: 'Envolvente' },
    { kind: 'marker', time: d(24), position: 'aboveBar', shape: 'arrowDown', text: 'Venta' },
  ],
};
