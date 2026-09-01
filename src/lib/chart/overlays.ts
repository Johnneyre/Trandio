import {
  LineSeries,
  LineStyle,
  createSeriesMarkers,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type LineWidth,
  type Time,
} from "lightweight-charts";
import type { LineStyleKind, MarkerShape, TimeValue } from "$lib/types";
import type {
  BarPoint,
  ChartSegment,
  ChartSpec,
  LineOpts,
  OverlayController,
  OverlayDefs,
  OverlayOptions,
} from "./types";
import { ema, sma } from "./indicators";
import { COLORS } from "./theme";

const STYLE_MAP: Record<LineStyleKind, LineStyle> = {
  solid: LineStyle.Solid,
  dashed: LineStyle.Dashed,
  dotted: LineStyle.Dotted,
};

const MARKER_COLOR: Record<MarkerShape, string> = {
  arrowUp: COLORS.up,
  arrowDown: COLORS.down,
  circle: COLORS.maFast,
  square: COLORS.trend,
};

function clipPolyline(points: BarPoint[], bar: number): BarPoint[] {
  if (points.length === 0 || points[points.length - 1].bar <= bar) return points;
  const out: BarPoint[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.bar <= bar) {
      out.push(p);
      continue;
    }
    const prev = points[i - 1];
    if (prev !== undefined && prev.bar < bar) {
      const t = (bar - prev.bar) / (p.bar - prev.bar);
      out.push({ bar, value: prev.value + (p.value - prev.value) * t });
    }
    break;
  }
  return out;
}

export function applyOverlays(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  spec: ChartSpec,
  opts: OverlayOptions = {},
): OverlayController {
  const defs: OverlayDefs = { lines: [], levels: [], markers: [] };
  const single = spec.segments.length === 1;

  for (const seg of spec.segments) {
    collectSegment(spec, seg, single, defs, opts);
  }
  defs.markers.sort((a, b) => a.bar - b.bar);

  const timeAt = (bar: number) => spec.candles[bar].time as Time;

  const lines = defs.lines.map((def) => ({
    def,
    series: chart.addSeries(LineSeries, {
      color: def.opts.color,
      lineWidth: (def.opts.width ?? 2) as LineWidth,
      lineStyle: STYLE_MAP[def.opts.style ?? "solid"],
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    }),
  }));
  const levels = defs.levels.map((def) => ({ def, handle: null as IPriceLine | null }));
  const markersApi = defs.markers.length > 0 ? createSeriesMarkers(series, []) : null;

  let revealed: number | null = null;

  return {
    reveal(bar) {
      if (bar === revealed) return;
      revealed = bar;

      for (const line of lines) {
        line.series.setData(
          clipPolyline(line.def.points, bar).map((p) => ({ time: timeAt(p.bar), value: p.value })),
        );
      }

      for (const level of levels) {
        const show = bar >= level.def.revealBar;
        if (show && level.handle === null) {
          level.handle = series.createPriceLine(level.def.options);
        } else if (!show && level.handle !== null) {
          series.removePriceLine(level.handle);
          level.handle = null;
        }
      }

      markersApi?.setMarkers(
        defs.markers.map((m) =>
          m.bar <= bar ? m.marker : { ...m.marker, color: "transparent", text: undefined },
        ),
      );
    },

    valueRange() {
      let min = Infinity;
      let max = -Infinity;
      for (const { points } of defs.lines) {
        for (const p of points) {
          if (p.value < min) min = p.value;
          if (p.value > max) max = p.value;
        }
      }
      return min <= max ? { min, max } : null;
    },

    dispose() {
      for (const line of lines) chart.removeSeries(line.series);
      for (const level of levels) if (level.handle !== null) series.removePriceLine(level.handle);
      markersApi?.detach();
    },
  };
}

