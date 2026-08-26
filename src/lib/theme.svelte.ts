export type ThemeMode = "dark" | "light";

function initialMode(): ThemeMode {
  try {
    if (localStorage.getItem("trandio-theme") === "light") return "light";
  } catch {}
  return "dark";
}

export const theme = $state<{ mode: ThemeMode }>({ mode: initialMode() });

function apply() {
  document.documentElement.dataset.theme = theme.mode;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme.mode === "dark" ? "#0a0a0a" : "#fbfbfa");
}

export function toggleTheme() {
  theme.mode = theme.mode === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("trandio-theme", theme.mode);
  } catch {}
  apply();
}

apply();
