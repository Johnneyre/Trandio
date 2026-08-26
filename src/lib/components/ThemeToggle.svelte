<script lang="ts">
  import { theme, toggleTheme } from "$lib/theme.svelte";

  const label = $derived(theme.mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
</script>

<button
  type="button"
  class="group relative cursor-pointer rounded-lg border border-border p-2 text-ink-3 transition-colors hover:bg-fill hover:text-ink"
  aria-label={label}
  onclick={toggleTheme}
>
  <span
    class="pointer-events-none absolute top-full right-0 z-20 mt-2 rounded-md border border-border bg-bg px-2.5 py-1 text-[12px] whitespace-nowrap text-ink-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
    aria-hidden="true"
  >
    {label}
  </span>
  {#if theme.mode === "dark"}
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.25" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11L3.05 3.05"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  {:else}
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </svg>
  {/if}
</button>
