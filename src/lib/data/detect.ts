import type { Candle, Detection, Overlay } from "$lib/types";
import { COLORS } from "$lib/chart/theme";
import { sma } from "$lib/chart/indicators";

interface Pivot {
  i: number;
  price: number;
}

interface Line {
  slope: number;
  intercept: number;
  maxResidual: number;
}

const FLAT = 0.25;
const CONVERGENT = -0.3;

function typicalRange(candles: Candle[]): number {
  const ranges = candles.map((c) => c.high - c.low).sort((a, b) => a - b);
  return ranges[Math.floor(ranges.length / 2)];
}

function findPivots(candles: Candle[], k: number): { highs: Pivot[]; lows: Pivot[] } {
  const highs: Pivot[] = [];
  const lows: Pivot[] = [];
  for (let i = k; i < candles.length - k; i++) {
    let isHigh = true;
    let isLow = true;
    for (let j = i - k; j <= i + k; j++) {
      if (j === i) continue;
      const { high, low } = candles[j];
      if (high > candles[i].high || (high === candles[i].high && j < i)) isHigh = false;
      if (low < candles[i].low || (low === candles[i].low && j < i)) isLow = false;
    }
    if (isHigh) highs.push({ i, price: candles[i].high });
    if (isLow) lows.push({ i, price: candles[i].low });
  }
  return { highs, lows };
}

