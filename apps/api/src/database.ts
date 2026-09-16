import { PrismaClient } from "@prisma/client";
import { config, persistenceEnabled } from "./config.js";

export const prisma = persistenceEnabled
  ? new PrismaClient({
      datasources: {
        db: { url: config.databaseUrl },
      },
    })
  : null;
