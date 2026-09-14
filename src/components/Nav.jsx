import React from "react";
import { useTheme } from "../context/ThemeProvider";

const Nav = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <a className="brand" href="/" aria-label="Crypto Tracker home">
          <span className="brand-mark" aria-hidden="true">CT</span>
          <span>Crypto Tracker</span>
        </a>
        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} theme`}
            title={`Switch to ${darkMode ? "light" : "dark"} theme`}
          >
            {darkMode ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Nav;
