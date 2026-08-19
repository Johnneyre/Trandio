<script lang="ts">
  import { COLORS } from '../chart/theme';
  import type { Overlay, Pattern } from '../types';
  import Chart from './Chart.svelte';

  let { pattern }: { pattern: Pattern | null } = $props();

  const TREND_LABEL = { alcista: 'Alcista', bajista: 'Bajista', rango: 'Rango' } as const;
  const SIGNAL_LABEL = {
    continuacion: 'Continuación',
    reversion: 'Reversión',
    indicador: 'Indicador',
    nivel: 'Nivel',
  } as const;

  const DEFAULT_COLOR: Record<Overlay['kind'], string> = {
    trendline: COLORS.trend,
    channel: COLORS.trend,
    pitchfork: COLORS.maSlow,
    ma: COLORS.maFast,
    hline: COLORS.neutral,
    marker: COLORS.maFast,
  };

  const legend = $derived(
    (pattern?.overlays ?? [])
      .filter((ov): ov is Overlay & { label: string } => ov.kind !== 'marker' && 'label' in ov && !!ov.label)
      .map((ov) => ({ label: ov.label, color: ov.color ?? DEFAULT_COLOR[ov.kind] })),
  );
</script>

{#if pattern}
  <article class="detail">
    <header>
      <h2>{pattern.name}</h2>
      <div class="badges">
        {#each pattern.trends as trend (trend)}
          <span class="badge {trend}">{TREND_LABEL[trend]}</span>
        {/each}
        <span class="badge signal">{SIGNAL_LABEL[pattern.signal]}</span>
      </div>
    </header>
    <p class="description">{pattern.description}</p>
    {#key pattern.id}
      <Chart {pattern} />
    {/key}
    {#if legend.length > 0}
      <ul class="legend">
        {#each legend as item, i (i)}
          <li><span class="swatch" style:background={item.color}></span>{item.label}</li>
        {/each}
      </ul>
    {/if}
  </article>
{:else}
  <p class="empty">Selecciona un patrón para ver su gráfico.</p>
{/if}

<style>
  .detail {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  h2 {
    margin: 0;
    font-size: 1.3rem;
  }
  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .badge {
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
  }
  .badge.alcista {
    background: rgba(38, 166, 154, 0.15);
    color: var(--up);
  }
  .badge.bajista {
    background: rgba(239, 83, 80, 0.15);
    color: var(--down);
  }
  .badge.rango {
    background: rgba(120, 123, 134, 0.2);
    color: var(--muted);
  }
  .badge.signal {
    border: 1px solid var(--border);
    color: var(--muted);
  }
  .description {
    margin: 0;
    color: var(--muted);
    line-height: 1.55;
    max-width: 72ch;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .legend li {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--muted);
    font-size: 0.8rem;
  }
  .swatch {
    width: 18px;
    height: 3px;
    border-radius: 2px;
  }
  .empty {
    color: var(--muted);
    padding: 40px;
    text-align: center;
  }
</style>
