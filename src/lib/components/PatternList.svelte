<script lang="ts">
  import type { Pattern } from "$lib/types";
  import PatternCard from "./PatternCard.svelte";

  let {
    patterns,
    selectedId,
    search,
    onselect,
    onclearsearch,
  }: {
    patterns: Pattern[];
    selectedId: string | null;
    search: string;
    onselect: (id: string) => void;
    onclearsearch: () => void;
  } = $props();

  function onkeydown(e: KeyboardEvent) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const buttons = Array.from(
      (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>("button"),
    );
    if (buttons.length === 0) return;
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let next: number;
    if (e.key === "Home" || current === -1) next = 0;
    else if (e.key === "End") next = buttons.length - 1;
    else if (e.key === "ArrowDown") next = Math.min(current + 1, buttons.length - 1);
    else next = Math.max(current - 1, 0);
    e.preventDefault();
    buttons[next]?.focus();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<nav class="flex flex-col gap-0.5" aria-label="Patrones disponibles" {onkeydown}>
  {#if patterns.length === 0}
    <div class="flex flex-col items-start gap-3 px-3 py-4">
      <p class="text-base text-ink-3">
        {#if search.trim() !== ""}
          Sin resultados para «{search.trim()}».
        {:else}
          No hay patrones para este filtro.
        {/if}
      </p>
      {#if search.trim() !== ""}
        <button
          type="button"
          class="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm text-ink-2 transition-colors hover:bg-fill"
          onclick={onclearsearch}
        >
          Limpiar búsqueda
        </button>
      {/if}
    </div>
  {:else}
    {#each patterns as pattern (pattern.id)}
      <PatternCard
        {pattern}
        selected={pattern.id === selectedId}
        tabbable={pattern.id === selectedId || selectedId === null}
        {onselect}
      />
    {/each}
  {/if}
</nav>
