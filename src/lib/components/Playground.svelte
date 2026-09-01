<script lang="ts">
  import { untrack } from "svelte";
  import { composeUpload } from "$lib/chart/compose";
  import { overlayLegend } from "$lib/chart/legend";
  import { parseCsv } from "$lib/data/csv";
  import { detectPatterns } from "$lib/data/detect";
  import { PATTERNS } from "$lib/data/patterns";
  import { TIMEFRAMES_SEC, resampleCandles } from "$lib/data/resample";
  import Badges from "./Badges.svelte";
  import Chart from "./Chart.svelte";

  let csvText = $state("");
  let visibleIds = $state<string[]>([]);
  let dragging = $state(false);
  let timeframeSec = $state<number | null>(null);

  function clearVisible() {
    if (visibleIds.length > 0) visibleIds = [];
  }

  $effect(() => {
    void csvText;
    untrack(clearVisible);
    timeframeSec = null;
  });

  $effect(() => {
    void timeframeSec;
    untrack(clearVisible);
  });

  const parsed = $derived(csvText.trim() === "" ? null : parseCsv(csvText));

  const tf = $derived(timeframeSec ?? (parsed?.ok ? parsed.meta.intervalSec : 0));

  const timeframes = $derived.by(() => {
    if (parsed?.ok !== true) return [];
    const base = parsed.meta.intervalSec;
    const span = parsed.meta.to - parsed.meta.from;
    return [base, ...TIMEFRAMES_SEC.filter((s) => s > base && s % base === 0 && span / s >= 8)];
  });

  const candles = $derived.by(() => {
    if (parsed?.ok !== true) return null;
    return tf === parsed.meta.intervalSec ? parsed.candles : resampleCandles(parsed.candles, tf);
  });

  const activeMaOverlays = $derived(
    parsed?.ok === true && candles !== null
      ? parsed.maOverlays.filter((o) => o.kind !== "ma" || o.period < candles.length)
      : [],
  );

  const animateUpload = $derived(timeframeSec === null);

  const detections = $derived(candles === null ? [] : detectPatterns(candles));
  const visible = $derived(detections.filter((d) => visibleIds.includes(d.id)));

  const spec = $derived.by(() => {
    if (candles === null) return null;
    return composeUpload({
      candles,
      overlays: [...activeMaOverlays, ...visible.flatMap((d) => d.overlays)],
    });
  });

  const legend = $derived(
    candles === null ? [] : overlayLegend([...activeMaOverlays, ...visible.flatMap((d) => d.overlays)]),
  );

  const chartLabel = $derived.by(() => {
    const parts = ["Gráfico de velas de los datos cargados"];
    if (visible.length > 0) {
      parts.push(
        `con ${visible.length} ${visible.length === 1 ? "patrón detectado" : "patrones detectados"}`,
      );
    }
    return parts.join(", ");
  });

  function patternOf(patternId: string) {
    return PATTERNS.find((p) => p.id === patternId);
  }

  function toggle(id: string) {
    visibleIds = visibleIds.includes(id) ? visibleIds.filter((v) => v !== id) : [...visibleIds, id];
  }

  function formatInterval(sec: number): string {
    if (sec < 3600) return `${Math.round(sec / 60)}m`;
    if (sec < 86400) return `${Math.round(sec / 3600)}h`;
    return `${Math.round(sec / 86400)}d`;
  }

  function formatDate(sec: number, withTime: boolean): string {
    return new Date(sec * 1000).toLocaleString("es", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : { year: "2-digit" }),
    });
  }

  function detectionRange(d: (typeof detections)[number]): string {
    if (parsed === null || !parsed.ok) return "";
    const withTime = tf < 86400;
    return `${formatDate(d.from as number, withTime)} → ${formatDate(d.to as number, withTime)}`;
  }

  async function loadFile(file: File | undefined) {
    if (!file) return;
    csvText = await file.text();
  }

  async function onfile(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    await loadFile(input.files?.[0]);
    input.value = "";
  }

  function clearData() {
    csvText = "";
  }

  function ondragover(e: DragEvent) {
    if (!e.dataTransfer?.types.includes("Files")) return;
    e.preventDefault();
    dragging = true;
  }

  async function ondrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    await loadFile(e.dataTransfer?.files[0]);
  }
</script>

