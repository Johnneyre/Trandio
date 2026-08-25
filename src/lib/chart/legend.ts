import type { Overlay } from "$lib/types";
import { COLORS } from "./theme";

export interface LegendItem {
  label: string;
  color: string;
}

const DEFAULT_COLOR: Record<Overlay["kind"], string> = {
  trendline: COLORS.trend,
  channel: COLORS.trend,
  pitchfork: COLORS.maSlow,
  ma: COLORS.maFast,
  hline: COLORS.neutral,
  marker: COLORS.maFast,
};

export function overlayLegend(overlays: Overlay[]): LegendItem[] {
  const seen = new Set<string>();
  return overlays
    .filter((ov): ov is Overlay & { label: string } => ov.kind !== "marker" && "label" in ov && !!ov.label)
    .map((ov) => ({ label: ov.label, color: ov.color ?? DEFAULT_COLOR[ov.kind] }))
    .filter((item) => {
      const key = `${item.label}|${item.color}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
