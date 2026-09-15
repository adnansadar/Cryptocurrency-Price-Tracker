export function safeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//"))
    return "/workspace";
  try {
    const parsed = new URL(value, "http://local");
    return parsed.origin === "http://local"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : "/workspace";
  } catch {
    return "/workspace";
  }
}

export function absoluteWebUrl(path: string) {
  if (typeof window === "undefined") return path;
  return new URL(safeReturnTo(path), window.location.origin).toString();
}
