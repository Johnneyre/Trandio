<script lang="ts">
  import type { Trend } from '$lib/types';

  let {
    value,
    counts,
    onchange,
  }: {
    value: Trend | null;
    counts: Record<Trend, number>;
    onchange: (t: Trend | null) => void;
  } = $props();

  const options: { value: Trend; label: string; active: string }[] = [
    { value: 'alcista', label: 'Tendencia alcista', active: 'border-up bg-up/15' },
    { value: 'bajista', label: 'Tendencia bajista', active: 'border-down bg-down/15' },
    { value: 'rango', label: 'Rango', active: 'border-warn bg-warn/15' },
  ];
</script>

<div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tendencia">
  {#each options as opt (opt.value)}
    <button
      type="button"
      class="inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[0.95rem] transition-colors hover:bg-hover {value ===
      opt.value
        ? opt.active
        : 'border-border bg-panel'}"
      aria-pressed={value === opt.value}
      onclick={() => onchange(value === opt.value ? null : opt.value)}
    >
      {opt.label}
      <span class="rounded-full bg-hover px-2 py-0.5 text-sm text-muted">{counts[opt.value]}</span>
    </button>
  {/each}
</div>
