<script lang="ts">
  import type { Pattern } from "$lib/types";
  import Badges from "./Badges.svelte";

  let {
    pattern,
    selected,
    tabbable,
    onselect,
  }: {
    pattern: Pattern;
    selected: boolean;
    tabbable: boolean;
    onselect: (id: string) => void;
  } = $props();
</script>

<button
  type="button"
  tabindex={tabbable ? 0 : -1}
  class="flex w-full cursor-pointer flex-col gap-1.5 rounded-md px-3 py-2.5 text-left transition-colors {selected
    ? 'bg-active'
    : 'hover:bg-fill'}"
  aria-current={selected ? "true" : undefined}
  onclick={() => onselect(pattern.id)}
>
  <span class="text-[15px] font-medium text-ink">{pattern.name}</span>
  <Badges {pattern} />
</button>
