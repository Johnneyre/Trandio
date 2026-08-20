import type { Pattern, PatternVariant } from '$lib/types';
import { dateAt, genCandles } from '$lib/data/candleFactory';

const START = '2024-01-01';
const d = (bar: number) => dateAt(START, bar);
const p = (bar: number, value: number) => ({ time: d(bar), value });

const andrewsAlcista: PatternVariant = {
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
      variant: 'andrews',
      label: 'Tridente de Andrews',
    },
    { kind: 'marker', time: d(4), position: 'belowBar', shape: 'circle', text: 'A' },
    { kind: 'marker', time: d(16), position: 'aboveBar', shape: 'circle', text: 'B' },
    { kind: 'marker', time: d(24), position: 'belowBar', shape: 'circle', text: 'C' },
  ],
};

const andrewsBajista: PatternVariant = {
  candles: genCandles({
    seed: 54,
    startDate: START,
    spine: [
      { bar: 0, price: 132 },
      { bar: 4, price: 136 },
      { bar: 16, price: 120 },
      { bar: 24, price: 128 },
      { bar: 30, price: 116 },
      { bar: 36, price: 108 },
      { bar: 42, price: 109 },
      { bar: 48, price: 99 },
      { bar: 52, price: 100 },
    ],
  }),
  overlays: [
    {
      kind: 'pitchfork',
      a: p(4, 136),
      b: p(16, 120),
      c: p(24, 128),
      extendToTime: d(52),
      variant: 'andrews',
      label: 'Tridente de Andrews',
    },
    { kind: 'marker', time: d(4), position: 'aboveBar', shape: 'circle', text: 'A' },
    { kind: 'marker', time: d(16), position: 'belowBar', shape: 'circle', text: 'B' },
    { kind: 'marker', time: d(24), position: 'aboveBar', shape: 'circle', text: 'C' },
  ],
};

export const pitchfork: Pattern = {
  id: 'pitchfork',
  name: 'Tridente de Andrews',
  description:
    'Se traza con tres pivotes: un extremo (A) y los dos puntos del retroceso siguiente (B y C). ' +
    'La mediana parte de A hacia el punto medio de B-C y actúa como imán del precio, mientras las púas paralelas funcionan como soporte y resistencia dinámicos. ' +
    'Sirve para operar la continuación tanto en tendencias alcistas como bajistas.',
  trends: ['alcista', 'bajista'],
  signal: 'continuacion',
  category: 'canal',
  candles: andrewsAlcista.candles,
  overlays: andrewsAlcista.overlays,
  variants: { alcista: andrewsAlcista, bajista: andrewsBajista },
  defaultDirection: 'alcista',
};

const schiffBajista: PatternVariant = {
  candles: genCandles({
    seed: 52,
    startDate: START,
    spine: [
      { bar: 0, price: 131 },
      { bar: 4, price: 136 },
      { bar: 16, price: 118 },
      { bar: 24, price: 126 },
      { bar: 30, price: 119 },
      { bar: 36, price: 115.5 },
      { bar: 42, price: 116.5 },
      { bar: 48, price: 111 },
      { bar: 52, price: 112 },
    ],
  }),
  overlays: [
    {
      kind: 'pitchfork',
      a: p(4, 136),
      b: p(16, 118),
      c: p(24, 126),
      extendToTime: d(52),
      variant: 'schiff',
      label: 'Tridente Schiff',
    },
    { kind: 'marker', time: d(4), position: 'aboveBar', shape: 'circle', text: 'A' },
    { kind: 'marker', time: d(16), position: 'belowBar', shape: 'circle', text: 'B' },
    { kind: 'marker', time: d(24), position: 'aboveBar', shape: 'circle', text: 'C' },
  ],
};

