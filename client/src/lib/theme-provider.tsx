import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "high-contrast";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    return (stored as Theme) || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "high-contrast");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
    // Update status bar icon color to match theme
    if (typeof window !== 'undefined') {
      import('@capacitor/core').then(({ Capacitor }) => {
        if (Capacitor.isNativePlatform()) {
          import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
            const isDark = theme === 'dark';
            StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark }).catch(() => {});
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
