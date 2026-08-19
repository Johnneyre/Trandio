<script lang="ts">
  import type { Pattern } from '../types';

  let {
    pattern,
    selected,
    onselect,
  }: {
    pattern: Pattern;
    selected: boolean;
    onselect: (id: string) => void;
  } = $props();

  const TREND_LABEL = { alcista: 'Alcista', bajista: 'Bajista', rango: 'Rango' } as const;
  const SIGNAL_LABEL = {
    continuacion: 'Continuación',
    reversion: 'Reversión',
    indicador: 'Indicador',
    nivel: 'Nivel',
  } as const;
</script>

<button
  type="button"
  class="card"
  class:selected
  aria-pressed={selected}
  onclick={() => onselect(pattern.id)}
>
  <span class="name">{pattern.name}</span>
  <span class="badges">
    {#each pattern.trends as trend (trend)}
      <span class="badge {trend}">{TREND_LABEL[trend]}</span>
    {/each}
    <span class="badge signal">{SIGNAL_LABEL[pattern.signal]}</span>
  </span>
</button>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--panel);
    color: var(--text);
    text-align: left;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .card:hover {
    background: var(--hover);
  }
  .card.selected {
    border-color: var(--accent);
    background: rgba(41, 98, 255, 0.1);
  }
  .name {
    font-weight: 600;
    font-size: 0.9rem;
  }
  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    letter-spacing: 0.02em;
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
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
  }
</style>
