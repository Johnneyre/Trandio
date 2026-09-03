<div align="center">
  <img src="public/favicon.svg" alt="Logo de Trandio" width="56" height="54">
  <h1>Trandio</h1>
  <p><strong>Diccionario interactivo de patrones chartistas con gráficos de velas, y un playground para detectarlos en tus propios datos.</strong></p>
  <p>
    <a href="https://trandio.app/"><img src="https://img.shields.io/badge/demo-trandio.app-863bff" alt="Demo"></a>
    <img src="https://img.shields.io/badge/Svelte-5-ff3e00?logo=svelte&logoColor=white" alt="Svelte 5">
    <img src="https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" alt="Vite">
    <a href="LICENSE"><img src="https://img.shields.io/badge/licencia-MIT-blue" alt="Licencia MIT"></a>
  </p>
</div>

Trandio reúne 24 patrones de análisis técnico (reversión, continuación, velas simples, canales, indicadores y niveles) y los dibuja sobre velas generadas a medida, con las líneas que definen cada figura y el marcador de compra/venta en la vela de disparo. Además, permite cargar un CSV con velas OHLC reales y superponer los patrones que detecta.

## Características

- **24 patrones** explicados y dibujados: hombro-cabeza-hombro (y su versión invertida), doble techo/suelo, cuñas, triángulos, banderas, canales, tridentes de Andrews/Schiff, cruces de medias móviles, soportes y resistencias, martillo, estrella fugaz, doji y velas envolventes.
- **Gráficos de velas animados**: las velas aparecen de izquierda a derecha y las líneas, marcadores y niveles del patrón se revelan con ellas.
- **Filtro por tendencia** (alcista, bajista, rango) y búsqueda por nombre; variantes alcista/bajista donde aplica.
- **Playground**: carga tus velas OHLC por arrastre, selector de archivo o pegado, elige la temporalidad y activa los patrones detectados sobre tus datos.
- **Tema claro y oscuro**, diseño responsive, tamaños táctiles en móvil y soporte de `prefers-reduced-motion`.

## Puesta en marcha

Requisitos: [Node.js](https://nodejs.org/) 20.19+ (o 22.12+) y [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev
```

Abre http://localhost:5173/ en el navegador.

Otros comandos:

| Comando | Descripción |
| --- | --- |
| `pnpm build` | Genera la versión de producción en `dist/` |
| `pnpm preview` | Sirve `dist/` en local |
| `pnpm check` | Comprueba tipos con `svelte-check` y `tsc` |

## Uso

### Patrones

Selecciona un patrón en la lista lateral para verlo en el gráfico junto a su descripción. Los patrones con dos direcciones (por ejemplo, el doji) tienen un conmutador **Alcista / Bajista** sobre el gráfico. Los filtros de tendencia y el buscador acotan la lista.

### Playground

Carga un archivo CSV (o pega su contenido) con una fila de cabecera y, al menos, dos filas de velas. Las columnas se reconocen por su nombre, en español o inglés:

| Columna | Cabeceras aceptadas |
| --- | --- |
| Fecha | `fecha`, `date`, `time`, `tiempo` |
| Apertura | `apertura`, `open` |
| Máximo | `máximo`, `max`, `high`, `alto` |
| Mínimo | `mínimo`, `min`, `low`, `bajo` |
| Cierre | `cierre`, `close`, `último`, `last` |

```csv
fecha,apertura,maximo,minimo,cierre
2024-01-02,100.00,101.20,99.40,100.80
2024-01-03,100.80,102.10,100.30,101.90
```

- Fechas admitidas: ISO (`2024-01-15`, `2024-01-15 14:30`), formato español (`15 ene 2024`, `15 ene '24 14:30`) y numérico (`15/01/2024`, `15.01.2024`).
- Los decimales pueden usar coma o punto; se ignoran los separadores de miles.
- Las columnas adicionales con nombre `SMA 20`, `EMA 50`, etc. se dibujan como medias móviles.
- El intervalo de las velas se detecta automáticamente y puedes reagrupar a temporalidades mayores (1 m, 5 m, 15 m, 30 m, 1 h, 2 h, 4 h, 1 d) desde el selector del gráfico.

Una vez cargados los datos, el panel lateral lista los patrones detectados (dobles techos y suelos, hombro-cabeza-hombro, canales, cuñas y triángulos, soportes y resistencias, aceleraciones, señales de velas y cruces de medias). Activa los que quieras para dibujarlos sobre el gráfico.

> [!NOTE]
> Todo el procesamiento ocurre en el navegador: el CSV no se envía a ningún servidor.

## Estructura del proyecto

```
src/
├── App.svelte              # Cabecera, filtros y cambio de vista Patrones / Playground
├── lib/
│   ├── chart/              # Gráfico (lightweight-charts): overlays, animación, tema, leyenda
│   ├── components/         # Chart, PatternList, PatternDetail, Playground, ThemeToggle…
│   └── data/
│       ├── patterns/       # Definición de los 24 patrones (velas + overlays)
│       ├── candleFactory.ts # Generador determinista de velas a partir de puntos clave
│       ├── csv.ts          # Parser de CSV OHLC
│       ├── detect.ts       # Detección de patrones sobre datos reales
│       └── resample.ts     # Reagrupado por temporalidad
└── app.css                 # Tema (Tailwind CSS 4) y variables de color
```

## Añadir un patrón

1. Crea el patrón en `src/lib/data/patterns/` con `genCandles` (velas a partir de puntos clave) y sus `overlays` (`hline`, `trendline`, `channel`, `pitchfork`, `ma`, `marker`).
2. Regístralo en `src/lib/data/patterns/index.ts`.

Aparecerá en la lista, en los filtros y en los datos estructurados de la página sin más cambios.

## Tecnologías

[Svelte 5](https://svelte.dev/) · [TypeScript](https://www.typescriptlang.org/) · [Vite](https://vite.dev/) · [Tailwind CSS 4](https://tailwindcss.com/) · [Lightweight Charts](https://tradingview.github.io/lightweight-charts/)
