import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Router } from "react-router";
import history from "./history";
import { ThemeProvider } from "./context/ThemeProvider";

ReactDOM.render(
  <Router history={history}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Router>,
  document.getElementById("root")
);