const schiffAlcista: PatternVariant = {
  candles: genCandles({
    seed: 55,
    startDate: START,
    spine: [
      { bar: 0, price: 105 },
      { bar: 4, price: 100 },
      { bar: 16, price: 118 },
      { bar: 24, price: 110 },
      { bar: 30, price: 117 },
      { bar: 36, price: 120.5 },
      { bar: 42, price: 119.5 },
      { bar: 48, price: 125 },
      { bar: 52, price: 124 },
    ],
  }),
  overlays: [
    {
      kind: 'pitchfork',
      a: p(4, 100),
      b: p(16, 118),
      c: p(24, 110),
      extendToTime: d(52),
      variant: 'schiff',
      label: 'Tridente Schiff',
    },
    { kind: 'marker', time: d(4), position: 'belowBar', shape: 'circle', text: 'A' },
    { kind: 'marker', time: d(16), position: 'aboveBar', shape: 'circle', text: 'B' },
    { kind: 'marker', time: d(24), position: 'belowBar', shape: 'circle', text: 'C' },
  ],
};

export const pitchforkSchiff: Pattern = {
  id: 'tridente-schiff',
  name: 'Tridente Schiff',
  description:
    'Variante del tridente de Andrews en la que la mediana no parte de A sino del punto medio entre A y B (en precio). ' +
    'Resulta en un canal menos empinado, útil cuando el impulso inicial es tan vertical que el tridente clásico queda fuera del precio.',
  trends: ['alcista', 'bajista'],
  signal: 'continuacion',
  category: 'canal',
  candles: schiffAlcista.candles,
  overlays: schiffAlcista.overlays,
  variants: { alcista: schiffAlcista, bajista: schiffBajista },
  defaultDirection: 'alcista',
};

const schiffModAlcista: PatternVariant = {
  candles: genCandles({
    seed: 53,
    startDate: START,
    spine: [
      { bar: 0, price: 104.5 },
      { bar: 4, price: 100 },
      { bar: 16, price: 118 },
      { bar: 24, price: 110 },
      { bar: 30, price: 119.5 },
      { bar: 36, price: 121 },
      { bar: 42, price: 125.5 },
      { bar: 48, price: 127 },
      { bar: 52, price: 130.5 },
    ],
  }),
  overlays: [
    {
      kind: 'pitchfork',
      a: p(4, 100),
      b: p(16, 118),
      c: p(24, 110),
      extendToTime: d(52),
      variant: 'schiff-mod',
      label: 'Tridente Schiff modificado',
    },
    { kind: 'marker', time: d(4), position: 'belowBar', shape: 'circle', text: 'A' },
    { kind: 'marker', time: d(16), position: 'aboveBar', shape: 'circle', text: 'B' },
    { kind: 'marker', time: d(24), position: 'belowBar', shape: 'circle', text: 'C' },
  ],
};

const schiffModBajista: PatternVariant = {
  candles: genCandles({
    seed: 56,
    startDate: START,
    spine: [
      { bar: 0, price: 125.5 },
      { bar: 4, price: 130 },
      { bar: 16, price: 112 },
      { bar: 24, price: 120 },
      { bar: 30, price: 110.5 },
      { bar: 36, price: 109 },
      { bar: 42, price: 104.5 },
      { bar: 48, price: 103 },
      { bar: 52, price: 99.5 },
    ],
  }),
  overlays: [
    {
      kind: 'pitchfork',
      a: p(4, 130),
      b: p(16, 112),
      c: p(24, 120),
      extendToTime: d(52),
      variant: 'schiff-mod',
      label: 'Tridente Schiff modificado',
    },
    { kind: 'marker', time: d(4), position: 'aboveBar', shape: 'circle', text: 'A' },
    { kind: 'marker', time: d(16), position: 'belowBar', shape: 'circle', text: 'B' },
    { kind: 'marker', time: d(24), position: 'aboveBar', shape: 'circle', text: 'C' },
  ],
};

export const pitchforkSchiffMod: Pattern = {
  id: 'tridente-schiff-modificado',
  name: 'Tridente Schiff modificado',
  description:
    'Segunda variante de Schiff: la mediana se ancla en el punto medio entre A y B tanto en precio como en tiempo. ' +
    'Produce una pendiente intermedia entre el tridente clásico y el Schiff, y es la variante más usada en canales de tendencia sostenida.',
  trends: ['alcista', 'bajista'],
  signal: 'continuacion',
  category: 'canal',
  candles: schiffModAlcista.candles,
  overlays: schiffModAlcista.overlays,
  variants: { alcista: schiffModAlcista, bajista: schiffModBajista },
  defaultDirection: 'alcista',
};
