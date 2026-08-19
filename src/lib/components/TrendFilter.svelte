<script lang="ts">
  import type { Trend } from '../types';

  let {
    value,
    counts,
    onchange,
  }: {
    value: Trend | null;
    counts: Record<'todos' | Trend, number>;
    onchange: (t: Trend | null) => void;
  } = $props();

  const options: { value: Trend | null; label: string; key: 'todos' | Trend }[] = [
    { value: null, label: 'Todos', key: 'todos' },
    { value: 'alcista', label: 'Tendencia alcista', key: 'alcista' },
    { value: 'bajista', label: 'Tendencia bajista', key: 'bajista' },
    { value: 'rango', label: 'Rango', key: 'rango' },
  ];
</script>

<div class="filter" role="group" aria-label="Filtrar por tendencia">
  {#each options as opt (opt.key)}
    <button
      type="button"
      class="option"
      class:active={value === opt.value}
      class:alcista={opt.key === 'alcista'}
      class:bajista={opt.key === 'bajista'}
      class:rango={opt.key === 'rango'}
      aria-pressed={value === opt.value}
      onclick={() => onchange(opt.value)}
    >
      {opt.label}
      <span class="count">{counts[opt.key]}</span>
    </button>
  {/each}
</div>

<style>
  .filter {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .option {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--panel);
    color: var(--text);
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .option:hover {
    background: var(--hover);
  }
  .option.active {
    border-color: var(--accent);
    background: rgba(41, 98, 255, 0.12);
  }
  .option.active.alcista {
    border-color: var(--up);
    background: rgba(38, 166, 154, 0.12);
  }
  .option.active.bajista {
    border-color: var(--down);
    background: rgba(239, 83, 80, 0.12);
  }
  .option.active.rango {
    border-color: var(--muted);
    background: rgba(120, 123, 134, 0.15);
  }
  .count {
    padding: 1px 8px;
    border-radius: 999px;
    background: var(--hover);
    color: var(--muted);
    font-size: 0.75rem;
  }
</style>
