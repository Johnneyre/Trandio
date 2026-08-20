<script lang="ts">
  import PatternDetail from '$lib/components/PatternDetail.svelte';
  import PatternList from '$lib/components/PatternList.svelte';
  import TrendFilter from '$lib/components/TrendFilter.svelte';
  import { PATTERNS } from '$lib/data/patterns';
  import type { Trend } from '$lib/types';

  let selectedTrend = $state<Trend | null>(null);
  let search = $state('');
  let selectedId = $state<string>(PATTERNS[0].id);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');

  const filtered = $derived(
    PATTERNS.filter(
      (p) =>
        (selectedTrend === null || p.trends.includes(selectedTrend as Trend)) &&
        (search.trim() === '' || normalize(p.name).includes(normalize(search))),
    ),
  );

  const selected = $derived(filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null);

  const counts = {
    alcista: PATTERNS.filter((p) => p.trends.includes('alcista')).length,
    bajista: PATTERNS.filter((p) => p.trends.includes('bajista')).length,
    rango: PATTERNS.filter((p) => p.trends.includes('rango')).length,
  };
</script>

<div class="mx-auto flex max-w-[1560px] flex-col gap-5 px-6 py-5">
  <header
    class="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4"
  >
    <div>
      <h1 class="text-2xl font-bold tracking-wide">Trendio</h1>
      <p class="mt-0.5 text-base text-muted">Patrones chartistas por tipo de tendencia</p>
    </div>
    <TrendFilter value={selectedTrend} {counts} onchange={(t) => (selectedTrend = t)} />
  </header>

  <main class="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
    <aside
      class="flex flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-40px)] lg:overflow-y-auto lg:pr-1"
    >
      <input
        type="search"
        placeholder="Buscar patrón…"
        aria-label="Buscar patrón"
        class="w-full rounded-lg border border-border bg-panel px-3.5 py-2.5 text-base placeholder:text-muted focus:border-accent focus:outline-none"
        bind:value={search}
      />
      <PatternList patterns={filtered} selectedId={selected?.id ?? null} onselect={(id) => (selectedId = id)} />
    </aside>

    <section class="flex min-w-0 flex-col gap-4">
      <PatternDetail pattern={selected} />
    </section>
  </main>
</div>
