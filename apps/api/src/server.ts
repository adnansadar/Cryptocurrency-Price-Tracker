import "./load-env.js";
import app from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(
    `Crypto Terminal API listening on http://localhost:${config.port}`,
  );
});
