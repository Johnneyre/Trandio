import type { IPriceLine, ISeriesApi } from "lightweight-charts";
import type { Candle, LineStyleKind, Pattern } from "$lib/types";

export interface ChartSegment {
  pattern: Pattern;
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
