import "./load-env.js";
import { createApp } from "./app.js";
import { config } from "./config.js";

createApp().listen(config.port, () => {
  console.log(
    `Crypto Terminal API listening on http://localhost:${config.port}`,
  );
});
