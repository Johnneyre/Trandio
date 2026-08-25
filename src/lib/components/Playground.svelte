<script lang="ts">
  import { composeUpload } from "$lib/chart/compose";
  import { overlayLegend } from "$lib/chart/legend";
  import { parseCsv } from "$lib/data/csv";
  import { detectPatterns } from "$lib/data/detect";
  import { PATTERNS } from "$lib/data/patterns";
  import Badges from "./Badges.svelte";
  import Chart from "./Chart.svelte";

  let csvText = $state("");
  let visibleIds = $state<string[]>([]);
  let dragging = $state(false);
  let draft = $state("");
  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    void csvText;
    visibleIds = [];
  });

  const parsed = $derived(csvText.trim() === "" ? null : parseCsv(csvText));
  const draftParsed = $derived(draft.trim() === "" ? null : parseCsv(draft));
  const detections = $derived(parsed?.ok ? detectPatterns(parsed.candles) : []);
  const visible = $derived(detections.filter((d) => visibleIds.includes(d.id)));

  const spec = $derived.by(() => {
    if (parsed === null || !parsed.ok) return null;
    return composeUpload({
      candles: parsed.candles,
      overlays: [...parsed.maOverlays, ...visible.flatMap((d) => d.overlays)],
    });
  });

  const legend = $derived(
    parsed?.ok ? overlayLegend([...parsed.maOverlays, ...visible.flatMap((d) => d.overlays)]) : [],
  );

  const chartLabel = $derived.by(() => {
    const parts = ["Gráfico de velas de los datos cargados"];
    if (visible.length > 0) {
      parts.push(`con ${visible.length} ${visible.length === 1 ? "patrón detectado" : "patrones detectados"}`);
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
    const withTime = parsed.meta.intervalSec < 86400;
    return `${formatDate(d.from as number, withTime)} → ${formatDate(d.to as number, withTime)}`;
  }

  type Target = "csv" | "draft";

  async function loadFile(file: File | undefined, into: Target = "csv") {
    if (!file) return;
    const text = await file.text();
    if (into === "draft") draft = text;
    else csvText = text;
  }

  async function onfile(e: Event, into: Target) {
    const input = e.currentTarget as HTMLInputElement;
    await loadFile(input.files?.[0], into);
    input.value = "";
  }

  function openEditor() {
    draft = csvText;
    dialog?.showModal();
  }

  function applyDraft() {
    if (draftParsed?.ok !== true) return;
    csvText = draft;
    dialog?.close();
  }

  function onbackdrop(e: MouseEvent) {
    if (e.target === dialog) dialog?.close();
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

{#snippet uploadButton(extra = "", into: Target = "csv")}
  <label
    class="inline-flex w-fit cursor-pointer items-center rounded-md border border-border px-3 py-1.5 text-sm text-ink-2 transition-colors hover:bg-fill focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent {extra}"
  >
    Subir CSV
    <input type="file" accept=".csv,.txt" class="sr-only" onchange={(e) => onfile(e, into)} />
  </label>
{/snippet}

{#if spec === null}
  <section
    class="grid min-h-[clamp(480px,calc(100dvh-190px),900px)] place-items-center rounded-lg border px-6 py-10 transition-colors {dragging
      ? 'border-accent bg-chip-accent/40'
      : 'border-border'}"
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
        rows="9"
        placeholder="Pega aquí tus datos OHLC…&#10;&#10;Fecha,Apertura,Máximo,Mínimo,Cierre&#10;lun 24 Ago '26 14:15,&quot;1,16598&quot;,&quot;1,16630&quot;,…"
        aria-label="Datos CSV"
        class="w-full resize-none rounded-lg bg-fill px-3.5 py-3 font-mono text-[13px] leading-relaxed text-ink placeholder:text-ink-3"
        bind:value={csvText}
      ></textarea>

      <div class="flex flex-wrap items-center justify-between gap-3">
        {@render uploadButton()}
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
    <aside class="flex flex-col gap-4 max-lg:order-2 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-226px)]">
      <div class="flex shrink-0 flex-col gap-2 rounded-lg border border-border px-3.5 py-3">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-sm font-medium text-ink-2">Datos</h2>
          <div class="flex gap-0.5">
            <button
              type="button"
              class="cursor-pointer rounded-md px-2 py-1 text-[13px] text-ink-3 transition-colors hover:bg-fill hover:text-ink"
              onclick={openEditor}
            >
              Editar
            </button>
            <button
              type="button"
              class="cursor-pointer rounded-md px-2 py-1 text-[13px] text-ink-3 transition-colors hover:bg-chip-down hover:text-down"
              onclick={clearData}
            >
              Eliminar
            </button>
          </div>
        </div>
        <p class="text-[13px] leading-relaxed text-ink-3 tabular-nums" role="status" aria-atomic="true">
          <span class="font-medium text-ink">{parsed.meta.rows} velas</span>
          · intervalo {formatInterval(parsed.meta.intervalSec)}
          <br />
          {formatDate(parsed.meta.from, parsed.meta.intervalSec < 86400)} →
          {formatDate(parsed.meta.to, parsed.meta.intervalSec < 86400)}
          {#if parsed.meta.skipped > 0}
            <br />{parsed.meta.skipped} filas omitidas
          {/if}
        </p>
      </div>

      <section
        class="flex min-h-0 flex-col gap-1.5 lg:-m-1 lg:overflow-y-auto lg:p-1"
        aria-label="Patrones detectados"
      >
        <h2 class="px-1 text-sm font-medium text-ink-2">Patrones detectados</h2>
        {#if detections.length === 0}
          <p class="px-1 text-[13px] text-ink-3">
            Ningún patrón del diccionario aparece con claridad en estos datos.
          </p>
        {:else}
          <p class="px-1 text-[13px] text-ink-3">
            Selecciona un patrón para dibujarlo sobre el gráfico.
          </p>
          <ul class="mt-1 flex flex-col gap-1">
            {#each detections as d (d.id)}
              {@const pattern = patternOf(d.patternId)}
              {#if pattern}
                {@const active = visibleIds.includes(d.id)}
                <li>
                  <button
                    type="button"
                    class="flex w-full cursor-pointer flex-col gap-2 rounded-md border-l-2 px-3 py-2.5 text-left transition-colors {active
                      ? 'border-accent bg-active'
                      : 'border-transparent hover:bg-fill'}"
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
      <Chart {spec} label={chartLabel} class="h-[clamp(520px,calc(100dvh-230px),1000px)]" />
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

  <dialog
    bind:this={dialog}
    class="m-auto w-[min(720px,calc(100vw-2rem))] rounded-xl border border-border-strong bg-bg p-0 text-ink shadow-2xl backdrop:bg-black/60"
    aria-labelledby="edit-data-title"
    onclick={onbackdrop}
  >
    <form
      method="dialog"
      class="flex flex-col gap-4 p-6"
      onsubmit={(e) => {
        e.preventDefault();
        applyDraft();
      }}
    >
      <div class="flex flex-col gap-1">
        <h2 id="edit-data-title" class="text-lg font-semibold tracking-[-0.01em]">Reemplazar datos</h2>
        <p class="text-[14px] text-ink-3">
          Pega un CSV nuevo o sube un archivo. Al aplicar se sustituyen los datos actuales.
        </p>
      </div>

      <textarea
        rows="14"
        aria-label="Datos CSV"
        class="w-full resize-none rounded-lg bg-fill px-3.5 py-3 font-mono text-[13px] leading-relaxed text-ink placeholder:text-ink-3"
        placeholder="Fecha,Apertura,Máximo,Mínimo,Cierre&#10;…"
        bind:value={draft}
      ></textarea>

      {#if draftParsed !== null && !draftParsed.ok}
        <p class="rounded-md bg-chip-down px-3.5 py-2.5 text-[13px] text-down" role="alert">
          {draftParsed.error}
        </p>
      {:else if draftParsed?.ok}
        <p class="px-1 text-[13px] text-ink-3 tabular-nums" role="status">
          {draftParsed.meta.rows} velas · intervalo {formatInterval(draftParsed.meta.intervalSec)}
        </p>
      {/if}

      <div class="flex flex-wrap items-center justify-between gap-3">
        {@render uploadButton("", "draft")}
        <div class="flex gap-2">
          <button
            type="button"
            class="cursor-pointer rounded-md px-3 py-1.5 text-sm text-ink-2 transition-colors hover:bg-fill"
            onclick={() => dialog?.close()}
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="cursor-pointer rounded-md bg-ink px-3.5 py-1.5 text-sm font-medium text-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            disabled={draftParsed?.ok !== true}
          >
            Aplicar
          </button>
        </div>
      </div>
    </form>
  </dialog>
{/if}