{#if spec === null}
  <section
    class="grid min-h-[clamp(480px,calc(100dvh-190px),900px)] place-items-center rounded-lg border px-6 py-10 transition-colors {dragging
      ? 'border-accent bg-chip-accent/40'
      : 'border-transparent'}"
    aria-label="Cargar datos"
    {ondragover}
    ondragleave={() => (dragging = false)}
    {ondrop}
  >
    <div class="flex w-full max-w-[640px] flex-col gap-5">
      <div class="flex flex-col gap-1.5 text-center">
        <h2 class="text-lg font-semibold tracking-[-0.01em] text-ink">Carga tus datos OHLC</h2>
        <p class="mx-auto max-w-[48ch] text-[15px] text-ink-3">
          Pega o sube un CSV con columnas de fecha, apertura, máximo, mínimo y cierre para construir el
          gráfico y detectar patrones chartistas en tus datos.
        </p>
      </div>

      <textarea
        rows="10"
        placeholder="Pega aquí tus datos OHLC…&#10;&#10;Fecha,Apertura,Máximo,Mínimo,Cierre&#10;lun 24 Ago '26 14:15,&quot;1,16598&quot;,&quot;1,16630&quot;,…"
        aria-label="Datos CSV"
        class="w-full resize-none rounded-lg bg-fill px-3.5 py-3 font-mono text-[13px] leading-relaxed text-ink placeholder:text-ink-3"
        bind:value={csvText}
      ></textarea>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <label
          class="inline-flex w-fit cursor-pointer items-center rounded-md bg-ink px-3.5 py-1.5 text-sm font-medium text-bg transition-opacity hover:opacity-85 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent"
        >
          Subir CSV
          <input type="file" accept=".csv,.txt" class="sr-only" onchange={onfile} />
        </label>
        <p class="text-[13px] text-ink-3">o arrastra un archivo .csv sobre este cuadro</p>
      </div>

      {#if parsed !== null && !parsed.ok}
        <p class="rounded-md bg-chip-down px-3.5 py-2.5 text-[13px] text-down" role="alert">
          {parsed.error}
        </p>
      {/if}
    </div>
  </section>
{:else if parsed?.ok}
  <div class="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
    <aside class="flex min-h-0 flex-col max-lg:order-2 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-226px)]">
      <div class="flex shrink-0 items-center justify-between gap-2">
        <h2 class="text-lg font-semibold tracking-[-0.01em] text-ink">Patrones detectados</h2>
        <div class="flex items-center gap-0.5">
          <button
            type="button"
            class="cursor-pointer rounded-md p-1.5 text-ink-3 transition-colors hover:bg-chip-down hover:text-down"
            aria-label="Eliminar datos"
            onclick={clearData}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <dl
        class="mt-4 shrink-0 divide-y divide-border border-y border-border"
        role="status"
        aria-atomic="true"
      >
        <div class="grid grid-cols-2 gap-x-4 py-3">
          <div>
            <dt class="text-[13px] text-ink-3">Ventana analizada</dt>
            <dd class="mt-1 text-[15px] text-ink tabular-nums">{spec.candles.length} velas</dd>
          </div>
          <div>
            <dt class="text-[13px] text-ink-3">Intervalo</dt>
            <dd class="mt-1 text-[15px] text-ink tabular-nums">{formatInterval(tf)}</dd>
          </div>
        </div>
        <div class="py-3">
          <dt class="text-[13px] text-ink-3">Rango temporal</dt>
          <dd class="mt-1 text-[15px] text-ink tabular-nums">
            {formatDate(parsed.meta.from, tf < 86400)} → {formatDate(parsed.meta.to, tf < 86400)}
          </dd>
          {#if parsed.meta.skipped > 0}
            <dd class="mt-1 text-[12px] text-ink-3">{parsed.meta.skipped} filas omitidas</dd>
          {/if}
        </div>
      </dl>

      <section
        class="mt-4 flex min-h-0 flex-col gap-1.5 pt-3 lg:-mr-1 lg:-mb-1 lg:-ml-4 lg:overflow-y-auto lg:pr-1 lg:pb-1 lg:pl-4"
        aria-label="Lista de patrones detectados"
      >
        {#if detections.length === 0}
          <p class="text-[13px] text-ink-3">
            Ningún patrón del diccionario aparece con claridad en estos datos.
          </p>
        {:else}
          <p class="text-[14px] text-ink">Selecciona un patrón para dibujarlo sobre el gráfico.</p>
          <ul class="mt-1 flex flex-col gap-1">
            {#each detections as d (d.id)}
              {@const pattern = patternOf(d.patternId)}
              {#if pattern}
                {@const active = visibleIds.includes(d.id)}
                <li>
                  <button
                    type="button"
                    class="relative -ml-3 flex w-[calc(100%+0.75rem)] cursor-pointer flex-col gap-2 rounded-md px-3 py-2.5 text-left transition-colors {active
                      ? 'bg-active before:absolute before:top-1/2 before:left-0 before:h-3/5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-up'
                      : 'hover:bg-fill'}"
                    aria-pressed={active}
                    onclick={() => toggle(d.id)}
                  >
                    <span class="flex flex-col gap-0.5">
                      <span class="text-[15px] leading-snug font-medium text-ink">{pattern.name}</span>
                      <span class="text-[12px] text-ink-3 tabular-nums">{detectionRange(d)}</span>
                    </span>
                    <Badges {pattern} />
                  </button>
                </li>
              {/if}
            {/each}
          </ul>
        {/if}
      </section>
    </aside>

    <section class="flex min-w-0 flex-col gap-4 max-lg:order-1">
      <div class="relative">
        <Chart
          {spec}
          label={chartLabel}
          animate={animateUpload}
          class="h-[clamp(520px,calc(100dvh-230px),1000px)]"
        />
        {#if timeframes.length > 1}
          <select
            class="absolute top-3 right-20 z-10 cursor-pointer rounded-md border border-border bg-bg/90 px-2 py-1 text-[13px] text-ink-2 backdrop-blur transition-colors hover:bg-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Temporalidad de las velas"
            value={tf}
            onchange={(e) => (timeframeSec = Number(e.currentTarget.value))}
          >
            {#each timeframes as s (s)}
              <option class="bg-bg text-ink" value={s}>{formatInterval(s)}</option>
            {/each}
          </select>
        {/if}
      </div>
      {#if legend.length > 0}
        <ul class="flex flex-wrap gap-x-5 gap-y-2">
          {#each legend as item, i (i)}
            <li class="inline-flex items-center gap-2 text-sm text-ink-3">
              <span class="h-[3px] w-5 rounded-sm" style:background={item.color}></span>
              {item.label}
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>
{/if}
