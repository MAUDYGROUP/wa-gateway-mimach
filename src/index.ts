import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import moment from "moment";
import { globalErrorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notfound.middleware";
import { serve } from "@hono/node-server";
import { env } from "./env";
import { createSessionController } from "./controllers/session";
import { createMessageController } from "./controllers/message";
import { createProfileController } from "./controllers/profile";
import { serveStatic } from "@hono/node-server/serve-static";
import { createHealthController } from "./controllers/health";
import { createAuthController } from "./controllers/dashboard/auth";
import { createDashboardController } from "./controllers/dashboard/dashboard";
import * as fs from "fs/promises";
import * as path from "path";
import { systemLogStore } from "./log-store";

const app = new Hono()
  .use(
    logger((...params) => {
      params.map((e) => console.log(`${moment().toISOString()} | ${e}`));
    }),
  )
  .use(cors())

  .onError(globalErrorMiddleware)
  .notFound(notFoundMiddleware)

  /**
   * serve media message static files
   */

  .use(
    "/media/*",
    serveStatic({
      root: "./",
    }),
  )
  .use(
    "/assets/*",
    serveStatic({
      root: "./",
    }),
  )

  /**
   * session routes
   */
  .route("/", createSessionController())
  /**
   * message routes
   */
  .route("/", createMessageController())
  /**
   * profile routes
   */
  .route("/", createProfileController())

  /**
   * health routes
   */
  .route("/", createHealthController())

  /**
   * auth routes
   */
  .route("/", createAuthController())
  /**
   * dashboard routes
   */
  .route("/", createDashboardController());

const port = env.PORT;

serve(
  {
    fetch: app.fetch,
    port: port,
  },
  () => {
    console.log(`Server is running on port ${port}`);
    systemLogStore.add({
      level: "INFO",
      event: "SERVER_START",
      message: `Server WA Gateway berhasil dijalankan di port ${port}.`,
    });
  },
);

// Auto cleanup old media (older than 2 days) and old logs (older than 7 days)
const cleanupOldData = async () => {
  try {
    const mediaDir = path.join(process.cwd(), "media");
    const files = await fs.readdir(mediaDir);
    const now = Date.now();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
    
    let deletedCount = 0;
    for (const file of files) {
      if (file === ".gitkeep") continue;
      const filePath = path.join(mediaDir, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtimeMs > twoDaysMs) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`[Cleanup] Deleted ${deletedCount} old media files.`);
    }
  } catch (error) {
    if ((error as any).code !== "ENOENT") {
      console.error("[Cleanup] Failed to cleanup media:", error);
    }
  }

  // Cleanup old system logs (> 7 days)
  try {
    await systemLogStore.cleanupOldLogs();
  } catch (error) {
    console.error("[Cleanup] Failed to cleanup system logs:", error);
  }
};

// Run cleanup every hour
setInterval(cleanupOldData, 60 * 60 * 1000);
// Also run once on startup
setTimeout(cleanupOldData, 5000);
