import type { Candle } from '$lib/types';

export const TIMEFRAMES_SEC = [60, 300, 900, 1800, 3600, 7200, 14400, 86400];

export function resampleCandles(candles: Candle[], bucketSec: number): Candle[] {
  const out: Candle[] = [];
  let current: Candle | null = null;
  for (const c of candles) {
    const bucket = Math.floor((c.time as number) / bucketSec) * bucketSec;
    if (current === null || (current.time as number) !== bucket) {
      current = { time: bucket, open: c.open, high: c.high, low: c.low, close: c.close };
      out.push(current);
    } else {
      current.high = Math.max(current.high, c.high);
      current.low = Math.min(current.low, c.low);
      current.close = c.close;
    }
  }
  return out;
}
