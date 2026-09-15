import path from "node:path";
import { config as load } from "dotenv";

load({ path: path.resolve(process.cwd(), "../../.env"), quiet: true });
