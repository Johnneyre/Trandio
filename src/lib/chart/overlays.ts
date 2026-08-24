import {
  LineSeries,
  LineStyle,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type LineWidth,
  type SeriesMarker,
  type Time,
} from "lightweight-charts";
import type { LineStyleKind, MarkerShape, PricePoint } from "$lib/types";
import type { ChartSegment, ChartSpec, LineOpts, OverlayHandles, OverlayOptions } from "./types";
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

function addLine(chart: IChartApi, points: PricePoint[], opts: LineOpts, out: OverlayHandles): void {
  const series = chart.addSeries(LineSeries, {
    color: opts.color,
    lineWidth: (opts.width ?? 2) as LineWidth,
    lineStyle: STYLE_MAP[opts.style ?? "solid"],
    priceLineVisible: false,
    lastValueVisible: false,
    crosshairMarkerVisible: false,
  });
  series.setData(points.map((p) => ({ time: p.time as Time, value: p.value })));
  out.lines.push(series);
}

export function applyOverlays(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  spec: ChartSpec,
  opts: OverlayOptions = {},
): () => void {
  const markers: SeriesMarker<Time>[] = [];
  const out: OverlayHandles = { lines: [], priceLines: [] };
  const single = spec.segments.length === 1;

  for (const seg of spec.segments) {
    applySegment(chart, series, spec, seg, single, markers, out, opts);
  }

  const markersApi =
    markers.length > 0
      ? createSeriesMarkers(
          series,
          markers.toSorted((a, b) => ((a.time as string) < (b.time as string) ? -1 : 1)),
        )
      : null;

  return () => {
    for (const line of out.lines) chart.removeSeries(line);
    for (const pl of out.priceLines) series.removePriceLine(pl);
    markersApi?.detach();
  };
}

function applySegment(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  spec: ChartSpec,
  seg: ChartSegment,
  single: boolean,
  markers: SeriesMarker<Time>[],
  out: OverlayHandles,
  opts: OverlayOptions,
): void {
  const { pattern, startBar, scale } = seg;
  const lastLocalBar = pattern.candles.length - 1;

  const localBarOf = (time: string) => pattern.candles.findIndex((c) => c.time === time);
  const pointAt = (localBar: number, value: number): PricePoint => ({
    time: spec.candles[startBar + localBar].time,
    value: value * scale,
  });
  const mapPoint = (p: PricePoint): PricePoint => pointAt(localBarOf(p.time), p.value);

  for (const ov of pattern.overlays) {
    switch (ov.kind) {
      case "trendline":
        addLine(
          chart,
          [mapPoint(ov.from), mapPoint(ov.to)],
          { color: ov.color ?? COLORS.trend, style: ov.style, width: ov.width },
          out,
        );
        break;

      case "channel": {
        const color = ov.color ?? COLORS.trend;
        addLine(chart, ov.upper.map(mapPoint), { color }, out);
        addLine(chart, ov.lower.map(mapPoint), { color }, out);
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
          addLine(
            chart,
            [pointAt(fromBar, fromPrice), pointAt(endBar, fromPrice + slope * (endBar - fromBar))],
            { color, width },
            out,
          );
        tine(anchorBar, anchorPrice, 2);
        tine(bBar, ov.b.value, 1);
        tine(cBar, ov.c.value, 1);
        addLine(
          chart,
          [mapPoint(ov.a), mapPoint(ov.b)],
          { color: COLORS.neutral, style: "dashed", width: 1 },
          out,
        );
        addLine(
          chart,
          [mapPoint(ov.b), mapPoint(ov.c)],
          { color: COLORS.neutral, style: "dashed", width: 1 },
          out,
        );
        break;
      }

      case "ma": {
        const segmentCandles = spec.candles.slice(startBar, startBar + pattern.candles.length);
        const data = (ov.type === "ema" ? ema : sma)(segmentCandles, ov.period);
        addLine(chart, data, { color: ov.color ?? COLORS.maFast }, out);
        break;
      }

      case "hline": {
        const color = ov.color ?? COLORS.neutral;
        if (single) {
          out.priceLines.push(
            series.createPriceLine({
              price: ov.price * scale,
              color,
              lineWidth: 1,
              lineStyle: STYLE_MAP[ov.style ?? "dashed"],
              axisLabelVisible: true,
              title: opts.compactLabels ? "" : (ov.label ?? ""),
            }),
          );
        } else {
          addLine(
            chart,
            [pointAt(0, ov.price), pointAt(lastLocalBar, ov.price)],
            { color, style: ov.style ?? "dashed", width: 1 },
            out,
          );
        }
        break;
      }

      case "marker":
        markers.push({
          time: spec.candles[startBar + localBarOf(ov.time)].time as Time,
          position: ov.position,
          shape: ov.shape,
          color: ov.color ?? MARKER_COLOR[ov.shape],
          text: ov.text,
          size: 2,
        });
        break;

      default: {
        const _exhaustive: never = ov;
        void _exhaustive;
      }
    }
  }
}