function fitLine(points: Pivot[]): Line {
  const n = points.length;
  const meanX = points.reduce((s, p) => s + p.i, 0) / n;
  const meanY = points.reduce((s, p) => s + p.price, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.i - meanX) * (p.price - meanY);
    den += (p.i - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  const maxResidual = Math.max(...points.map((p) => Math.abs(p.price - (slope * p.i + intercept))));
  return { slope, intercept, maxResidual };
}

function horizontal(
  candles: Candle[],
  fromBar: number,
  toBar: number,
  price: number,
  label: string,
  color: string,
): Overlay {
  return {
    kind: "trendline",
    from: { time: candles[fromBar].time, value: price },
    to: { time: candles[toBar].time, value: price },
    color,
    style: "dashed",
    width: 1,
    label,
  };
}

function detectDoubleExtremes(candles: Candle[], pivots: Pivot[], atr: number, top: boolean): Detection[] {
  const out: Detection[] = [];
  for (let a = 0; a < pivots.length - 1 && out.length < 2; a++) {
    const p1 = pivots[a];
    const p2 = pivots[a + 1];
    if (p2.i - p1.i < 4) continue;
    const between = candles.slice(p1.i + 1, p2.i);
    if (between.length === 0) continue;
    const extreme = top
      ? Math.min(...between.map((c) => c.low))
      : Math.max(...between.map((c) => c.high));
    const depth = top ? Math.min(p1.price, p2.price) - extreme : extreme - Math.max(p1.price, p2.price);
    if (depth < 1.5 * atr) continue;
    const diff = Math.abs(p1.price - p2.price);
    if (diff > 0.75 * atr || diff > 0.5 * depth) continue;
    const after = candles.slice(p2.i + 1);
    const invalidated = top
      ? after.some((c) => c.high > Math.max(p1.price, p2.price) + 0.5 * atr)
      : after.some((c) => c.low < Math.min(p1.price, p2.price) - 0.5 * atr);
    if (invalidated) continue;
    const id = top ? "doble-techo" : "doble-suelo";
    const endBar = Math.min(p2.i + (p2.i - p1.i), candles.length - 1);
    const level = (p1.price + p2.price) / 2;
    out.push({
      id: `${id}-${out.length}`,
      patternId: id,
      from: candles[p1.i].time,
      to: candles[endBar].time,
      overlays: [
        horizontal(candles, p1.i, endBar, level, top ? "Resistencia" : "Soporte", COLORS.sr),
        horizontal(candles, p1.i, endBar, extreme, "Línea de cuello", COLORS.neutral),
        {
          kind: "marker",
          time: candles[p1.i].time,
          position: top ? "aboveBar" : "belowBar",
          shape: top ? "arrowDown" : "arrowUp",
          text: top ? "Techo 1" : "Suelo 1",
        },
        {
          kind: "marker",
          time: candles[p2.i].time,
          position: top ? "aboveBar" : "belowBar",
          shape: top ? "arrowDown" : "arrowUp",
          text: top ? "Techo 2" : "Suelo 2",
        },
      ],
    });
  }
  return out;
}

function detectHeadShoulders(candles: Candle[], pivots: Pivot[], atr: number, inverted: boolean): Detection[] {
  const out: Detection[] = [];
  for (let a = 0; a < pivots.length - 2 && out.length < 1; a++) {
    const [s1, head, s2] = [pivots[a], pivots[a + 1], pivots[a + 2]];
    const higher = (x: Pivot, y: Pivot) => (inverted ? x.price < y.price - atr : x.price > y.price + atr);
    if (!higher(head, s1) || !higher(head, s2)) continue;
    if (Math.abs(s1.price - s2.price) > 2 * atr) continue;
    const neck = (bars: Candle[]) =>
      inverted ? Math.max(...bars.map((c) => c.high)) : Math.min(...bars.map((c) => c.low));
    const left = candles.slice(s1.i + 1, head.i);
    const right = candles.slice(head.i + 1, s2.i);
    if (left.length === 0 || right.length === 0) continue;
    const after = candles.slice(s2.i + 1);
    const invalidated = inverted
      ? after.some((c) => c.low < head.price - 0.5 * atr)
      : after.some((c) => c.high > head.price + 0.5 * atr);
    if (invalidated) continue;
    const id = inverted ? "hch-invertido" : "hch";
    const endBar = Math.min(s2.i + Math.round((s2.i - s1.i) / 2), candles.length - 1);
    const neckline: Overlay = {
      kind: "trendline",
      from: { time: candles[s1.i].time, value: neck(left) },
      to: { time: candles[endBar].time, value: neck(right) },
      color: COLORS.neutral,
      style: "dashed",
      width: 1,
      label: "Línea de cuello",
    };
    const mark = (p: Pivot, text: string): Overlay => ({
      kind: "marker",
      time: candles[p.i].time,
      position: inverted ? "belowBar" : "aboveBar",
      shape: inverted ? "arrowUp" : "arrowDown",
      text,
    });
    out.push({
      id,
      patternId: id,
      from: candles[s1.i].time,
      to: candles[endBar].time,
      overlays: [neckline, mark(s1, "Hombro"), mark(head, "Cabeza"), mark(s2, "Hombro")],
    });
  }
  return out;
}

function detectStructure(
  candles: Candle[],
  highs: Pivot[],
  lows: Pivot[],
  atr: number,
  range: number,
): Detection | null {
  if (highs.length < 2 || lows.length < 2 || range === 0) return null;
  const upper = fitLine(highs);
  const lower = fitLine(lows);
  if (upper.maxResidual > 1.5 * atr || lower.maxResidual > 1.5 * atr) return null;

  const first = Math.min(highs[0].i, lows[0].i);
  const last = Math.max(highs[highs.length - 1].i, lows[lows.length - 1].i);
  const span = last - first;
  if (span < Math.max(6, candles.length * 0.4)) return null;

  const u = (upper.slope * span) / range;
  const l = (lower.slope * span) / range;
  const convergence = ((upper.slope - lower.slope) * span) / range;
  const parallel = Math.abs(u - l) < 0.3;

  let patternId: string | null = null;
  if (Math.abs(u) < FLAT && Math.abs(l) < FLAT) patternId = "canal-lateral";
  else if (u > FLAT && l > FLAT) {
    patternId = convergence < CONVERGENT ? "cuna-ascendente" : parallel ? "canal-alcista" : null;
  } else if (u < -FLAT && l < -FLAT) {
    patternId = convergence < CONVERGENT ? "cuna-descendente" : parallel ? "canal-bajista" : null;
  } else if (Math.abs(u) < FLAT && l > FLAT) patternId = "triangulo-ascendente";
  else if (u < -FLAT && Math.abs(l) < FLAT) patternId = "triangulo-descendente";
  else if (u < -FLAT && l > FLAT) patternId = "triangulo-simetrico";
  if (patternId === null) return null;

  const lineAt = (line: Line, i: number) => line.slope * i + line.intercept;
  return {
    id: patternId,
    patternId,
    from: candles[first].time,
    to: candles[last].time,
    overlays: [
      {
        kind: "trendline",
        from: { time: candles[first].time, value: lineAt(upper, first) },
        to: { time: candles[last].time, value: lineAt(upper, last) },
        label: "Resistencia",
      },
      {
        kind: "trendline",
        from: { time: candles[first].time, value: lineAt(lower, first) },
        to: { time: candles[last].time, value: lineAt(lower, last) },
        label: "Soporte",
      },
    ],
  };
}

function detectSupportResistance(
  candles: Candle[],
  highs: Pivot[],
  lows: Pivot[],
  atr: number,
): Detection | null {
  const cluster = (pivots: Pivot[]): Pivot[] | null => {
    let best: Pivot[] | null = null;
    for (const anchor of pivots) {
      const near = pivots.filter((p) => Math.abs(p.price - anchor.price) <= atr * 0.8);
      if (near.length >= 3 && (best === null || near.length > best.length)) best = near;
    }
    return best;
  };
  const resistance = cluster(highs);
  const support = cluster(lows);
  if (resistance === null && support === null) return null;

  const overlays: Overlay[] = [];
  const level = (pivots: Pivot[], label: string) => {
    const price = pivots.reduce((s, p) => s + p.price, 0) / pivots.length;
    overlays.push(horizontal(candles, pivots[0].i, candles.length - 1, price, label, COLORS.sr));
  };
  if (resistance !== null) level(resistance, "Resistencia");
  if (support !== null) level(support, "Soporte");

  const used = [...(resistance ?? []), ...(support ?? [])];
  const first = Math.min(...used.map((p) => p.i));
  return {
    id: "soporte-resistencia",
    patternId: "soporte-resistencia",
    from: candles[first].time,
    to: candles[candles.length - 1].time,
    overlays,
  };
}

function referenceLevel(patternId: string, c: Candle): { price: number; label: string } | null {
  switch (patternId) {
    case "martillo":
    case "envolvente-alcista":
      return { price: c.low, label: "Soporte" };
    case "estrella-fugaz":
    case "envolvente-bajista":
      return { price: c.high, label: "Resistencia" };
    default:
      return null;
  }
}

function detectCandleSignals(candles: Candle[], atr: number): Detection[] {
  const found = new Map<string, { i: number; overlay: Overlay }[]>();
  const push = (patternId: string, overlay: Overlay, i: number) => {
    const list = found.get(patternId) ?? [];
    list.push({ i, overlay });
    found.set(patternId, list);
  };
  const trendBefore = (i: number): "up" | "down" | "flat" => {
    const start = Math.max(0, i - 5);
    if (i - start < 2) return "flat";
    const delta = candles[i - 1].close - candles[start].close;
    if (delta > 0.8 * atr) return "up";
    if (delta < -0.8 * atr) return "down";
    return "flat";
  };

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const range = c.high - c.low;
    if (range < 0.7 * atr) continue;
    const body = Math.abs(c.close - c.open);
    const upperWick = c.high - Math.max(c.open, c.close);
    const lowerWick = Math.min(c.open, c.close) - c.low;
    const trend = trendBefore(i);
    const marker = (
      patternId: string,
      position: "aboveBar" | "belowBar",
      shape: "arrowUp" | "arrowDown" | "circle",
      text: string,
    ) => push(patternId, { kind: "marker", time: c.time, position, shape, text }, i);

    if (body <= 0.08 * range) {
      marker("doji", "aboveBar", "circle", "Doji");
      continue;
    }
    if (trend === "down" && lowerWick >= 2 * body && upperWick <= Math.max(0.6 * body, 0.15 * range)) {
      marker("martillo", "belowBar", "arrowUp", "Martillo");
    }
    if (trend === "up" && upperWick >= 2 * body && lowerWick <= Math.max(0.6 * body, 0.15 * range)) {
      marker("estrella-fugaz", "aboveBar", "arrowDown", "Estrella fugaz");
    }
    const prev = candles[i - 1];
    const prevBody = Math.abs(prev.close - prev.open);
    if (prevBody > 0 && body >= prevBody * 1.05) {
      const bullish = c.close > c.open && prev.close < prev.open;
      const bearish = c.close < c.open && prev.close > prev.open;
      if (bullish && trend === "down" && c.open <= prev.close && c.close >= prev.open) {
        marker("envolvente-alcista", "belowBar", "arrowUp", "Envolvente");
      }
      if (bearish && trend === "up" && c.open >= prev.close && c.close <= prev.open) {
        marker("envolvente-bajista", "aboveBar", "arrowDown", "Envolvente");
      }
    }
  }

  return [...found.entries()].map(([patternId, list]) => {
    const recent = list.slice(-3);
    const last = recent[recent.length - 1];
    const overlays = recent.map((r) => r.overlay);
    const level = referenceLevel(patternId, candles[last.i]);
    if (level !== null) {
      overlays.push(
        horizontal(candles, last.i, candles.length - 1, level.price, level.label, COLORS.sr),
      );
    }
    return {
      id: patternId,
      patternId,
      from: candles[recent[0].i].time,
      to: candles[last.i].time,
      overlays,
    };
  });
}

