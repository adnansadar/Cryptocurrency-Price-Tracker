import React, { useContext, useState, useEffect } from "react";

const ThemeContext = React.createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

const initialState = localStorage.getItem("darkMode")
  ? JSON.parse(localStorage.getItem("darkMode"))
  : true;

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(initialState);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  function toggleTheme() {
    setDarkMode((prevState) => !prevState);
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
