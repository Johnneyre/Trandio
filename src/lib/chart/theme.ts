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
  neutral: '#9aa0ab',
  trend: '#2962ff',
  maFast: '#f7a600',
  maSlow: '#b39ddb',
  sr: '#ffca28',
  bg: '#131722',
  border: '#2a2e39',
  text: '#d1d4dc',
} as const;

export const chartOptions: DeepPartial<ChartOptions> = {
  layout: {
    background: { type: ColorType.Solid, color: COLORS.bg },
    textColor: COLORS.text,
    fontSize: 15,
    fontFamily: "'Trebuchet MS', Roboto, -apple-system, sans-serif",
  },
  grid: {
    vertLines: { color: 'rgba(240, 243, 250, 0.06)', style: LineStyle.Dotted },
    horzLines: { color: 'rgba(240, 243, 250, 0.06)', style: LineStyle.Dotted },
  },
  crosshair: {
    mode: CrosshairMode.Magnet,
    vertLine: { color: '#758696', style: LineStyle.Dashed, labelBackgroundColor: '#2a2e39' },
    horzLine: { color: '#758696', style: LineStyle.Dashed, labelBackgroundColor: '#2a2e39' },
  },
  rightPriceScale: { borderColor: COLORS.border },
  timeScale: { borderColor: COLORS.border, rightOffset: 3 },
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
