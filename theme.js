const root = document.documentElement;
const lightQuery = window.matchMedia("(prefers-color-scheme: light)");

function systemTheme() {
  return lightQuery.matches ? "light" : "dark";
}

function setTheme(theme) {
  try {
    if (theme === systemTheme()) {
      delete root.dataset.theme;
      localStorage.removeItem("theme");
    } else {
      root.dataset.theme = theme;
      localStorage.setItem("theme", theme);
    }
  } catch {
    // Storage can be blocked; the theme still applies for this page view.
  }
}

try {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;
} catch {}

lightQuery.addEventListener("change", () => setTheme(systemTheme()));

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".theme-toggle").addEventListener("click", () => {
    const current = root.dataset.theme || systemTheme();
    setTheme(current === "light" ? "dark" : "light");
  });
});
