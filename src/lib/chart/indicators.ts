import type { Candle, PricePoint } from '../types';

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Media móvil simple sobre los cierres; empieza en la barra `period - 1`. */
export function sma(candles: Candle[], period: number): PricePoint[] {
  const out: PricePoint[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    if (i >= period - 1) {
      out.push({ time: candles[i].time, value: round2(sum / period) });
    }
  }
  return out;
}

/** Media móvil exponencial sobre los cierres; arranca con la SMA inicial. */
export function ema(candles: Candle[], period: number): PricePoint[] {
  if (candles.length < period) return [];
  const k = 2 / (period + 1);
  let prev = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
  const out: PricePoint[] = [{ time: candles[period - 1].time, value: round2(prev) }];
  for (let i = period; i < candles.length; i++) {
    prev = candles[i].close * k + prev * (1 - k);
    out.push({ time: candles[i].time, value: round2(prev) });
  }
  return out;
}
