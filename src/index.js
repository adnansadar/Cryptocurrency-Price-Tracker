import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Router } from "react-router";
import history from "./history";
import { ThemeProvider } from "./context/ThemeProvider";
import { CoinDataProvider } from "./context/CoinDataProvider";

ReactDOM.render(
  <Router history={history}>
    <ThemeProvider>
      <CoinDataProvider>
        <App />
      </CoinDataProvider>
    </ThemeProvider>
  </Router>,
  document.getElementById("root")
);
