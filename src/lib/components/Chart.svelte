<script lang="ts">
  import {
    CandlestickSeries,
    LineStyle,
    createChart,
    type IChartApi,
    type IPriceLine,
    type ISeriesApi,
    type Time,
  } from "lightweight-charts";
  import { applyOverlays } from "$lib/chart/overlays";
  import { playReveal, prefersReducedMotion } from "$lib/chart/reveal";
  import { baseChartOptions, candleColors, candleSeriesOptions, themeChartOptions } from "$lib/chart/theme";
  import type { ChartSpec } from "$lib/chart/types";
  import { theme } from "$lib/theme.svelte";

  let {
    spec,
    label,
    animate = false,
    class: className = "h-[clamp(440px,60vh,760px)]",
  }: { spec: ChartSpec; label: string; animate?: boolean; class?: string } = $props();
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

    const data = current.candles.map((c) => ({ ...c, time: c.time as Time }));
    const animating = animate && !sameData && data.length > 1 && !prefersReducedMotion();
    const shown = animating ? 1 : data.length;

    series.setData(data.slice(0, shown));

    const candleSeries = series;
    const lastCandle = data[data.length - 1];
    const cc = candleColors(theme.mode);
    let priceLine: IPriceLine | undefined;
    const showPriceLine = () => {
      priceLine = candleSeries.createPriceLine({
        price: lastCandle.close,
        color: lastCandle.close >= lastCandle.open ? cc.up : cc.down,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: "Precio",
      });
    };
    if (!animating) showPriceLine();

    const overlays = applyOverlays(chart, series, current, {
      compactLabels: container.clientWidth < 480,
    });
    overlays.reveal(animating ? 0 : Infinity);

    if (savedRange !== null) {
      chart.timeScale().setVisibleLogicalRange(savedRange);
    } else {
      if (animating) {
        const rightOffset = chart.timeScale().options().rightOffset;
        chart.timeScale().setVisibleLogicalRange({ from: 0, to: data.length - 1 + rightOffset });
      } else {
        chart.timeScale().fitContent();
      }
      fitPending = true;
      requestAnimationFrame(() => (fitPending = false));
    }

    lastCandles = current.candles;

    const cancelReveal = animating
      ? playReveal({ series, data, overlays, onComplete: showPriceLine })
      : undefined;

    return () => {
      try {
        cancelReveal?.();
        overlays.dispose();
        if (priceLine !== undefined) candleSeries.removePriceLine(priceLine);
      } catch {}
    };
  });
</script>

<div class="w-full {className}" role="img" aria-label={label} bind:this={container}></div>
