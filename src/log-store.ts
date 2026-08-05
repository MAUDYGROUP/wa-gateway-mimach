import { createClient } from "redis";
import { env } from "./env";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export type SystemLogLevel = "INFO" | "WARN" | "ERROR";

export interface SystemLog {
  id: string;
  timestamp: number;
  level: SystemLogLevel;
  event: string;
  session?: string;
  message: string;
  details?: string;
}

const REDIS_KEY = "wa_gateway:sys_logs";
const LOGS_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOGS_DIR, "system_logs.jsonl");
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_MEM_LOGS = 2000;

// ─── Redis client (lazy init) ─────────────────────────────────────────────────
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (!env.REDIS_URL) return null;
  if (redisClient) return redisClient;

  redisClient = createClient({ url: env.REDIS_URL });
  redisClient.on("error", (err) =>
    console.error("[system-log-store] Redis error:", err)
  );
  await redisClient.connect();
  console.log("[system-log-store] Connected to Redis");
  return redisClient;
}

// ─── Local File Init ──────────────────────────────────────────────────────────
function ensureLogDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

// Memory fallback / cache for file storage
let fileLogsCache: SystemLog[] | null = null;

function loadFileLogs(): SystemLog[] {
  ensureLogDir();
  if (!fs.existsSync(LOG_FILE)) return [];
  try {
    const content = fs.readFileSync(LOG_FILE, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    const logs: SystemLog[] = [];
    const now = Date.now();
    for (const line of lines) {
      try {
        const log = JSON.parse(line) as SystemLog;
        // Hanya muat yang belum lewat 7 hari
        if (now - log.timestamp <= SEVEN_DAYS_MS) {
          logs.push(log);
        }
      } catch {
        // Abaikan baris rusak
      }
    }
    // Urutkan dari terbaru ke terlama
    logs.sort((a, b) => b.timestamp - a.timestamp);
    return logs.slice(0, MAX_MEM_LOGS);
  } catch (err) {
    console.error("[system-log-store] Error reading log file:", err);
    return [];
  }
}

function appendLogToFile(log: SystemLog) {
  try {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, JSON.stringify(log) + "\n", "utf-8");
  } catch (err) {
    console.error("[system-log-store] Error appending log file:", err);
  }
}

