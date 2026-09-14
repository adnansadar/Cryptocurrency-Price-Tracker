import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeProvider";
import { CoinDataProvider } from "./context/CoinDataProvider";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <CoinDataProvider>
        <App />
      </CoinDataProvider>
    </ThemeProvider>
  </React.StrictMode>
);
