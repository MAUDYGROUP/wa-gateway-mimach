import { Hono } from "hono";
import { createDashboardMiddleware } from "../../middlewares/key.middleware";
import DashboardIndex from "../../views/dashboard";
import SessionPage from "../../views/dashboard/sessions";
import MessageSendPage from "../../views/dashboard/message-send";
import MessageLogPage from "../../views/dashboard/message-log";
import { whatsapp, whatsappStatuses } from "../../whatsapp";
import { messageStore } from "../../message-store";
import { randomUUID } from "crypto";
import CreateSessionPage from "../../views/dashboard/session-create";

const qrStore = new Map<
  string,
  {
    status: "pending" | "connecting" | "connected" | "diconnected";
    qr: string | null;
  }
>();
const qrStoreTimeouts = new Map<string, NodeJS.Timeout>();

export const createDashboardController = () => {
  const app = new Hono()
    .use(createDashboardMiddleware()) // protect all dashboard routes

    .get("/", (c) => c.redirect("/dashboard")) // redirect to /dashboard

    /**
     * dashboard routes
     * prefix: /dashboard
     */
    .basePath("/dashboard")

    .get("/", async (c) => {
      return c.render(<DashboardIndex />);
    })

    /**
     * sessions routes
     */
    .route(
      "/sessions",
      new Hono()
        .get("/", async (c) => {
          const sessions = Array.from(whatsappStatuses.entries()).map(
            ([session, status]) => ({
              session,
              ...status,
            }),
          );

          return c.render(<SessionPage sessions={sessions} />);
        })
        .get("/create/qr", async (c) => {
          const id = c.req.query("id") || "";
          const state = qrStore.get(id) || null;
          return c.json({
            ...state,
            status:
              state?.status ||
              whatsappStatuses.get(id)?.status ||
              "disconnected",
          });
        })
        .get("/create", async (c) => {
          const uuid = c.req.query("id") || randomUUID();
          const isExist = whatsappStatuses.has(uuid);

          if (!isExist) {
            whatsappStatuses.set(uuid, { status: "connecting" });
            await whatsapp.startSession(uuid, {
              onQRUpdated(qr) {
                qrStore.set(uuid, {
                  qr: qr,
                  status: "pending",
                });

                // Clear previous timeout if exists
                if (qrStoreTimeouts.has(uuid)) {
                  clearTimeout(qrStoreTimeouts.get(uuid)!);
                }

                // Set a timeout to delete the QR code after 1 minutes
                const timeout = setTimeout(
                  () => {
                    qrStore.delete(uuid);
                    qrStoreTimeouts.delete(uuid);
                  },
                  1 * 60 * 1000,
                ); // 1 minutes

                qrStoreTimeouts.set(uuid, timeout);
              },
              onConnecting() {
                const existing = qrStore.get(uuid);
                if (existing) {
                  qrStore.set(uuid, {
                    ...existing,
                    status: "connecting",
                  });
                }
              },
              onConnected() {
                const existing = qrStore.get(uuid);
                if (existing) {
                  qrStore.set(uuid, {
                    qr: null,
                    status: "connected",
                  });
                }

                // Clear previous timeout if exists
                if (qrStoreTimeouts.has(uuid)) {
                  clearTimeout(qrStoreTimeouts.get(uuid)!);
                }
                // Set a timeout to delete the QR code after 1 minutes
                const timeout = setTimeout(
                  () => {
                    qrStore.delete(uuid);
                    qrStoreTimeouts.delete(uuid);
                  },
                  1 * 60 * 1000,
                ); // 1 minutes

                qrStoreTimeouts.set(uuid, timeout);
              },
              onDisconnected() {
                qrStore.delete(uuid);
                if (qrStoreTimeouts.has(uuid)) {
                  clearTimeout(qrStoreTimeouts.get(uuid)!);
                  qrStoreTimeouts.delete(uuid);
                }
              },
            });
          }

          return c.render(<CreateSessionPage id={uuid} />);
        })
        .delete("/delete-api/:session", async (c) => {
          const sessionId = c.req.param("session");
          if (!sessionId) {
            return c.json({ success: false, message: "Session ID is required" }, 400);
          }
          
          try {
            await whatsapp.deleteSession(sessionId);
            whatsappStatuses.delete(sessionId);
            return c.json({ success: true, message: "Session deleted successfully" });
          } catch (error) {
            return c.json({ 
              success: false, 
              message: `Failed to delete session: ${error instanceof Error ? error.message : "Unknown error"}` 
            }, 500);
          }
        }),
    )

    /**
     * message routes
     */
    .get("/messages/poll-json", async (c) => {
      const messages = await messageStore.getAll();
      const count = messages.length;
      return c.json({ count });
    })
    .route(
      "/messages",
      new Hono()
        .get("/", async (c) => {
          const sessions = Array.from(whatsappStatuses.entries())
            .filter(([, status]) => status.status === "connected")
            .map(([session]) => session);
          return c.render(<MessageSendPage sessions={sessions} />);
        })
        .post("/send-text-api", async (c) => {
          const { session, to: rawTo, message } = await c.req.json();

          if (!session || !rawTo || !message) {
            return c.json({ success: false, error: "Missing parameters" }, 400);
          }

          // Normalisasi nomor telepon
          const digits = (rawTo as string).replace(/\D/g, "");
          const to = digits.startsWith("62") ? digits
            : digits.startsWith("0") ? "62" + digits.slice(1)
            : digits.startsWith("8") ? "62" + digits
            : digits;

          const msgId = randomUUID();
          await messageStore.add({
            id: msgId,
            direction: "sent",
            status: "pending",
            session,
            to,
            text: message,
            type: "text",
            timestamp: Date.now(),
            resendPayload: { session, to, text: message },
          });

          try {
            await whatsapp.sendText({ sessionId: session, text: message, to });
            await messageStore.updateStatus(msgId, "success");
            return c.json({ success: true });
          } catch (error) {
            await messageStore.updateStatus(msgId, "failed", (error as Error).message);
            return c.json({ success: false, error: (error as Error).message }, 500);
          }
        })

        .post("/send-media-api", async (c) => {
          const body = await c.req.parseBody();
          const session = body.session as string;
          const rawTo = body.to as string;
          const message = body.message as string;
          const media = body.media as File;

          if (!session || !rawTo || !media) {
            return c.json({ success: false, error: "Missing parameters" }, 400);
          }

          const digits = rawTo.replace(/\D/g, "");
          const to = digits.startsWith("62") ? digits
            : digits.startsWith("0") ? "62" + digits.slice(1)
            : digits.startsWith("8") ? "62" + digits
            : digits;

          const msgId = randomUUID();
          
          const ext = media.name.split('.').pop() || 'tmp';
          const filename = `${msgId}.${ext}`;
          const filePath = `./media/${filename}`;
          
          const arrayBuffer = await media.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          const fs = await import('fs/promises');
          await fs.writeFile(filePath, buffer);

          let mediaObj: any = undefined;
          let type: "image" | "video" | "document" | "audio" | "text" | "sticker" = "document";
          
          if (media.type.startsWith("image/")) {
            type = "image";
            mediaObj = { image: filename };
          } else if (media.type.startsWith("video/")) {
            type = "video";
            mediaObj = { video: filename };
          } else if (media.type.startsWith("audio/")) {
            type = "audio";
            mediaObj = { audio: filename };
          } else {
            type = "document";
            mediaObj = { document: filename };
          }

          await messageStore.add({
            id: msgId,
            direction: "sent",
            status: "pending",
            session,
            to,
            text: message,
            type,
            media: mediaObj,
            timestamp: Date.now(),
            resendPayload: { session, to, text: message },
          });

          try {
            if (type === "image") {
              await whatsapp.sendImage({ sessionId: session, to, text: message, media: filePath });
            } else if (type === "video") {
              await whatsapp.sendVideo({ sessionId: session, to, text: message, media: filePath });
            } else {
              await whatsapp.sendDocument({ sessionId: session, to, text: message, media: filePath, filename: media.name });
            }
            await messageStore.updateStatus(msgId, "success");
            return c.json({ success: true });
          } catch (error) {
            await messageStore.updateStatus(msgId, "failed", (error as Error).message);
            return c.json({ success: false, error: (error as Error).message }, 500);
          }
        })

        .post("/resend", async (c) => {
          const { messageId } = await c.req.json();
          if (!messageId) {
            return c.json({ success: false, error: "messageId is required" }, 400);
          }

          const msg = await messageStore.getById(messageId);
          if (!msg || !msg.resendPayload) {
            return c.json({ success: false, error: "Message not found or not resendable" }, 404);
          }

          try {
            await whatsapp.sendText({
              sessionId: msg.resendPayload.session,
              to: msg.resendPayload.to,
              text: msg.resendPayload.text,
            });
            await messageStore.updateStatus(messageId, "success");
            return c.json({ success: true });
          } catch (error) {
            return c.json(
              { success: false, error: (error as Error).message },
              500,
            );
          }
        }),
    )

    /**
     * log route
     */
    .get("/log", async (c) => {
      const messages = await messageStore.getAll();
      return c.render(<MessageLogPage messages={messages} />);
    });

  return app;
};

