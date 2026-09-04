<script lang="ts">
  import PatternDetail from "$lib/components/PatternDetail.svelte";
  import PatternList from "$lib/components/PatternList.svelte";
  import Playground from "$lib/components/Playground.svelte";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import TrendFilter from "$lib/components/TrendFilter.svelte";
  import { PATTERNS } from "$lib/data/patterns";
  import type { Trend } from "$lib/types";

  let view = $state<"patrones" | "playground">("patrones");
  let selectedTrend = $state<Trend | null>(null);
  let search = $state("");
  let selectedId = $state<string>(PATTERNS[0].id);
  let detailEl = $state<HTMLElement>();

  function handleSelect(id: string) {
    selectedId = id;
    if (!window.matchMedia("(min-width: 64rem)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      detailEl?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const filtered = $derived(
    PATTERNS.filter(
      (p) =>
        (selectedTrend === null || p.trends.includes(selectedTrend as Trend)) &&
        (search.trim() === "" || normalize(p.name).includes(normalize(search))),
    ),
  );

  const selected = $derived(filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null);

  const counts = {
    alcista: PATTERNS.filter((p) => p.trends.includes("alcista")).length,
    bajista: PATTERNS.filter((p) => p.trends.includes("bajista")).length,
    rango: PATTERNS.filter((p) => p.trends.includes("rango")).length,
  };

  const SITE_URL = "https://trandio.app/";
  const patternsJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${SITE_URL}#patrones`,
    name: "Patrones chartistas",
    inLanguage: "es",
    hasDefinedTerm: PATTERNS.map((p) => ({
      "@type": "DefinedTerm",
      name: p.name,
      description: p.description,
      inDefinedTermSet: `${SITE_URL}#patrones`,
    })),
  }).replaceAll("<", "\\u003c");
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${patternsJsonLd}</script>`}
</svelte:head>

<div class="mx-auto flex min-h-dvh max-w-[1560px] flex-col gap-6 px-6 py-6 lg:px-10">
  <header class="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
    <div>
      <h1 class="text-2xl font-semibold tracking-[-0.01em]">Trandio</h1>
      <p class="mt-1 text-[15px] text-ink-3">Patrones chartistas por tipo de tendencia</p>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      {#if view === "patrones"}
        <div class="max-lg:order-last max-lg:w-full">
          <TrendFilter value={selectedTrend} {counts} onchange={(t) => (selectedTrend = t)} />
        </div>
      {/if}
      <div class="flex gap-0.5 rounded-lg border border-border p-0.5" role="group" aria-label="Vista">
        <button
          type="button"
          class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors {view ===
          'patrones'
            ? 'bg-active text-ink'
            : 'text-ink-3 hover:bg-fill'}"
          aria-pressed={view === "patrones"}
          onclick={() => (view = "patrones")}
        >
          Patrones
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors {view ===
          'playground'
            ? 'bg-active text-ink'
            : 'text-ink-3 hover:bg-fill'}"
          aria-pressed={view === "playground"}
          onclick={() => (view = "playground")}
        >
          Playground
        </button>
      </div>
      <ThemeToggle />
    </div>
  </header>

  {#if view === "patrones"}
    <main class="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside class="flex flex-col gap-3 max-lg:order-2 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-226px)]">
        <input
          type="search"
          placeholder="Buscar patrón…"
          aria-label="Buscar patrón"
          class="w-full shrink-0 rounded-lg bg-fill px-3.5 py-2.5 text-base text-ink placeholder:text-ink-3"
          bind:value={search}
        />
        <p class="px-3 text-[13px] text-ink-3" role="status" aria-atomic="true">
          {filtered.length}
          {filtered.length === 1 ? "patrón" : "patrones"}
        </p>
        <div class="lg:-m-1 lg:min-h-0 lg:overflow-y-auto lg:p-1">
          <PatternList
            patterns={filtered}
            selectedId={selected?.id ?? null}
            {search}
            onselect={handleSelect}
            onclearsearch={() => (search = "")}
          />
        </div>
      </aside>

      <section class="flex min-w-0 scroll-mt-4 flex-col gap-5 max-lg:order-1" bind:this={detailEl}>
        <PatternDetail pattern={selected} />
      </section>
    </main>
  {:else}
    <main>
      <Playground />
    </main>
  {/if}

  <footer class="mt-auto border-t border-border pt-5 text-right text-[13px] text-ink-3">
    <p>Built by Johnneyre</p>
  </footer>
</div>