function overwriteLogFile(logs: SystemLog[]) {
  try {
    ensureLogDir();
    // Tulis dari yang terlama ke terbaru ke file jsonl
    const lines = [...logs].reverse().map((l) => JSON.stringify(l)).join("\n") + (logs.length > 0 ? "\n" : "");
    fs.writeFileSync(LOG_FILE, lines, "utf-8");
  } catch (err) {
    console.error("[system-log-store] Error overwriting log file:", err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const systemLogStore = {
  /**
   * Tambah log sistem baru
   */
  async add(props: {
    level: SystemLogLevel;
    event: string;
    session?: string;
    message: string;
    details?: any;
  }): Promise<SystemLog> {
    const log: SystemLog = {
      id: randomUUID(),
      timestamp: Date.now(),
      level: props.level,
      event: props.event,
      session: props.session,
      message: props.message,
      details: props.details ? (typeof props.details === "string" ? props.details : JSON.stringify(props.details)) : undefined,
    };

    const redis = await getRedis();
    if (redis) {
      await redis.lPush(REDIS_KEY, JSON.stringify(log));
      await redis.lTrim(REDIS_KEY, 0, MAX_MEM_LOGS - 1);
    } else {
      if (!fileLogsCache) fileLogsCache = loadFileLogs();
      fileLogsCache.unshift(log);
      if (fileLogsCache.length > MAX_MEM_LOGS) fileLogsCache.pop();
      appendLogToFile(log);
    }

    // Konsol logging agar mudah dibaca di terminal
    const sessionTag = log.session ? ` [Session: ${log.session}]` : "";
    console.log(`[SYS-LOG] [${log.level}] [${log.event}]${sessionTag} ${log.message}${log.details ? ` (${log.details})` : ""}`);

    return log;
  },

  /**
   * Ambil semua log (terbaru di atas)
   */
  async getAll(): Promise<SystemLog[]> {
    const redis = await getRedis();
    if (redis) {
      const raw = await redis.lRange(REDIS_KEY, 0, MAX_MEM_LOGS - 1);
      return raw.map((s) => JSON.parse(s) as SystemLog);
    }
    if (!fileLogsCache) fileLogsCache = loadFileLogs();
    return [...fileLogsCache];
  },

  /**
   * Hapus log yang lebih tua dari 7 hari (Retainment Policy)
   */
  async cleanupOldLogs(): Promise<number> {
    const now = Date.now();
    const minTimestamp = now - SEVEN_DAYS_MS;
    let deletedCount = 0;

    const redis = await getRedis();
    if (redis) {
      const allRaw = await redis.lRange(REDIS_KEY, 0, -1);
      const validLogs: string[] = [];
      for (const raw of allRaw) {
        try {
          const l = JSON.parse(raw) as SystemLog;
          if (l.timestamp >= minTimestamp) {
            validLogs.push(raw);
          } else {
            deletedCount++;
          }
        } catch {
          deletedCount++;
        }
      }
      if (deletedCount > 0) {
        await redis.del(REDIS_KEY);
        if (validLogs.length > 0) {
          // rPush in reverse or just re-push in order
          await redis.rPush(REDIS_KEY, validLogs);
        }
      }
    } else {
      if (!fileLogsCache) fileLogsCache = loadFileLogs();
      const initialLen = fileLogsCache.length;
      fileLogsCache = fileLogsCache.filter((l) => l.timestamp >= minTimestamp);
      deletedCount = initialLen - fileLogsCache.length;
      if (deletedCount > 0 || !fs.existsSync(LOG_FILE)) {
        overwriteLogFile(fileLogsCache);
      }
    }

    if (deletedCount > 0) {
      console.log(`[system-log-store] Cleaned up ${deletedCount} logs older than 7 days.`);
    }
    return deletedCount;
  },

  /**
   * Helper untuk merapikan penjelasan kode disconnect WhatsApp (Baileys)
   */
  formatDisconnectReason(code?: number, errorObj?: any): { description: string; shouldRelogin: boolean } {
    if (!code) {
      const msg = errorObj ? (typeof errorObj === "string" ? errorObj : JSON.stringify(errorObj)) : "Alasan tidak diketahui";
      return { description: `Koneksi terputus: ${msg}`, shouldRelogin: false };
    }

    switch (code) {
      case 401: // DisconnectReason.loggedOut
        return {
          description: "Sesi telah terlogout dari WhatsApp di HP atau token kedaluwarsa. Anda harus scan ulang QR code.",
          shouldRelogin: true,
        };
      case 408: // DisconnectReason.timedOut
        return {
          description: "Koneksi timeout (RTO) saat mencoba menghubungi server WhatsApp.",
          shouldRelogin: false,
        };
      case 411: // DisconnectReason.multideviceMismatch
        return {
          description: "Ketidakcocokan versi multi-device WhatsApp.",
          shouldRelogin: true,
        };
      case 428: // DisconnectReason.connectionClosed
        return {
          description: "Koneksi ke server WhatsApp tertinggal/ditutup (Connection Closed). Sistem mencoba menghubungkan kembali.",
          shouldRelogin: false,
        };
      case 440: // DisconnectReason.connectionLost
        return {
          description: "Koneksi jaringan terputus dari WhatsApp (Connection Lost). Memeriksa jaringan dan mencoba kembali.",
          shouldRelogin: false,
        };
      case 500: // DisconnectReason.badSession
        return {
          description: "Data sesi lokal rusak (Bad Session). Disarankan hapus sesi dan scan QR ulang.",
          shouldRelogin: true,
        };
      case 503: // DisconnectReason.restartRequired (sometimes 503/515)
        return {
          description: "Server WhatsApp meminta mulai ulang koneksi (Restart Required). Mengaktifkan ulang socket...",
          shouldRelogin: false,
        };
      case 515: // Stream Restart
        return {
          description: "Server WhatsApp memuat ulang stream koneksi (Stream Restart). Mengaktifkan ulang secara otomatis...",
          shouldRelogin: false,
        };
      default:
        return {
          description: `Koneksi terputus dengan Kode Error HTTP: ${code}. ${errorObj ? JSON.stringify(errorObj) : ""}`,
          shouldRelogin: false,
        };
    }
  }
};
