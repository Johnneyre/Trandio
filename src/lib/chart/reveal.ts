import type { AutoscaleInfo, CandlestickData, Time } from "lightweight-charts";
import type { RevealTarget } from "./types";

const MS_PER_BAR = 40;
const MIN_MS = 1200;
const MAX_MS = 1800;
const GROW_MS = 140;

export function revealDuration(bars: number): number {
  return Math.min(MAX_MS, Math.max(MIN_MS, bars * MS_PER_BAR));
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const easeOutBack = (t: number) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;

function grow(c: CandlestickData<Time>, t: number): CandlestickData<Time> {
  const e = easeOutBack(t);
  return {
    ...c,
    high: c.open + (c.high - c.open) * e,
    low: c.open - (c.open - c.low) * e,
    close: c.open + (c.close - c.open) * e,
  };
}

export function playReveal(target: RevealTarget, durationMs = revealDuration(target.data.length)): () => void {
  const { series, data, overlays, onComplete } = target;
  const total = data.length;
  const msPerBar = durationMs / total;

  let min = Infinity;
  let max = -Infinity;
  for (const c of data) {
    if (c.low < min) min = c.low;
    if (c.high > max) max = c.high;
  }
  const lineRange = overlays.valueRange();
  if (lineRange !== null) {
    min = Math.min(min, lineRange.min);
    max = Math.max(max, lineRange.max);
  }
  series.applyOptions({
    autoscaleInfoProvider: (base: () => AutoscaleInfo | null) => ({
      priceRange: { minValue: min, maxValue: max },
      margins: base()?.margins ?? undefined,
    }),
  });

  series.update(grow(data[0], 0));
  let started = 1;
  let settled = 0;

  const step = (elapsed: number) => {
    const count = Math.min(total, Math.floor(elapsed / msPerBar) + 1);
    for (let i = started; i < count; i++) series.update(grow(data[i], 0));
    started = count;

    for (let i = settled; i < started; i++) {
      const t = Math.min(1, (elapsed - i * msPerBar) / GROW_MS);
      const isLast = i === started - 1;
      series.update(t >= 1 ? data[i] : grow(data[i], t), !isLast);
      if (t >= 1 && i === settled) settled++;
    }

    overlays.reveal(started - 1);
    return settled === total;
  };

  let raf = 0;
  let start: number | null = null;
  let finished = false;
  const finish = (completed: boolean) => {
    if (finished) return;
    finished = true;
    series.applyOptions({ autoscaleInfoProvider: undefined });
    if (completed) onComplete?.();
  };

  const frame = (now: number) => {
    start ??= now;
    if (step(now - start)) {
      finish(true);
    } else {
      raf = requestAnimationFrame(frame);
    }
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    finish(false);
  };
}
