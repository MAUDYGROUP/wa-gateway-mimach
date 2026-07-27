/**
 * Message Store — mendukung dua mode:
 *   1. Redis  → jika REDIS_URL tersedia (persistent, survives restart)
 *   2. Memory → fallback jika tidak ada Redis
 *
 * Key Redis: "msg_store" (Redis List, LPUSH + LTRIM, max 500 item)
 * Setiap item diserialisasi sebagai JSON string.
 */

import { createClient } from "redis";
import { env } from "./env";
import { randomUUID } from "crypto";

export type MessageDirection = "sent" | "received";
export type MessageStatus = "success" | "failed" | "pending";
export type MessageType = "text" | "image" | "video" | "document" | "audio" | "sticker";

export interface StoredMessage {
  id: string;
  direction: MessageDirection;
  status: MessageStatus;
  session: string;
  from?: string;
  to?: string;
  text: string | null;
  type: MessageType;
  media?: {
    image?: string | null;
    video?: string | null;
    document?: string | null;
    audio?: string | null;
  };
  timestamp: number;
  errorMessage?: string;
  resendPayload?: {
    session: string;
    to: string;
    text: string;
  };
}

const MAX_MESSAGES = 500;
const REDIS_KEY = "wa_gateway:msg_store";

// ─── Redis client (lazy init) ─────────────────────────────────────────────────

let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (!env.REDIS_URL) return null;
  if (redisClient) return redisClient;

  redisClient = createClient({ url: env.REDIS_URL });
  redisClient.on("error", (err) =>
    console.error("[message-store] Redis error:", err)
  );
  await redisClient.connect();
  console.log("[message-store] Connected to Redis");
  return redisClient;
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

const memoryMessages: StoredMessage[] = [];

// ─── Public API ───────────────────────────────────────────────────────────────

export const messageStore = {
  /**
   * Tambah pesan baru
   */
  async add(msg: StoredMessage): Promise<void> {
    const redis = await getRedis();
    if (redis) {
      await redis.lPush(REDIS_KEY, JSON.stringify(msg));
      await redis.lTrim(REDIS_KEY, 0, MAX_MESSAGES - 1);
    } else {
      if (memoryMessages.length >= MAX_MESSAGES) memoryMessages.shift();
      memoryMessages.unshift(msg);
    }
  },

  /**
   * Ambil semua pesan (terbaru di atas)
   */
  async getAll(): Promise<StoredMessage[]> {
    const redis = await getRedis();
    if (redis) {
      const raw = await redis.lRange(REDIS_KEY, 0, MAX_MESSAGES - 1);
      return raw.map((s) => JSON.parse(s) as StoredMessage);
    }
    return [...memoryMessages];
  },

  /**
   * Ambil pesan berdasarkan ID
   */
  async getById(id: string): Promise<StoredMessage | undefined> {
    const all = await this.getAll();
    return all.find((m) => m.id === id);
  },

  /**
   * Update status pesan (untuk resend / konfirmasi terkirim)
   */
  async updateStatus(id: string, status: MessageStatus, errorMessage?: string): Promise<void> {
    const redis = await getRedis();
    if (redis) {
      const raw = await redis.lRange(REDIS_KEY, 0, MAX_MESSAGES - 1);
      const idx = raw.findIndex((s) => {
        try {
          return (JSON.parse(s) as StoredMessage).id === id;
        } catch {
          return false;
        }
      });

      if (idx !== -1) {
        const msg = JSON.parse(raw[idx]) as StoredMessage;
        msg.status = status;
        if (errorMessage !== undefined) msg.errorMessage = errorMessage;
        // Redis tidak mendukung update by index langsung,
        // gunakan LSET untuk mengupdate elemen di posisi idx
        await redis.lSet(REDIS_KEY, idx, JSON.stringify(msg));
      }
    } else {
      const i = memoryMessages.findIndex((m) => m.id === id);
      if (i !== -1) {
        memoryMessages[i].status = status;
        if (errorMessage !== undefined) memoryMessages[i].errorMessage = errorMessage;
      }
    }
  },

  /**
   * Jumlah pesan tersimpan
   */
  async count(): Promise<number> {
    const redis = await getRedis();
    if (redis) {
      return redis.lLen(REDIS_KEY);
    }
    return memoryMessages.length;
  },
};

// Re-export randomUUID for convenience (tetap dipakai di tempat lain)
export { randomUUID };
