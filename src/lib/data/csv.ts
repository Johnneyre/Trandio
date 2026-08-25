import type { Candle, CsvResult, Overlay } from "$lib/types";

const MONTHS: Record<string, number> = {
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  sep: 8,
  set: 8,
  oct: 9,
  nov: 10,
  dic: 11,
  jan: 0,
  apr: 3,
  aug: 7,
  dec: 11,
};

const ES_DATE =
  /^(?:[a-záéíóúñü]{2,5}\.?\s+)?(\d{1,2})\s+([a-záéíóúñü]{3,4})\.?\s+'?(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?$/i;
const ISO_DATE = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?/;
const NUMERIC_DATE = /^(\d{1,2})[./](\d{1,2})[./](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?$/;

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function splitLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

function parseNumber(raw: string): number | null {
  const s = raw.replace(/["\s]/g, "");
  if (s === "") return null;
  let t = s;
  const hasComma = t.includes(",");
  const hasDot = t.includes(".");
  if (hasComma && hasDot) t = t.replaceAll(".", "").replace(",", ".");
  else if (hasComma) t = t.replace(",", ".");
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function toTimestamp(
  y: number,
  mo: number,
  d: number,
  h: string | undefined,
  mi: string | undefined,
): number {
  const year = y < 100 ? 2000 + y : y;
  return Date.UTC(year, mo, d, Number(h ?? 0), Number(mi ?? 0)) / 1000;
}

function parseDate(raw: string): number | null {
  const s = raw.replaceAll('"', "").trim();
  let m = ISO_DATE.exec(s);
  if (m) return toTimestamp(Number(m[1]), Number(m[2]) - 1, Number(m[3]), m[4], m[5]);
  m = ES_DATE.exec(s);
  if (m) {
    const month = MONTHS[normalize(m[2])];
    if (month === undefined) return null;
    return toTimestamp(Number(m[3]), month, Number(m[1]), m[4], m[5]);
  }
  m = NUMERIC_DATE.exec(s);
  if (m) return toTimestamp(Number(m[3]), Number(m[2]) - 1, Number(m[1]), m[4], m[5]);
  return null;
}

function headerRole(header: string): string | null {
  const n = normalize(header);
  if (/(fecha|date|tiempo|time)/.test(n)) return "date";
  if (/(apertura|open)/.test(n)) return "open";
  if (/(maximo|max|high|alto)/.test(n)) return "high";
  if (/(minimo|min|low|bajo)/.test(n)) return "low";
  if (/(cierre|close|ultimo|last)/.test(n)) return "close";
  return null;
}

function indicatorOverlay(header: string): Overlay | null {
  const m = /^(ema|sma)\s*(\d+)/i.exec(header.trim());
  if (m === null) return null;
  return {
    kind: "ma",
    period: Number(m[2]),
    type: m[1].toLowerCase() as "ema" | "sma",
    label: header.trim(),
  };
}

function detectInterval(candles: Candle[]): number {
  const deltas = candles
    .slice(1)
    .map((c, i) => (c.time as number) - (candles[i].time as number))
    .sort((a, b) => a - b);
  return deltas[Math.floor(deltas.length / 2)];
}

export function parseCsv(text: string): CsvResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== "");
  if (lines.length < 3) {
    return { ok: false, error: "Se necesitan una cabecera y al menos 2 filas de datos." };
  }

  const headers = splitLine(lines[0]);
  const columns = new Map<string, number>();
  const maOverlays: Overlay[] = [];
  headers.forEach((h, i) => {
    const role = headerRole(h);
    if (role !== null && !columns.has(role)) columns.set(role, i);
    if (indicatorOverlay(h) !== null) columns.set(`indicator-${i}`, i);
  });

  const required = ["date", "open", "high", "low", "close"];
  const missing = required.filter((r) => !columns.has(r));
  if (missing.length > 0) {
    return {
      ok: false,
      error: `No se reconocieron las columnas: ${missing.join(", ")}. Se espera una cabecera como "Fecha,Apertura,Máximo,Mínimo,Cierre".`,
    };
  }

  const candles: Candle[] = [];
  let skipped = 0;
  for (const line of lines.slice(1)) {
    const fields = splitLine(line);
    const time = parseDate(fields[columns.get("date")!] ?? "");
    const open = parseNumber(fields[columns.get("open")!] ?? "");
    const high = parseNumber(fields[columns.get("high")!] ?? "");
    const low = parseNumber(fields[columns.get("low")!] ?? "");
    const close = parseNumber(fields[columns.get("close")!] ?? "");
    if (time === null || open === null || high === null || low === null || close === null) {
      skipped++;
      continue;
    }
    candles.push({ time, open, high, low, close });
  }

  if (candles.length < 2) {
    return { ok: false, error: "No se pudieron leer suficientes filas válidas (mínimo 2)." };
  }

  candles.sort((a, b) => (a.time as number) - (b.time as number));
  const unique = candles.filter((c, i) => i === 0 || c.time !== candles[i - 1].time);

  for (const header of headers) {
    const overlay = indicatorOverlay(header);
    if (overlay !== null && overlay.kind === "ma" && overlay.period < unique.length) {
      maOverlays.push(overlay);
    }
  }

  return {
    ok: true,
    candles: unique,
    maOverlays,
    meta: {
      rows: unique.length,
      skipped,
      intervalSec: detectInterval(unique),
      from: unique[0].time as number,
      to: unique[unique.length - 1].time as number,
    },
  };
}
