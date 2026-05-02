"use client";

import {
  DEFAULT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
  isTheme,
  type Theme,
  type ThemeAttribute,
} from "@/lib/theme";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type ThemeProviderProps = Readonly<{
  children: ReactNode;
  attribute?: ThemeAttribute;
  defaultTheme?: Theme;
  enableColorScheme?: boolean;
  storageKey?: string;
}>;

type ThemeContextValue = Readonly<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>;

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => undefined,
});

function readTheme(storageKey: string, defaultTheme: Theme) {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  try {
    const storedTheme = window.localStorage.getItem(storageKey);

    return isTheme(storedTheme) ? storedTheme : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

function applyTheme(theme: Theme, attribute: ThemeAttribute, enableColorScheme: boolean) {
  const root = document.documentElement;

  if (attribute === "class") {
    root.classList.remove(...THEMES);
    root.classList.add(theme);
  } else {
    root.setAttribute(attribute, theme);
  }

  if (enableColorScheme) {
    root.style.colorScheme = theme;
  }
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = DEFAULT_THEME,
  enableColorScheme = true,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => readTheme(storageKey, defaultTheme));

  useEffect(() => {
    applyTheme(theme, attribute, enableColorScheme);
  }, [attribute, enableColorScheme, theme]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);

      try {
        window.localStorage.setItem(storageKey, nextTheme);
      } catch {}

      applyTheme(nextTheme, attribute, enableColorScheme);
    },
    [attribute, enableColorScheme, storageKey]
  );

  const contextValue = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
