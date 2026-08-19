<script lang="ts">
  import { CandlestickSeries, createChart } from 'lightweight-charts';
  import { applyOverlays } from '../chart/overlays';
  import { candleSeriesOptions, chartOptions } from '../chart/theme';
  import type { Pattern } from '../types';

  let { pattern }: { pattern: Pattern } = $props();
  let container: HTMLDivElement;

  // Se recrea el chart completo al cambiar de patrón: es barato (~60 velas) y
  // evita gestionar la limpieza de series/markers/pricelines del patrón anterior.
  $effect(() => {
    const current = pattern;
    const chart = createChart(container, { ...chartOptions, autoSize: true });
    const series = chart.addSeries(CandlestickSeries, candleSeriesOptions);
    series.setData(current.candles.map((c) => ({ ...c, time: c.time })));
    applyOverlays(chart, series, current);
    chart.timeScale().fitContent();
    return () => chart.remove();
  });
</script>

<div class="chart" bind:this={container}></div>

<style>
  .chart {
    width: 100%;
    height: clamp(360px, 52vh, 560px);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }
</style>
