<script lang="ts">
  import { SIGNAL_LABEL, TREND_LABEL } from '$lib/labels';
  import type { Pattern } from '$lib/types';

  let { pattern }: { pattern: Pattern } = $props();

  const TREND_CLASS = {
    alcista: 'bg-chip-up text-up',
    bajista: 'bg-chip-down text-down',
    rango: 'bg-chip-warn text-warn',
  } as const;

  const SIGNAL_CLASS = {
    continuacion: 'bg-chip-accent text-accent-soft',
    reversion: 'bg-chip-ma-slow text-ma-slow',
    indicador: 'bg-chip-ma-fast text-ma-fast',
    nivel: 'bg-chip-warn text-warn',
  } as const;
</script>

<span class="flex flex-wrap gap-1.5">
  {#each pattern.trends as trend (trend)}
    <span class="rounded-full px-2.5 py-0.5 text-[13px] font-medium {TREND_CLASS[trend]}">
      {TREND_LABEL[trend]}
    </span>
  {/each}
  <span class="rounded-full px-2.5 py-0.5 text-[13px] font-medium {SIGNAL_CLASS[pattern.signal]}">
    {SIGNAL_LABEL[pattern.signal]}
  </span>
</span>
