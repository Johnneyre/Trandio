import {
  ColorType,
  CrosshairMode,
  LineStyle,
  type ChartOptions,
  type CandlestickSeriesPartialOptions,
  type DeepPartial,
} from 'lightweight-charts';

export const COLORS = {
  up: '#26a69a',
  down: '#ef5350',
  neutral: 'rgba(255, 255, 255, 0.5)',
  trend: '#2962ff',
  maFast: '#f7a600',
  maSlow: '#b39ddb',
  sr: '#ffca28',
  bg: '#0a0a0a',
  border: 'rgba(255, 255, 255, 0.12)',
  text: 'rgba(255, 255, 255, 0.56)',
} as const;

export const chartOptions: DeepPartial<ChartOptions> = {
  layout: {
    background: { type: ColorType.Solid, color: COLORS.bg },
    textColor: COLORS.text,
    fontSize: 13,
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif",
  },
  grid: {
    vertLines: { color: 'rgba(255, 255, 255, 0.06)', style: LineStyle.Dotted },
    horzLines: { color: 'rgba(255, 255, 255, 0.06)', style: LineStyle.Dotted },
  },
  crosshair: {
    mode: CrosshairMode.Magnet,
    vertLine: {
      color: 'rgba(255, 255, 255, 0.36)',
      style: LineStyle.Dashed,
      labelBackgroundColor: '#262626',
    },
    horzLine: {
      color: 'rgba(255, 255, 255, 0.36)',
      style: LineStyle.Dashed,
      labelBackgroundColor: '#262626',
    },
  },
  rightPriceScale: { borderColor: COLORS.border },
  timeScale: { borderColor: COLORS.border, rightOffset: 3, fixLeftEdge: true },
  handleScroll: { mouseWheel: false, vertTouchDrag: false },
  handleScale: { mouseWheel: false, pinch: true },
};

export const candleSeriesOptions: CandlestickSeriesPartialOptions = {
  upColor: COLORS.up,
  downColor: COLORS.down,
  borderVisible: false,
  wickUpColor: COLORS.up,
  wickDownColor: COLORS.down,
  priceLineVisible: false,
  lastValueVisible: false,
};
