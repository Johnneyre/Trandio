<script lang="ts">
  import type { Pattern } from '$lib/types';
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

<nav class="flex flex-col gap-2" aria-label="Patrones disponibles">
  {#if patterns.length === 0}
    <p class="p-4 text-center text-base text-muted">No hay patrones para este filtro.</p>
  {:else}
    {#each patterns as pattern (pattern.id)}
      <PatternCard {pattern} selected={pattern.id === selectedId} {onselect} />
    {/each}
  {/if}
</nav>
