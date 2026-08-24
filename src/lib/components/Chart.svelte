<script lang="ts">
  import {
    CandlestickSeries,
    LineStyle,
    createChart,
    type IChartApi,
    type ISeriesApi,
  } from "lightweight-charts";
  import { composePatterns } from "$lib/chart/compose";
  import { applyOverlays } from "$lib/chart/overlays";
  import { COLORS, candleSeriesOptions, chartOptions } from "$lib/chart/theme";
  import type { Pattern } from "$lib/types";

  let { patterns, label }: { patterns: Pattern[]; label?: string } = $props();
  let container: HTMLDivElement;

  const spec = $derived(composePatterns(patterns));
  const ariaLabel = $derived(label ?? `Gráfico de velas: ${patterns.map((p) => p.name).join(", ")}`);

  let chart: IChartApi | undefined;
  let series: ISeriesApi<"Candlestick"> | undefined;

  $effect(() => {
    chart = createChart(container, { ...chartOptions, autoSize: true });
    series = chart.addSeries(CandlestickSeries, candleSeriesOptions);
    return () => {
      chart?.applyOptions({ autoSize: false });
      chart?.remove();
      chart = undefined;
      series = undefined;
    };
  });

  $effect(() => {
    const current = spec;
    if (chart === undefined || series === undefined) return;
    series.setData(current.candles.map((c) => ({ ...c })));
    const lastCandle = current.candles[current.candles.length - 1];
    const priceLine = series.createPriceLine({
      price: lastCandle.close,
      color: lastCandle.close >= lastCandle.open ? COLORS.up : COLORS.down,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "Precio",
    });
    const removeOverlays = applyOverlays(chart, series, current, {
      compactLabels: container.clientWidth < 480,
    });
    chart.timeScale().fitContent();
    return () => {
      try {
        removeOverlays();
        series?.removePriceLine(priceLine);
      } catch {}
    };
  });
</script>

<div class="h-[clamp(440px,60vh,760px)] w-full" role="img" aria-label={ariaLabel} bind:this={container}></div>
