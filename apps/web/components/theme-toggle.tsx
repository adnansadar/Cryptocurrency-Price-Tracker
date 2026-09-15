"use client";

import { THEME_STORAGE_KEY } from "@/lib/theme";

export function ThemeToggle() {
  function toggle() {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
  }
  return (
    <button
      className="icon-button"
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
    >
      <span className="theme-sun" aria-hidden="true">
        ☀
      </span>
      <span className="theme-moon" aria-hidden="true">
        ☾
      </span>
    </button>
  );
}
