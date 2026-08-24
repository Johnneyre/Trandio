import type { Candle, Pattern } from "$lib/types";
import { dateAt } from "$lib/data/candleFactory";
import type { ChartSegment, ChartSpec } from "./types";

const round2 = (n: number) => Math.round(n * 100) / 100;
const COMPOSE_START = '2024-01-01';

export function composePatterns(patterns: Pattern[]): ChartSpec {
  const candles: Candle[] = [];
  const segments: ChartSegment[] = [];
  let startBar = 0;
  let lastClose: number | null = null;

  for (const pattern of patterns) {
    const scale = lastClose === null ? 1 : lastClose / pattern.candles[0].open;
    segments.push({ pattern, startBar, scale });
    for (let i = 0; i < pattern.candles.length; i++) {
      const c = pattern.candles[i];
      candles.push({
        time: dateAt(COMPOSE_START, startBar + i),
        open: round2(c.open * scale),
        high: round2(c.high * scale),
        low: round2(c.low * scale),
        close: round2(c.close * scale),
      });
    }
    lastClose = candles[candles.length - 1].close;
    startBar += pattern.candles.length;
  }

  return { candles, segments };
}
