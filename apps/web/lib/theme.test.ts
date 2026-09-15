import { beforeEach, describe, expect, it } from "vitest";
import { clearLegacyWorkspaceStorage, THEME_STORAGE_KEY } from "./theme";

describe("legacy workspace cleanup", () => {
  beforeEach(() => localStorage.clear());

  it("removes workspace data without removing the theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    localStorage.setItem("cryptoTerminal.watchlist", '["bitcoin"]');
    localStorage.setItem("cryptoTerminal.notes", "[]");

    clearLegacyWorkspaceStorage();

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(localStorage.getItem("cryptoTerminal.watchlist")).toBeNull();
    expect(localStorage.getItem("cryptoTerminal.notes")).toBeNull();
  });
});
