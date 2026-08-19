<script lang="ts">
  import PatternDetail from './lib/components/PatternDetail.svelte';
  import PatternList from './lib/components/PatternList.svelte';
  import TrendFilter from './lib/components/TrendFilter.svelte';
  import { PATTERNS } from './lib/data/patterns';
  import type { Trend } from './lib/types';

  let selectedTrend = $state<Trend | null>(null);
  let selectedId = $state<string>(PATTERNS[0].id);

  const filtered = $derived(
    selectedTrend === null
      ? PATTERNS
      : PATTERNS.filter((p) => p.trends.includes(selectedTrend as Trend)),
  );

  // Si el patrón seleccionado sale del filtro, cae al primero de la lista.
  const selected = $derived(filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null);

  const counts = {
    todos: PATTERNS.length,
    alcista: PATTERNS.filter((p) => p.trends.includes('alcista')).length,
    bajista: PATTERNS.filter((p) => p.trends.includes('bajista')).length,
    rango: PATTERNS.filter((p) => p.trends.includes('rango')).length,
  };

  function handleTrend(t: Trend | null) {
    selectedTrend = t;
  }

  function handleSelect(id: string) {
    selectedId = id;
  }
</script>

<div class="app">
  <header class="topbar">
    <div class="brand">
      <h1>Tratterns</h1>
      <p>Patrones chartistas por tipo de tendencia</p>
    </div>
    <TrendFilter value={selectedTrend} {counts} onchange={handleTrend} />
  </header>

  <main>
    <aside>
      <PatternList patterns={filtered} selectedId={selected?.id ?? null} onselect={handleSelect} />
    </aside>
    <section>
      <PatternDetail pattern={selected} />
    </section>
  </main>
</div>

<style>
  .app {
    max-width: 1280px;
    margin: 0 auto;
    padding: 20px 24px 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }
  .brand h1 {
    margin: 0;
    font-size: 1.4rem;
    letter-spacing: 0.02em;
  }
  .brand p {
    margin: 2px 0 0;
    color: var(--muted);
    font-size: 0.85rem;
  }
  main {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
    align-items: start;
  }
  aside {
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    padding-right: 4px;
  }
  @media (max-width: 900px) {
    main {
      grid-template-columns: 1fr;
    }
    aside {
      max-height: 320px;
    }
  }
</style>
