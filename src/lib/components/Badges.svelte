<script lang="ts">
  import type { Pattern } from '$lib/types';

  let { pattern }: { pattern: Pattern } = $props();

  const TREND_LABEL = { alcista: 'Alcista', bajista: 'Bajista', rango: 'Rango' } as const;
  const SIGNAL_LABEL = {
    continuacion: 'Continuación',
    reversion: 'Reversión',
    indicador: 'Indicador',
    nivel: 'Nivel',
  } as const;

  const TREND_CLASS = {
    alcista: 'bg-up/15 text-up',
    bajista: 'bg-down/15 text-down',
    rango: 'bg-warn/15 text-warn',
  } as const;

  const SIGNAL_CLASS = {
    continuacion: 'bg-accent/20 text-[#8ab4ff]',
    reversion: 'bg-ma-slow/20 text-ma-slow',
    indicador: 'bg-ma-fast/15 text-ma-fast',
    nivel: 'bg-warn/15 text-warn',
  } as const;
</script>

<span class="flex flex-wrap gap-1.5">
  {#each pattern.trends as trend (trend)}
    <span class="rounded px-2 py-0.5 text-sm font-medium {TREND_CLASS[trend]}">
      {TREND_LABEL[trend]}
    </span>
  {/each}
  <span class="rounded px-2 py-0.5 text-sm font-medium {SIGNAL_CLASS[pattern.signal]}">
    {SIGNAL_LABEL[pattern.signal]}
  </span>
</span>
