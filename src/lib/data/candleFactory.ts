import type { Candle } from '$lib/types';

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = Math.trunc(a);
    a = Math.trunc(a + 0x6d2b79f5);
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SpinePoint {
  bar: number;
  price: number;
}

const DAY_MS = 86_400_000;

export function dateAt(startDate: string, bar: number): string {
  const t = new Date(`${startDate}T00:00:00Z`).getTime() + bar * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}

export function lineAt(b0: number, p0: number, slope: number, bar: number): number {
  return p0 + slope * (bar - b0);
}

function spineValue(spine: SpinePoint[], bar: number): number {
  if (bar <= spine[0].bar) return spine[0].price;
  for (let i = 1; i < spine.length; i++) {
    const prev = spine[i - 1];
    const next = spine[i];
    if (bar <= next.bar) {
      const t = (bar - prev.bar) / (next.bar - prev.bar);
      return prev.price + (next.price - prev.price) * t;
    }
  }
  return spine[spine.length - 1].price;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface GenOptions {
  seed: number;
  spine: SpinePoint[];
  startDate: string;
  noise?: number;
  wick?: number;
  overrides?: Record<number, Partial<Omit<Candle, 'time'>>>;
}

export function genCandles(opts: GenOptions): Candle[] {
  const { seed, spine, startDate, noise = 0.004, wick = 0.005, overrides = {} } = opts;
  const rnd = mulberry32(seed);
  const lastBar = spine[spine.length - 1].bar;
  const candles: Candle[] = [];
  let prevClose = spine[0].price;

  for (let i = 0; i <= lastBar; i++) {
    const base = spineValue(spine, i);
    let close = base * (1 + (rnd() - 0.5) * 2 * noise);
    let open = i === 0 ? base * (1 + (rnd() - 0.5) * noise) : prevClose;
    let high = Math.max(open, close) * (1 + rnd() * wick);
    let low = Math.min(open, close) * (1 - rnd() * wick);

    const o = overrides[i];
    if (o) {
      open = o.open ?? open;
      close = o.close ?? close;
      high = o.high ?? Math.max(open, close);
      low = o.low ?? Math.min(open, close);
    }
    high = Math.max(high, open, close);
    low = Math.min(low, open, close);

    candles.push({
      time: dateAt(startDate, i),
      open: round2(open),
      high: round2(high),
      low: round2(low),
      close: round2(close),
    });
    prevClose = close;
  }
  return candles;
}
