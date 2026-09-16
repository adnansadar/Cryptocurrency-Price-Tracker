import { createClient, type RedisClientType } from "redis";
import { config } from "./config.js";

type Entry = { value: unknown; expiresAt: number };

export class HybridCache {
  private readonly memory = new Map<string, Entry>();
  private redis: RedisClientType | null = null;
  private redisConnection: Promise<void> | null = null;
  private redisRetryAt = 0;

  constructor(private readonly maxEntries = 150) {}

  private async connectRedis() {
    if (
      !config.redisUrl ||
      this.redis?.isReady ||
      Date.now() < this.redisRetryAt
    )
      return;
    if (!this.redisConnection) {
      const client = createClient({
        url: config.redisUrl,
        socket: {
          connectTimeout: 1_000,
          reconnectStrategy: false,
        },
      }) as RedisClientType;
      this.redis = client;
      client.on("error", () => undefined);
      this.redisConnection = client
        .connect()
        .then(() => undefined)
        .catch(() => {
          if (this.redis === client) this.redis = null;
          this.redisRetryAt = Date.now() + 30_000;
        })
        .finally(() => {
          this.redisConnection = null;
        });
    }
    await this.redisConnection;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.connectRedis();
    if (this.redis?.isReady) {
      const raw = await this.redis.get(key).catch(() => null);
      if (raw) return JSON.parse(raw) as T;
    }
    const entry = this.memory.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      this.memory.delete(key);
      return null;
    }
    this.memory.delete(key);
    this.memory.set(key, entry);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number) {
    await this.connectRedis();
    if (this.redis?.isReady) {
      await this.redis
        .set(key, JSON.stringify(value), { EX: ttlSeconds })
        .catch(() => undefined);
    }
    this.memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1_000 });
    while (this.memory.size > this.maxEntries) {
      const oldest = this.memory.keys().next().value as string | undefined;
      if (!oldest) break;
      this.memory.delete(oldest);
    }
  }
}

export const cache = new HybridCache();
