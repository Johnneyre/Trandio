<script lang="ts">
  import type { Pattern } from '$lib/types';
  import Badges from './Badges.svelte';

  let {
    pattern,
    selected,
    onselect,
  }: {
    pattern: Pattern;
    selected: boolean;
    onselect: (id: string) => void;
  } = $props();
</script>

<button
  type="button"
  class="flex w-full cursor-pointer flex-col gap-2 rounded-lg border p-3.5 text-left transition-colors {selected
    ? 'border-accent bg-accent/10'
    : 'border-border bg-panel hover:bg-hover'}"
  aria-pressed={selected}
  onclick={() => onselect(pattern.id)}
>
  <span class="text-base font-semibold">{pattern.name}</span>
  <Badges {pattern} />
</button>