function collectSegment(
  spec: ChartSpec,
  seg: ChartSegment,
  single: boolean,
  defs: OverlayDefs,
  opts: OverlayOptions,
): void {
  const { pattern, startBar, scale } = seg;
  const lastLocalBar = pattern.candles.length - 1;

  const localBarOf = (time: TimeValue) => pattern.candles.findIndex((c) => c.time === time);
  const pointAt = (localBar: number, value: number): BarPoint => ({
    bar: startBar + localBar,
    value: value * scale,
  });
  const mapPoint = (p: { time: TimeValue; value: number }): BarPoint => pointAt(localBarOf(p.time), p.value);
  const addLine = (points: BarPoint[], lineOpts: LineOpts) =>
    defs.lines.push({ points: points.toSorted((a, b) => a.bar - b.bar), opts: lineOpts });

  for (const ov of pattern.overlays) {
    switch (ov.kind) {
      case "trendline":
        addLine([mapPoint(ov.from), mapPoint(ov.to)], {
          color: ov.color ?? COLORS.trend,
          style: ov.style,
          width: ov.width,
        });
        break;

      case "channel": {
        const color = ov.color ?? COLORS.trend;
        addLine(ov.upper.map(mapPoint), { color });
        addLine(ov.lower.map(mapPoint), { color });
        break;
      }

      case "pitchfork": {
        const aBar = localBarOf(ov.a.time);
        const bBar = localBarOf(ov.b.time);
        const cBar = localBarOf(ov.c.time);
        const endBar = localBarOf(ov.extendToTime);
        const variant = ov.variant ?? "andrews";
        const anchorBar = variant === "schiff-mod" ? Math.round((aBar + bBar) / 2) : aBar;
        const anchorPrice = variant === "andrews" ? ov.a.value : (ov.a.value + ov.b.value) / 2;
        const midBar = (bBar + cBar) / 2;
        const midPrice = (ov.b.value + ov.c.value) / 2;
        const slope = (midPrice - anchorPrice) / (midBar - anchorBar);
        const color = ov.color ?? COLORS.maSlow;
        const tine = (fromBar: number, fromPrice: number, width: number) =>
          addLine([pointAt(fromBar, fromPrice), pointAt(endBar, fromPrice + slope * (endBar - fromBar))], {
            color,
            width,
          });
        tine(anchorBar, anchorPrice, 2);
        tine(bBar, ov.b.value, 1);
        tine(cBar, ov.c.value, 1);
        addLine([mapPoint(ov.a), mapPoint(ov.b)], { color: COLORS.neutral, style: "dashed", width: 1 });
        addLine([mapPoint(ov.b), mapPoint(ov.c)], { color: COLORS.neutral, style: "dashed", width: 1 });
        break;
      }

      case "ma": {
        const segmentCandles = spec.candles.slice(startBar, startBar + pattern.candles.length);
        const data = (ov.type === "ema" ? ema : sma)(segmentCandles, ov.period);
        addLine(
          data.map((p, i) => ({ bar: startBar + ov.period - 1 + i, value: p.value })),
          { color: ov.color ?? COLORS.maFast },
        );
        break;
      }

      case "hline": {
        const color = ov.color ?? COLORS.neutral;
        if (single) {
          defs.levels.push({
            revealBar: startBar + lastLocalBar,
            options: {
              price: ov.price * scale,
              color,
              lineWidth: 1,
              lineStyle: STYLE_MAP[ov.style ?? "dashed"],
              axisLabelVisible: true,
              title: opts.compactLabels ? "" : (ov.label ?? ""),
            },
          });
        } else {
          addLine([pointAt(0, ov.price), pointAt(lastLocalBar, ov.price)], {
            color,
            style: ov.style ?? "dashed",
            width: 1,
          });
        }
        break;
      }

      case "marker": {
        const bar = startBar + localBarOf(ov.time);
        defs.markers.push({
          bar,
          marker: {
            time: spec.candles[bar].time as Time,
            position: ov.position,
            shape: ov.shape,
            color: ov.color ?? MARKER_COLOR[ov.shape],
            text: ov.text,
            size: 2,
          },
        });
        break;
      }

      default: {
        const _exhaustive: never = ov;
        void _exhaustive;
      }
    }
  }
}
