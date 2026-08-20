<script lang="ts">
  import { COLORS } from '$lib/chart/theme';
  import type { Direction, Overlay, Pattern } from '$lib/types';
  import Badges from './Badges.svelte';
  import Chart from './Chart.svelte';

  let { pattern }: { pattern: Pattern | null } = $props();

  let direction = $state<Direction>('alcista');

  $effect(() => {
    direction = pattern?.defaultDirection ?? 'alcista';
  });

  const chartPattern = $derived.by(() => {
    if (pattern === null) return null;
    const variant = pattern.variants?.[direction];
    return variant
      ? { ...pattern, candles: variant.candles, overlays: variant.overlays }
      : pattern;
  });

  const DEFAULT_COLOR: Record<Overlay['kind'], string> = {
    trendline: COLORS.trend,
    channel: COLORS.trend,
    pitchfork: COLORS.maSlow,
    ma: COLORS.maFast,
    hline: COLORS.neutral,
    marker: COLORS.maFast,
  };

  const legend = $derived(
    (chartPattern?.overlays ?? [])
      .filter(
        (ov): ov is Overlay & { label: string } =>
          ov.kind !== 'marker' && 'label' in ov && !!ov.label,
      )
      .map((ov) => ({ label: ov.label, color: ov.color ?? DEFAULT_COLOR[ov.kind] })),
  );
</script>

{#if pattern === null || chartPattern === null}
  <div
    class="grid h-[clamp(440px,60vh,760px)] place-items-center rounded-lg border border-border bg-panel"
  >
    <p class="text-lg text-muted">Selecciona un patrón para verlo en el gráfico.</p>
  </div>
{:else}
  <div class="relative">
    <Chart patterns={[chartPattern]} />
    {#if pattern.variants}
      <div
        class="absolute top-3 left-3 z-10 flex overflow-hidden rounded-lg border border-border bg-panel/90"
        role="group"
        aria-label="Dirección del ejemplo"
      >
        <button
          type="button"
          class="cursor-pointer px-3.5 py-2 text-sm font-semibold transition-colors {direction ===
          'alcista'
            ? 'bg-up/20 text-up'
            : 'text-muted hover:bg-hover'}"
          aria-pressed={direction === 'alcista'}
          onclick={() => (direction = 'alcista')}
        >
          Alcista
        </button>
        <button
          type="button"
          class="cursor-pointer px-3.5 py-2 text-sm font-semibold transition-colors {direction ===
          'bajista'
            ? 'bg-down/20 text-down'
            : 'text-muted hover:bg-hover'}"
          aria-pressed={direction === 'bajista'}
          onclick={() => (direction = 'bajista')}
        >
          Bajista
        </button>
      </div>
    {/if}
  </div>

  <article class="flex flex-col gap-3 rounded-lg border border-border bg-panel p-4">
    <header class="flex flex-wrap items-center gap-3">
      <h2 class="text-xl font-bold">{pattern.name}</h2>
      <Badges {pattern} />
    </header>
    <p class="max-w-[80ch] text-base leading-relaxed text-muted">{pattern.description}</p>
    {#if legend.length > 0}
      <ul class="flex flex-wrap gap-x-5 gap-y-2">
        {#each legend as item, i (i)}
          <li class="inline-flex items-center gap-2 text-sm text-muted">
            <span class="h-[3px] w-5 rounded-sm" style:background={item.color}></span>
            {item.label}
          </li>
        {/each}
      </ul>
    {/if}
  </article>
{/if}
