import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { fromNodeHeaders } from "better-auth/node";
import { z } from "zod";
import { auth } from "./auth.js";
import { prisma } from "./database.js";
import { ApiException } from "./errors.js";

type AuthenticatedRequest = Request & { userId?: string };

async function requireUser(
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction,
) {
  if (!auth || !prisma)
    return next(
      new ApiException(
        503,
        "AUTH_DISABLED",
        "Authentication is not configured on this deployment",
      ),
    );
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });
  if (!session)
    return next(
      new ApiException(
        401,
        "UNAUTHENTICATED",
        "Sign in to access synced research",
      ),
    );
  request.userId = session.user.id;
  next();
}

const nameSchema = z.object({ name: z.string().trim().min(1).max(80) });
const coinSchema = z.object({ coinId: z.string().trim().min(1).max(120) });
const screenSchema = z.object({
  name: z.string().trim().min(1).max(80),
  query: z.record(z.string(), z.string()),
});
const noteSchema = z.object({ body: z.string().max(5_000) });

function parse<T>(schema: z.ZodType<T>, value: unknown) {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new ApiException(
      400,
      "INVALID_BODY",
      "The request body is invalid",
      result.error.flatten(),
    );
  return result.data;
}

export const workspaceRouter = Router();
workspaceRouter.use(requireUser);

const PRIMARY_WATCHLIST_NAME = "My watchlist";

async function getOrCreatePrimaryWatchlist(userId: string) {
  return prisma!.watchlist.upsert({
    where: { userId_name: { userId, name: PRIMARY_WATCHLIST_NAME } },
    update: {},
    create: { userId, name: PRIMARY_WATCHLIST_NAME },
  });
}

workspaceRouter.get(
  "/watchlist",
  async (request: AuthenticatedRequest, response) => {
    const list = await prisma!.watchlist.findUnique({
      where: {
        userId_name: {
          userId: request.userId!,
          name: PRIMARY_WATCHLIST_NAME,
        },
      },
      include: { items: true },
    });
    response.json({ data: list?.items.map((item) => item.coinId) ?? [] });
  },
);

workspaceRouter.put(
  "/watchlist/:coinId",
  async (request: AuthenticatedRequest, response) => {
    const { coinId } = parse(coinSchema, {
      coinId: String(request.params.coinId),
    });
    const list = await getOrCreatePrimaryWatchlist(request.userId!);
    const item = await prisma!.watchlistItem.upsert({
      where: { watchlistId_coinId: { watchlistId: list.id, coinId } },
      update: {},
      create: { watchlistId: list.id, coinId },
    });
    response.status(201).json(item);
  },
);

workspaceRouter.delete(
  "/watchlist/:coinId",
  async (request: AuthenticatedRequest, response) => {
    const { coinId } = parse(coinSchema, {
      coinId: String(request.params.coinId),
    });
    const list = await prisma!.watchlist.findUnique({
      where: {
        userId_name: {
          userId: request.userId!,
          name: PRIMARY_WATCHLIST_NAME,
        },
      },
    });
    if (list)
      await prisma!.watchlistItem.deleteMany({
        where: { watchlistId: list.id, coinId },
      });
    response.status(204).end();
  },
);

workspaceRouter.get(
  "/watchlists",
  async (request: AuthenticatedRequest, response) => {
    response.json({
      data: await prisma!.watchlist.findMany({
        where: { userId: request.userId },
        include: { items: true },
        orderBy: { updatedAt: "desc" },
      }),
    });
  },
);

workspaceRouter.post(
  "/watchlists",
  async (request: AuthenticatedRequest, response) => {
    const { name } = parse(nameSchema, request.body);
    const item = await prisma!.watchlist.create({
      data: { name, userId: request.userId! },
      include: { items: true },
    });
    response.status(201).json(item);
  },
);

workspaceRouter.patch(
  "/watchlists/:id",
  async (request: AuthenticatedRequest, response) => {
    const { name } = parse(nameSchema, request.body);
    const result = await prisma!.watchlist.updateMany({
      where: {
        id: String(request.params.id),
        userId: request.userId,
        name: { not: PRIMARY_WATCHLIST_NAME },
      },
      data: { name },
    });
    if (!result.count)
      throw new ApiException(404, "NOT_FOUND", "Watchlist not found");
    response.status(204).end();
  },
);

workspaceRouter.delete(
  "/watchlists/:id",
  async (request: AuthenticatedRequest, response) => {
    await prisma!.watchlist.deleteMany({
      where: {
        id: String(request.params.id),
        userId: request.userId,
        name: { not: PRIMARY_WATCHLIST_NAME },
      },
    });
    response.status(204).end();
  },
);

workspaceRouter.post(
  "/watchlists/:id/items",
  async (request: AuthenticatedRequest, response) => {
    const { coinId } = parse(coinSchema, request.body);
    const list = await prisma!.watchlist.findFirst({
      where: { id: String(request.params.id), userId: request.userId },
    });
    if (!list) throw new ApiException(404, "NOT_FOUND", "Watchlist not found");
    const item = await prisma!.watchlistItem.upsert({
      where: { watchlistId_coinId: { watchlistId: list.id, coinId } },
      update: {},
      create: { watchlistId: list.id, coinId },
    });
    response.status(201).json(item);
  },
);

workspaceRouter.delete(
  "/watchlists/:id/items/:coinId",
  async (request: AuthenticatedRequest, response) => {
    const list = await prisma!.watchlist.findFirst({
      where: { id: String(request.params.id), userId: request.userId },
    });
    if (!list) throw new ApiException(404, "NOT_FOUND", "Watchlist not found");
    await prisma!.watchlistItem.deleteMany({
      where: { watchlistId: list.id, coinId: String(request.params.coinId) },
    });
    response.status(204).end();
  },
);

workspaceRouter.get(
  "/saved-screens",
  async (request: AuthenticatedRequest, response) => {
    response.json({
      data: await prisma!.savedScreen.findMany({
        where: { userId: request.userId },
        orderBy: { updatedAt: "desc" },
      }),
    });
  },
);

workspaceRouter.post(
  "/saved-screens",
  async (request: AuthenticatedRequest, response) => {
    const body = parse(screenSchema, request.body);
    response.status(201).json(
      await prisma!.savedScreen.create({
        data: { ...body, userId: request.userId! },
      }),
    );
  },
);

workspaceRouter.delete(
  "/saved-screens/:id",
  async (request: AuthenticatedRequest, response) => {
    await prisma!.savedScreen.deleteMany({
      where: { id: String(request.params.id), userId: request.userId },
    });
    response.status(204).end();
  },
);

workspaceRouter.get(
  "/notes",
  async (request: AuthenticatedRequest, response) => {
    response.json({
      data: await prisma!.researchNote.findMany({
        where: { userId: request.userId },
        orderBy: { updatedAt: "desc" },
      }),
    });
  },
);

workspaceRouter.put(
  "/notes/:coinId",
  async (request: AuthenticatedRequest, response) => {
    const { body } = parse(noteSchema, request.body);
    response.json(
      await prisma!.researchNote.upsert({
        where: {
          userId_coinId: {
            userId: request.userId!,
            coinId: String(request.params.coinId),
          },
        },
        update: { body },
        create: {
          userId: request.userId!,
          coinId: String(request.params.coinId),
          body,
        },
      }),
    );
  },
);

workspaceRouter.delete(
  "/notes/:coinId",
  async (request: AuthenticatedRequest, response) => {
    await prisma!.researchNote.deleteMany({
      where: { userId: request.userId, coinId: String(request.params.coinId) },
    });
    response.status(204).end();
  },
);
