export type Trend = 'alcista' | 'bajista' | 'rango';

export type Direction = 'alcista' | 'bajista';

export type Signal = 'continuacion' | 'reversion' | 'indicador' | 'nivel';

export type PatternCategory =
  | 'reversion'
  | 'continuacion'
  | 'vela'
  | 'canal'
  | 'indicador'
  | 'nivel';

export type TimeValue = string | number;

export interface Candle {
  time: TimeValue;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PricePoint {
  time: TimeValue;
  value: number;
}

export type LineStyleKind = 'solid' | 'dashed' | 'dotted';

export type MarkerShape = 'arrowUp' | 'arrowDown' | 'circle' | 'square';

export type Overlay =
  | {
      kind: 'trendline';
      from: PricePoint;
      to: PricePoint;
      color?: string;
      style?: LineStyleKind;
      width?: number;
      label?: string;
    }
  | {
      kind: 'channel';
      upper: [PricePoint, PricePoint];
      lower: [PricePoint, PricePoint];
      color?: string;
      label?: string;
    }
  | {
      kind: 'pitchfork';
      a: PricePoint;
      b: PricePoint;
      c: PricePoint;
      extendToTime: string;
      variant?: 'andrews' | 'schiff' | 'schiff-mod';
      color?: string;
      label?: string;
    }
  | {
      kind: 'ma';
      period: number;
      type?: 'sma' | 'ema';
      color?: string;
      label?: string;
    }
  | {
      kind: 'hline';
      price: number;
      color?: string;
      style?: LineStyleKind;
      label?: string;
    }
  | {
      kind: 'marker';
      time: TimeValue;
      position: 'aboveBar' | 'belowBar';
      shape: MarkerShape;
      color?: string;
      text?: string;
    };

export interface PatternVariant {
  candles: Candle[];
  overlays: Overlay[];
}

export interface CsvMeta {
  rows: number;
  skipped: number;
  intervalSec: number;
  from: number;
  to: number;
}

export type CsvResult =
  | { ok: true; candles: Candle[]; maOverlays: Overlay[]; meta: CsvMeta }
  | { ok: false; error: string };

export interface Detection {
  id: string;
  patternId: string;
  from: TimeValue;
  to: TimeValue;
  overlays: Overlay[];
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  trends: Trend[];
  signal: Signal;
  category: PatternCategory;
  candles: Candle[];
  overlays: Overlay[];
  variants?: Record<Direction, PatternVariant>;
  defaultDirection?: Direction;
}
