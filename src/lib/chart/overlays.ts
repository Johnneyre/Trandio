import {
  LineSeries,
  LineStyle,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type LineWidth,
  type SeriesMarker,
  type Time,
} from 'lightweight-charts';
import type { LineStyleKind, MarkerShape, Pattern, PricePoint } from '../types';
import { ema, sma } from './indicators';
import { COLORS } from './theme';

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

interface LineOpts {
  color: string;
  style?: LineStyleKind;
  width?: number;
}

function addLine(chart: IChartApi, points: PricePoint[], opts: LineOpts): void {
  const series = chart.addSeries(LineSeries, {
    color: opts.color,
    lineWidth: (opts.width ?? 2) as LineWidth,
    lineStyle: STYLE_MAP[opts.style ?? 'solid'],
    priceLineVisible: false,
    lastValueVisible: false,
    crosshairMarkerVisible: false,
  });
  series.setData(points.map((p) => ({ time: p.time as Time, value: p.value })));
}

/**
 * Dibuja los overlays de un patrón sobre el chart: líneas auxiliares como
 * LineSeries "silenciosas", niveles como pricelines y markers en un único
 * plugin (createSeriesMarkers pisa el estado anterior si se llama dos veces).
 */
export function applyOverlays(
  chart: IChartApi,
  series: ISeriesApi<'Candlestick'>,
  pattern: Pattern,
): void {
  const markers: SeriesMarker<Time>[] = [];
  const barOf = (time: string) => pattern.candles.findIndex((c) => c.time === time);
  const timeOf = (bar: number) => pattern.candles[bar].time;

  for (const ov of pattern.overlays) {
    switch (ov.kind) {
      case 'trendline':
        addLine(chart, [ov.from, ov.to], {
          color: ov.color ?? COLORS.trend,
          style: ov.style,
          width: ov.width,
        });
        break;

      case 'channel': {
        const color = ov.color ?? COLORS.trend;
        addLine(chart, ov.upper, { color });
        addLine(chart, ov.lower, { color });
        break;
      }

      case 'pitchfork': {
        // La pendiente se calcula en índice de barra (no en tiempo) y las tres
        // líneas (mediana por A, púas por B y C) comparten esa pendiente.
        const aBar = barOf(ov.a.time);
        const bBar = barOf(ov.b.time);
        const cBar = barOf(ov.c.time);
        const endBar = barOf(ov.extendToTime);
        const midBar = (bBar + cBar) / 2;
        const midPrice = (ov.b.value + ov.c.value) / 2;
        const slope = (midPrice - ov.a.value) / (midBar - aBar);
        const color = ov.color ?? COLORS.maSlow;
        const project = (fromBar: number, fromPrice: number): PricePoint => ({
          time: timeOf(endBar),
          value: fromPrice + slope * (endBar - fromBar),
        });
        addLine(chart, [ov.a, project(aBar, ov.a.value)], { color, width: 2 });
        addLine(chart, [ov.b, project(bBar, ov.b.value)], { color, width: 1 });
        addLine(chart, [ov.c, project(cBar, ov.c.value)], { color, width: 1 });
        break;
      }

      case 'ma': {
        const data = (ov.type === 'ema' ? ema : sma)(pattern.candles, ov.period);
        addLine(chart, data, { color: ov.color ?? COLORS.maFast });
        break;
      }

      case 'hline':
        series.createPriceLine({
          price: ov.price,
          color: ov.color ?? COLORS.neutral,
          lineWidth: 1,
          lineStyle: STYLE_MAP[ov.style ?? 'dashed'],
          axisLabelVisible: true,
          title: ov.label ?? '',
        });
        break;

      case 'marker':
        markers.push({
          time: ov.time as Time,
          position: ov.position,
          shape: ov.shape,
          color: ov.color ?? MARKER_COLOR[ov.shape],
          text: ov.text,
        });
        break;

      default: {
        const _exhaustive: never = ov;
        void _exhaustive;
      }
    }
  }

  if (markers.length > 0) {
    createSeriesMarkers(series, markers);
  }
}
