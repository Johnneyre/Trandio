<script lang="ts">
  import {
    CandlestickSeries,
    LineStyle,
    createChart,
    type IChartApi,
    type ISeriesApi,
    type Time,
  } from "lightweight-charts";
  import { applyOverlays } from "$lib/chart/overlays";
  import { baseChartOptions, candleColors, candleSeriesOptions, themeChartOptions } from "$lib/chart/theme";
  import type { ChartSpec } from "$lib/chart/types";
  import { theme } from "$lib/theme.svelte";

  let {
    spec,
    label,
    class: className = "h-[clamp(440px,60vh,760px)]",
  }: { spec: ChartSpec; label: string; class?: string } = $props();
  let container: HTMLDivElement;

  let chart: IChartApi | undefined;
  let series: ISeriesApi<"Candlestick"> | undefined;
  let lastCandles: ChartSpec["candles"] | undefined;
  let fitPending = false;

  function pricePrecision(candles: ChartSpec["candles"]): number {
    let max = 2;
    for (const c of candles.slice(0, 40)) {
      const s = String(c.close);
      const i = s.indexOf(".");
      if (i !== -1) max = Math.max(max, Math.min(s.length - i - 1, 6));
    }
    return max;
  }

  $effect(() => {
    chart = createChart(container, { ...baseChartOptions, autoSize: true });
    series = chart.addSeries(CandlestickSeries, candleSeriesOptions);
    return () => {
      chart?.applyOptions({ autoSize: false });
      chart?.remove();
      chart = undefined;
      series = undefined;
    };
  });

  $effect(() => {
    const mode = theme.mode;
    chart?.applyOptions(themeChartOptions(mode));
    const cc = candleColors(mode);
    series?.applyOptions({
      upColor: cc.up,
      downColor: cc.down,
      wickUpColor: cc.up,
      wickDownColor: cc.down,
    });
  });

  $effect(() => {
    const current = spec;
    if (chart === undefined || series === undefined) return;

    const precision = pricePrecision(current.candles);

    series.applyOptions({
      priceFormat: { type: "price", precision, minMove: 10 ** -precision },
    });

    chart.applyOptions({
      timeScale: { timeVisible: typeof current.candles[0]?.time === "number", secondsVisible: false },
    });

    const sameData = lastCandles === current.candles;

    const savedRange = sameData && !fitPending ? chart.timeScale().getVisibleLogicalRange() : null;

    series.setData(current.candles.map((c) => ({ ...c, time: c.time as Time })));

    const lastCandle = current.candles[current.candles.length - 1];

    const cc = candleColors(theme.mode);
    const priceLine = series.createPriceLine({
      price: lastCandle.close,
      color: lastCandle.close >= lastCandle.open ? cc.up : cc.down,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "Precio",
    });

    const removeOverlays = applyOverlays(chart, series, current, {
      compactLabels: container.clientWidth < 480,
    });

    if (savedRange !== null) {
      chart.timeScale().setVisibleLogicalRange(savedRange);
    } else {
      chart.timeScale().fitContent();
      fitPending = true;
      requestAnimationFrame(() => (fitPending = false));
    }

    lastCandles = current.candles;

    return () => {
      try {
        removeOverlays();
        series?.removePriceLine(priceLine);
      } catch {}
    };
  });
</script>

<div class="w-full {className}" role="img" aria-label={label} bind:this={container}></div>