interface SegmentFit {
  slope: number;
  intercept: number;
  sse: number;
  meanAbs: number;
}

function fitCloses(candles: Candle[], a: number, b: number): SegmentFit {
  const n = b - a + 1;
  let meanX = 0;
  let meanY = 0;
  for (let i = a; i <= b; i++) {
    meanX += i;
    meanY += candles[i].close;
  }
  meanX /= n;
  meanY /= n;
  let num = 0;
  let den = 0;
  for (let i = a; i <= b; i++) {
    num += (i - meanX) * (candles[i].close - meanY);
    den += (i - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  let sse = 0;
  let sumAbs = 0;
  for (let i = a; i <= b; i++) {
    const r = candles[i].close - (slope * i + intercept);
    sse += r ** 2;
    sumAbs += Math.abs(r);
  }
  return { slope, intercept, sse, meanAbs: sumAbs / n };
}

function detectAcceleration(candles: Candle[], atr: number): Detection | null {
  const n = candles.length;
  if (n < 20) return null;
  let best: { k: number; f1: SegmentFit; f2: SegmentFit } | null = null;
  let bestErr = Infinity;
  const lo = Math.max(8, Math.floor(n * 0.3));
  const hi = Math.min(n - 9, Math.ceil(n * 0.7));
  for (let k = lo; k <= hi; k++) {
    const f1 = fitCloses(candles, 0, k);
    const f2 = fitCloses(candles, k, n - 1);
    const err = f1.sse + f2.sse;
    if (err < bestErr) {
      bestErr = err;
      best = { k, f1, f2 };
    }
  }
  if (best === null) return null;
  const { k, f1, f2 } = best;
  if (f1.slope * f2.slope <= 0) return null;
  if (Math.abs(f1.slope) * k < 2.5 * atr) return null;
  if (f1.meanAbs > 1.2 * atr || f2.meanAbs > 1.2 * atr) return null;
  const ratio = f2.slope / f1.slope;
  const label = ratio >= 1.8 ? "Aceleración" : ratio <= 0.55 ? "Desaceleración" : null;
  if (label === null) return null;

  const up = f2.slope > 0;
  const warning = label === "Desaceleración";
  const lineAt = (f: SegmentFit, i: number) => f.slope * i + f.intercept;
  return {
    id: "aceleracion",
    patternId: "aceleracion",
    from: candles[0].time,
    to: candles[n - 1].time,
    overlays: [
      {
        kind: "trendline",
        from: { time: candles[0].time, value: lineAt(f1, 0) },
        to: { time: candles[k].time, value: lineAt(f1, k) },
        color: COLORS.neutral,
        width: 1,
        label: "Tendencia inicial",
      },
      {
        kind: "trendline",
        from: { time: candles[k].time, value: lineAt(f2, k) },
        to: { time: candles[n - 1].time, value: lineAt(f2, n - 1) },
        label,
      },
      {
        kind: "marker",
        time: candles[k].time,
        position: up === warning ? "aboveBar" : "belowBar",
        shape: up === warning ? "arrowDown" : "arrowUp",
        text: label,
      },
    ],
  };
}

function detectMaCross(candles: Candle[]): Detection | null {
  if (candles.length < 35) return null;
  const fast = sma(candles, 10);
  const slow = sma(candles, 30);
  const offset = candles.length - slow.length;
  const crosses: Overlay[] = [];
  for (let j = 1; j < slow.length; j++) {
    const prevDiff = fast[fast.length - slow.length + j - 1].value - slow[j - 1].value;
    const diff = fast[fast.length - slow.length + j].value - slow[j].value;
    if (prevDiff <= 0 && diff > 0) {
      crosses.push({
        kind: "marker",
        time: candles[offset + j].time,
        position: "belowBar",
        shape: "arrowUp",
        text: "Cruce dorado",
      });
    } else if (prevDiff >= 0 && diff < 0) {
      crosses.push({
        kind: "marker",
        time: candles[offset + j].time,
        position: "aboveBar",
        shape: "arrowDown",
        text: "Cruce de la muerte",
      });
    }
  }
  if (crosses.length === 0) return null;
  return {
    id: "medias-moviles",
    patternId: "medias-moviles",
    from: crosses[0].kind === "marker" ? crosses[0].time : candles[0].time,
    to: candles[candles.length - 1].time,
    overlays: [
      { kind: "ma", period: 10, color: COLORS.maFast, label: "SMA 10" },
      { kind: "ma", period: 30, color: COLORS.maSlow, label: "SMA 30" },
      ...crosses.slice(-3),
    ],
  };
}

export function detectPatterns(candles: Candle[]): Detection[] {
  if (candles.length < 10) return [];
  const atr = typicalRange(candles);
  if (atr === 0) return [];
  const k = Math.max(2, Math.floor(candles.length / 40));
  const { highs, lows } = findPivots(candles, k);
  const range = Math.max(...candles.map((c) => c.high)) - Math.min(...candles.map((c) => c.low));

  const out: Detection[] = [];
  out.push(...detectDoubleExtremes(candles, highs, atr, true));
  out.push(...detectDoubleExtremes(candles, lows, atr, false));
  out.push(...detectHeadShoulders(candles, highs, atr, false));
  out.push(...detectHeadShoulders(candles, lows, atr, true));
  const structure = detectStructure(candles, highs, lows, atr, range);
  if (structure !== null) out.push(structure);
  else {
    const sr = detectSupportResistance(candles, highs, lows, atr);
    if (sr !== null) out.push(sr);
  }
  const acceleration = detectAcceleration(candles, atr);
  if (acceleration !== null) out.push(acceleration);
  out.push(...detectCandleSignals(candles, atr));
  const cross = detectMaCross(candles);
  if (cross !== null) out.push(cross);
  return out;
}
