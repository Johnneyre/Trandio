<script lang="ts">
  import { composePatterns } from "$lib/chart/compose";
  import { overlayLegend } from "$lib/chart/legend";
  import type { Direction, Pattern } from "$lib/types";
  import Badges from "./Badges.svelte";
  import Chart from "./Chart.svelte";

  let { pattern }: { pattern: Pattern | null } = $props();

  let direction = $state<Direction>("alcista");

  $effect(() => {
    direction = pattern?.defaultDirection ?? "alcista";
  });

  const chartPattern = $derived.by(() => {
    if (pattern === null) return null;
    const variant = pattern.variants?.[direction];
    return variant ? { ...pattern, candles: variant.candles, overlays: variant.overlays } : pattern;
  });

  const spec = $derived(chartPattern === null ? null : composePatterns([chartPattern]));

  const legend = $derived(overlayLegend(chartPattern?.overlays ?? []));

  const chartLabel = $derived.by(() => {
    if (pattern === null) return "";
    const parts = [`Gráfico de velas del patrón ${pattern.name}`];
    if (pattern.variants) parts.push(`variante ${direction}`);
    const overlayLabels = legend.map((item) => item.label);
    if (overlayLabels.length > 0) parts.push(`con ${overlayLabels.join(", ")}`);
    return parts.join(", ");
  });
</script>

{#if pattern === null || spec === null}
  <div
    class="grid h-[clamp(440px,60vh,760px)] place-items-center rounded-lg border border-border lg:h-auto lg:min-h-[320px] lg:flex-1"
  >
    <p class="text-base text-ink-3">Selecciona un patrón para verlo en el gráfico.</p>
  </div>
{:else}
  <div class="relative lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
    <Chart
      {spec}
      label={chartLabel}
      animate
      class="h-[clamp(440px,60vh,760px)] lg:h-auto lg:min-h-[320px] lg:flex-1"
    />
    {#if pattern.variants}
      <div
        class="absolute top-3 left-3 z-10 flex gap-0.5 rounded-lg border border-border bg-bg/90 p-0.5"
        role="group"
        aria-label="Dirección del ejemplo"
      >
        <button
          type="button"
          class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors max-lg:min-h-11 max-lg:py-2 {direction ===
          'alcista'
            ? 'bg-chip-up text-up'
            : 'text-ink-3 hover:bg-fill'}"
          aria-pressed={direction === "alcista"}
          onclick={() => (direction = "alcista")}
        >
          Alcista
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors max-lg:min-h-11 max-lg:py-2 {direction ===
          'bajista'
            ? 'bg-chip-down text-down'
            : 'text-ink-3 hover:bg-fill'}"
          aria-pressed={direction === "bajista"}
          onclick={() => (direction = "bajista")}
        >
          Bajista
        </button>
      </div>
    {/if}
  </div>

  <article class="flex flex-col gap-3">
    <header class="flex flex-wrap items-center gap-3">
      <h2 class="text-xl font-semibold tracking-[-0.01em]">{pattern.name}</h2>
      <Badges {pattern} />
    </header>
    <p class="max-w-[68ch] text-base leading-relaxed text-ink-2">{pattern.description}</p>
    {#if legend.length > 0}
      <ul class="flex flex-wrap gap-x-5 gap-y-2">
        {#each legend as item, i (i)}
          <li class="inline-flex items-center gap-2 text-sm text-ink-3">
            <span class="h-[3px] w-5 rounded-sm" style:background={item.color}></span>
            {item.label}
          </li>
        {/each}
      </ul>
    {/if}
  </article>
{/if}
