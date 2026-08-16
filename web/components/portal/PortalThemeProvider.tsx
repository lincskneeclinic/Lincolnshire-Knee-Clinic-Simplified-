"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type PortalTheme = "dark" | "light";

const STORAGE_KEY = "lkc_portal_theme";

interface PortalThemeContextValue {
  theme: PortalTheme;
  toggleTheme: () => void;
}

const PortalThemeContext = createContext<PortalThemeContextValue | null>(null);

export function usePortalTheme() {
  const ctx = useContext(PortalThemeContext);
  if (!ctx) throw new Error("usePortalTheme must be used within PortalThemeProvider");
  return ctx;
}

export function PortalThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<PortalTheme>("dark");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch {
      // localStorage unavailable — fall back to default dark theme
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable — theme preference just won't persist
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return <PortalThemeContext.Provider value={{ theme, toggleTheme }}>{children}</PortalThemeContext.Provider>;
}
