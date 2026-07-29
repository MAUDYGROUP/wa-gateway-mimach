import { RedisAdapter, SQLiteAdapter, Whatsapp } from "wa-multi-session";
import { createWebhookSession } from "./webhooks/session";
import { env } from "./env";
import { CreateWebhookProps } from "./webhooks";
import { createWebhookMessage } from "./webhooks/message";
import { messageStore, randomUUID } from "./message-store";
import {
  handleWebhookAudioMessage,
  handleWebhookDocumentMessage,
  handleWebhookImageMessage,
  handleWebhookVideoMessage,
} from "./webhooks/media";

export const whatsappStatuses = new Map<
  string,
  {
    status: "connecting" | "connected" | "disconnected";
    details?: {
      name?: string;
      phoneNumber?: string;
    };
  }
>();

const webhookProps: CreateWebhookProps = {
  baseUrl: env.WEBHOOK_BASE_URL,
};

const webhookSession = createWebhookSession(webhookProps);

const webhookMessage = createWebhookMessage(webhookProps);

const adapter = env.REDIS_URL
  ? new RedisAdapter({
      url: env.REDIS_URL,
    })
  : new SQLiteAdapter();

export const whatsapp = new Whatsapp({
  adapter: adapter,

  onConnecting(sessionId) {
    whatsappStatuses.set(sessionId, {
      details: whatsappStatuses.get(sessionId)?.details,
      status: "connecting",
    });

    console.log(`[${sessionId}] connecting`);
    webhookSession({ session: sessionId, status: "connecting" });
  },
  async onConnected(sessionId) {
    const session = await whatsapp.getSessionById(sessionId);
    const user = session?.sock?.user;

    // Set presence ke "unavailable" agar notifikasi HP tetap masuk
    if (session?.sock) {
      try {
        await session.sock.sendPresenceUpdate("unavailable");
      } catch (e) {
        console.error(`[${sessionId}] Failed to set presence:`, e);
      }
    }

    whatsappStatuses.set(sessionId, {
      status: "connected",
      details: {
        name: user?.name || "",
        phoneNumber: user?.id?.split(":")[0] || "",
      },
    });

    console.log(`[${sessionId}] connected`);
    webhookSession({ session: sessionId, status: "connected" });
  },
  onDisconnected(sessionId) {
    whatsappStatuses.set(sessionId, {
      details: whatsappStatuses.get(sessionId)?.details,
      status: "disconnected",
    });

    console.log(`[${sessionId}] disconnected`);
    webhookSession({ session: sessionId, status: "disconnected" });
  },

  onMessageReceived: async (message) => {
    // Simpan pesan masuk ke message store
    if (!message.key.fromMe && !message.key.remoteJid?.includes("broadcast") && !message.key.remoteJid?.endsWith("@g.us")) {
      const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        message.message?.documentMessage?.caption ||
        null;

      const type = message.message?.imageMessage
        ? "image"
        : message.message?.videoMessage
          ? "video"
          : message.message?.documentMessage
            ? "document"
            : message.message?.audioMessage
              ? "audio"
              : message.message?.stickerMessage
                ? "sticker"
                : "text";

      let fromJid = message.key.remoteJid ?? undefined;
      if (fromJid?.includes("@lid")) {
        fromJid = message.key.remoteJidAlt || message.key.participantAlt || fromJid;
      }

      let mediaObj: any = undefined;
      if (type === "image") {
        const file = await handleWebhookImageMessage(message);
        if (file) mediaObj = { image: file };
      } else if (type === "video") {
        const file = await handleWebhookVideoMessage(message);
        if (file) mediaObj = { video: file };
      } else if (type === "document") {
        const file = await handleWebhookDocumentMessage(message);
        if (file) mediaObj = { document: file };
      } else if (type === "audio") {
        const file = await handleWebhookAudioMessage(message);
        if (file) mediaObj = { audio: file };
      }

      await messageStore.add({
        id: message.key.id || randomUUID(),
        direction: "received",
        status: "success",
        session: message.sessionId,
        from: fromJid,
        text,
        type,
        media: mediaObj,
        timestamp: Date.now(),
      });
    }

    // Teruskan ke webhook eksternal seperti semula
    webhookMessage(message);
  },
});
