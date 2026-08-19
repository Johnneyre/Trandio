<script lang="ts">
  import type { Pattern } from '../types';
  import PatternCard from './PatternCard.svelte';

  let {
    patterns,
    selectedId,
    onselect,
  }: {
    patterns: Pattern[];
    selectedId: string | null;
    onselect: (id: string) => void;
  } = $props();
</script>

<nav class="list" aria-label="Patrones disponibles">
  {#if patterns.length === 0}
    <p class="empty">No hay patrones para este filtro.</p>
  {:else}
    {#each patterns as pattern (pattern.id)}
      <PatternCard {pattern} selected={pattern.id === selectedId} {onselect} />
    {/each}
  {/if}
</nav>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .empty {
    color: var(--muted);
    font-size: 0.875rem;
    padding: 16px;
    text-align: center;
  }
</style>
