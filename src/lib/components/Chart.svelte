<script lang="ts">
  import { CandlestickSeries, LineStyle, createChart } from 'lightweight-charts';
  import { composePatterns } from '$lib/chart/compose';
  import { applyOverlays } from '$lib/chart/overlays';
  import { COLORS, candleSeriesOptions, chartOptions } from '$lib/chart/theme';
  import type { Pattern } from '$lib/types';

  let { patterns }: { patterns: Pattern[] } = $props();
  let container: HTMLDivElement;

  const spec = $derived(composePatterns(patterns));

  $effect(() => {
    const current = spec;
    const chart = createChart(container, { ...chartOptions, autoSize: true });
    const series = chart.addSeries(CandlestickSeries, candleSeriesOptions);
    series.setData(current.candles.map((c) => ({ ...c })));
    const lastCandle = current.candles[current.candles.length - 1];
    series.createPriceLine({
      price: lastCandle.close,
      color: lastCandle.close >= lastCandle.open ? COLORS.up : COLORS.down,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: 'Precio',
    });
    applyOverlays(chart, series, current);
    chart.timeScale().fitContent();
    return () => chart.remove();
  });
</script>

<div
  class="h-[clamp(440px,60vh,760px)] w-full overflow-hidden rounded-lg border border-border"
  bind:this={container}
></div>
