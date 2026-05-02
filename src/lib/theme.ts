export const DEFAULT_THEME = "light";
export const THEME_STORAGE_KEY = "theme";
export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];
export type ThemeAttribute = "class" | `data-${string}`;

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}
