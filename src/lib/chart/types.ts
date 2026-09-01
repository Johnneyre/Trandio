import type {
  CandlestickData,
  CreatePriceLineOptions,
  IPriceLine,
  ISeriesApi,
  SeriesMarker,
  Time,
} from "lightweight-charts";
import type { Candle, LineStyleKind, Pattern } from "$lib/types";

export type ChartPattern = Pick<Pattern, "candles" | "overlays">;

export interface ChartSegment {
  pattern: ChartPattern;
  startBar: number;
  scale: number;
}

export interface ChartSpec {
  candles: Candle[];
  segments: ChartSegment[];
}

export interface LineOpts {
  color: string;
  style?: LineStyleKind;
  width?: number;
}

export interface OverlayHandles {
  lines: ISeriesApi<"Line">[];
  priceLines: IPriceLine[];
}

export interface OverlayOptions {
  compactLabels?: boolean;
}

export interface BarPoint {
  bar: number;
  value: number;
}

export interface LineDef {
  points: BarPoint[];
  opts: LineOpts;
}

export interface LevelDef {
  revealBar: number;
  options: CreatePriceLineOptions;
}

export interface MarkerDef {
  bar: number;
  marker: SeriesMarker<Time>;
}

export interface OverlayDefs {
  lines: LineDef[];
  levels: LevelDef[];
  markers: MarkerDef[];
}

export interface ValueRange {
  min: number;
  max: number;
}

export interface OverlayController {
  reveal(bar: number): void;
  valueRange(): ValueRange | null;
  dispose(): void;
}

export interface RevealTarget {
  series: ISeriesApi<"Candlestick">;
  data: CandlestickData<Time>[];
  overlays: OverlayController;
  onComplete?: () => void;
}
