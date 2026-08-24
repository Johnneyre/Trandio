<script lang="ts">
  import type { Trend } from "$lib/types";

  let {
    value,
    counts,
    onchange,
  }: {
    value: Trend | null;
    counts: Record<Trend, number>;
    onchange: (t: Trend | null) => void;
  } = $props();

  const options: { value: Trend; label: string; shortLabel: string; dot: string }[] = [
    { value: "alcista", label: "Tendencia alcista", shortLabel: "Alcista", dot: "bg-up" },
    { value: "bajista", label: "Tendencia bajista", shortLabel: "Bajista", dot: "bg-down" },
    { value: "rango", label: "Rango", shortLabel: "Rango", dot: "bg-warn" },
  ];
</script>

<div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tendencia">
  {#each options as opt (opt.value)}
    <button
      type="button"
      class="inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[15px] transition-colors {value ===
      opt.value
        ? 'border-border-strong bg-active text-ink'
        : 'border-border text-ink-2 hover:bg-fill'}"
      aria-pressed={value === opt.value}
      onclick={() => onchange(value === opt.value ? null : opt.value)}
    >
      <span class="h-1.5 w-1.5 rounded-full {opt.dot}" aria-hidden="true"></span>
      <span class="max-sm:hidden">{opt.label}</span>
      <span class="sm:hidden">{opt.shortLabel}</span>
      <span class="text-sm text-ink-3 mt-1">{counts[opt.value]}</span>
    </button>
  {/each}
</div>
