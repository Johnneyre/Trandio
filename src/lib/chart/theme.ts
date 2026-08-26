import {
  ColorType,
  CrosshairMode,
  LineStyle,
  type ChartOptions,
  type CandlestickSeriesPartialOptions,
  type DeepPartial,
} from "lightweight-charts";
import type { ThemeMode } from "$lib/theme.svelte";

export const COLORS = {
  up: "#26a69a",
  down: "#ef5350",
  neutral: "#9e9e9e",
  trend: "#2962ff",
  maFast: "#f7a600",
  maSlow: "#9575cd",
  sr: "#e3a008",
} as const;

const LAYOUT = {
  dark: {
    bg: "#0a0a0a",
    text: "rgba(255, 255, 255, 0.56)",
    border: "rgba(255, 255, 255, 0.12)",
    grid: "rgba(255, 255, 255, 0.06)",
    crosshair: "rgba(255, 255, 255, 0.36)",
    crosshairLabel: "#262626",
    candleUp: "#26a69a",
    candleDown: "#ef5350",
  },
  light: {
    bg: "#fbfbfa",
    text: "rgba(0, 0, 0, 0.56)",
    border: "rgba(0, 0, 0, 0.14)",
    grid: "rgba(0, 0, 0, 0.06)",
    crosshair: "rgba(0, 0, 0, 0.36)",
    crosshairLabel: "#404040",
    candleUp: "#7d9471",
    candleDown: "#b1766a",
  },
} as const;

export function candleColors(mode: ThemeMode): { up: string; down: string } {
  return { up: LAYOUT[mode].candleUp, down: LAYOUT[mode].candleDown };
}

export const baseChartOptions: DeepPartial<ChartOptions> = {
  layout: {
    fontSize: 13,
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif",
  },
  crosshair: { mode: CrosshairMode.Magnet },
  timeScale: { rightOffset: 3, fixLeftEdge: true },
  handleScroll: { mouseWheel: false, vertTouchDrag: false },
  handleScale: { mouseWheel: false, pinch: true },
};

export function themeChartOptions(mode: ThemeMode): DeepPartial<ChartOptions> {
  const t = LAYOUT[mode];
  return {
    layout: {
      background: { type: ColorType.Solid, color: t.bg },
      textColor: t.text,
    },
    grid: {
      vertLines: { color: t.grid, style: LineStyle.Dotted },
      horzLines: { color: t.grid, style: LineStyle.Dotted },
    },
    crosshair: {
      vertLine: { color: t.crosshair, style: LineStyle.Dashed, labelBackgroundColor: t.crosshairLabel },
      horzLine: { color: t.crosshair, style: LineStyle.Dashed, labelBackgroundColor: t.crosshairLabel },
    },
    rightPriceScale: { borderColor: t.border },
    timeScale: { borderColor: t.border },
  };
}

export const candleSeriesOptions: CandlestickSeriesPartialOptions = {
  borderVisible: false,
  priceLineVisible: false,
  lastValueVisible: false,
};
