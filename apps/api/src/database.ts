import { PrismaClient } from "@prisma/client";
import { persistenceEnabled } from "./config.js";

export const prisma = persistenceEnabled ? new PrismaClient() : null;
