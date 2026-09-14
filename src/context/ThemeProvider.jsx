import React, { useContext, useEffect, useState } from "react";

const ThemeContext = React.createContext();
const THEME_STORAGE_KEY = "cryptoTracker.theme";

export function useTheme() {
  return useContext(ThemeContext);
}

function getInitialTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const darkMode = theme === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Theme switching still works if browser storage is unavailable.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ darkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
