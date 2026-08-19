export type Trend = 'alcista' | 'bajista' | 'rango';

export type Signal = 'continuacion' | 'reversion' | 'indicador' | 'nivel';

export type PatternCategory =
  | 'reversion'
  | 'continuacion'
  | 'vela'
  | 'canal'
  | 'indicador'
  | 'nivel';

/** `time` siempre en formato 'yyyy-mm-dd' (BusinessDay de lightweight-charts). */
export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PricePoint {
  time: string;
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
      time: string;
      position: 'aboveBar' | 'belowBar';
      shape: MarkerShape;
      color?: string;
      text?: string;
    };

export interface Pattern {
  id: string;
  name: string;
  description: string;
  trends: Trend[];
  signal: Signal;
  category: PatternCategory;
  candles: Candle[];
  overlays: Overlay[];
}
