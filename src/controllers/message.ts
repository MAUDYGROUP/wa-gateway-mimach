import { Hono } from "hono";
import { createKeyMiddleware } from "../middlewares/key.middleware";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { whatsapp } from "../whatsapp";
import { messageStore } from "../message-store";
import { randomUUID } from "crypto";

const randomDelay = (min: number, max: number) => {
  const ms = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const createMessageController = () => {
  const sendMessageSchema = z.object({
    session: z.string(),
    to: z.string(),
    text: z.string(),
    is_group: z.boolean().optional(),
  });

  const app = new Hono()
    .basePath("/message")
    /**
     *
     * POST /message/send-text
     *
     */
    .post(
      "/send-text",
      createKeyMiddleware(),
      requestValidator("json", sendMessageSchema),
      async (c) => {
        const payload = c.req.valid("json");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          throw new HTTPException(400, {
            message: "Session does not exist",
          });
        }

        const msgId = randomUUID();
        const resendPayload = { session: payload.session, to: payload.to, text: payload.text };
        await messageStore.add({
          id: msgId,
          direction: "sent",
          status: "pending",
          session: payload.session,
          to: payload.to,
          text: payload.text,
          type: "text",
          timestamp: Date.now(),
          resendPayload,
        });

        try {
          await randomDelay(7, 20);

          await whatsapp.sendTypingIndicator({
            sessionId: payload.session,
            to: payload.to,
            duration: Math.min(5000, payload.text.length * 100),
            isGroup: payload.is_group,
          });

          const response = await whatsapp.sendText({
            sessionId: payload.session,
            to: payload.to,
            text: payload.text,
            isGroup: payload.is_group,
          });

          await messageStore.updateStatus(msgId, "success");
          return c.json({ data: response });
        } catch (err) {
          await messageStore.updateStatus(msgId, "failed", (err as Error).message);
          throw err;
        }
      }
    )
    /**
     *
     * POST /message/send-text
     *
     * @deprecated
     * This endpoint is deprecated, use POST /send-text instead
     */
    .get(
      "/send-text",
      createKeyMiddleware(),
      requestValidator("query", sendMessageSchema),
      async (c) => {
        const payload = c.req.valid("query");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          throw new HTTPException(400, {
            message: "Session does not exist",
          });
        }

        const msgId = randomUUID();
        const resendPayload = { session: payload.session, to: payload.to, text: payload.text };
        await messageStore.add({
          id: msgId,
          direction: "sent",
          status: "pending",
          session: payload.session,
          to: payload.to,
          text: payload.text,
          type: "text",
          timestamp: Date.now(),
          resendPayload,
        });

        try {
          await randomDelay(7, 20);

          const response = await whatsapp.sendText({
            sessionId: payload.session,
            to: payload.to,
            text: payload.text,
          });

          await messageStore.updateStatus(msgId, "success");
          return c.json({ data: response });
        } catch (err) {
          await messageStore.updateStatus(msgId, "failed", (err as Error).message);
          throw err;
        }
      }
    )
    /**
     *
     * POST /message/send-image
     *
     */
    .post(
      "/send-image",
      createKeyMiddleware(),
      requestValidator(
        "json",
        sendMessageSchema.merge(
          z.object({
            image_url: z.string(),
          })
        )
      ),
      async (c) => {
        const payload = c.req.valid("json");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          throw new HTTPException(400, {
            message: "Session does not exist",
          });
        }

        await randomDelay(7, 20);

        await whatsapp.sendTypingIndicator({
          sessionId: payload.session,
          to: payload.to,
          duration: Math.min(5000, payload.text.length * 100),
          isGroup: payload.is_group,
        });

        const response = await whatsapp.sendImage({
          sessionId: payload.session,
          to: payload.to,
          text: payload.text,
          media: payload.image_url,
          isGroup: payload.is_group,
        });

        return c.json({
          data: response,
        });
      }
    )
    /**
     *
     * POST /message/send-document
     *
     */
    .post(
      "/send-document",
      createKeyMiddleware(),
      requestValidator(
        "json",
        sendMessageSchema.merge(
          z.object({
            document_url: z.string(),
            document_name: z.string(),
          })
        )
      ),
      async (c) => {
        const payload = c.req.valid("json");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          throw new HTTPException(400, {
            message: "Session does not exist",
          });
        }

        await randomDelay(7, 20);

        await whatsapp.sendTypingIndicator({
          sessionId: payload.session,
          to: payload.to,
          duration: Math.min(5000, payload.text.length * 100),
          isGroup: payload.is_group,
        });

        const response = await whatsapp.sendDocument({
          sessionId: payload.session,
          to: payload.to,
          text: payload.text,
          media: payload.document_url,
          filename: payload.document_name,
          isGroup: payload.is_group,
        });

        return c.json({
          data: response,
        });
      }
    )
    /**
     *
     * POST /message/send-video
     *
     */
    .post(
      "/send-video",
      createKeyMiddleware(),
      requestValidator(
        "json",
        z.object({
          session: z.string(),
          to: z.string(),
          text: z.string().optional(),
          video_url: z.string(),
          is_group: z.boolean().optional(),
        })
      ),
      async (c) => {
        const payload = c.req.valid("json");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          throw new HTTPException(400, {
            message: "Session does not exist",
          });
        }

        await randomDelay(7, 20);

        await whatsapp.sendTypingIndicator({
          sessionId: payload.session,
          to: payload.to,
          duration: Math.min(5000, (payload.text || "").length * 100),
          isGroup: payload.is_group,
        });

        const response = await whatsapp.sendVideo({
          sessionId: payload.session,
          to: payload.to,
          text: payload.text || "",
          media: payload.video_url,
          isGroup: payload.is_group,
        });

        return c.json({
          data: response,
        });
      }
    )
    /**
     *
     * POST /message/send-sticker
     *
     */
    .post(
      "/send-sticker",
      createKeyMiddleware(),
      requestValidator(
        "json",
        sendMessageSchema.merge(
          z.object({
            image_url: z.string(),
          })
        )
      ),
      async (c) => {
        const payload = c.req.valid("json");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          throw new HTTPException(400, {
            message: "Session does not exist",
          });
        }

        await randomDelay(7, 20);

        const response = await whatsapp.sendSticker({
          sessionId: payload.session,
          to: payload.to,
          media: payload.image_url,
          isGroup: payload.is_group,
        });

        return c.json({
          data: response,
        });
      }
    );

  return app;
};
