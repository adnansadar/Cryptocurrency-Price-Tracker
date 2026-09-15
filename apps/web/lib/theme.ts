export const THEME_STORAGE_KEY = "cryptoTerminal.theme";

const LEGACY_WORKSPACE_KEYS = [
  "cryptoTerminal.watchlist",
  "cryptoTerminal.lists",
  "cryptoTerminal.savedScreens",
  "cryptoTerminal.notes",
  "cryptoTerminal.recent",
  "cryptoTerminal.lastSyncedUser",
  "cryptoTracker.watchlist",
] as const;

export function clearLegacyWorkspaceStorage() {
  for (const key of LEGACY_WORKSPACE_KEYS) localStorage.removeItem(key);
}
