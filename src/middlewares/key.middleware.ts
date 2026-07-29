import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import { env } from "../env";
import { getCookie, getSignedCookie } from "hono/cookie";

import { verify } from "hono/jwt";

export const createKeyMiddleware = () =>
  createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");
    const keyParam = c.req.query().key || c.req.header().key;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (!token) throw new HTTPException(401, { message: "Invalid token format" });
      try {
        const secret = (env.JWT_SECRET || env.KEY || "mimach-secret") as string;
        const payload = await verify(token, secret);
        if (payload.sessionId) {
          c.set("jwtSessionId", payload.sessionId);
        }
        return await next();
      } catch (err) {
        throw new HTTPException(401, { message: "Invalid or expired token" });
      }
    }

    const authorization = keyParam || authHeader;
    if (env.KEY && (!authorization || authorization != env.KEY)) {
      throw new HTTPException(401, {
        message: "Unauthorized",
      });
    }

    await next();
  });
export const createDashboardMiddleware = () =>
  createMiddleware(async (c, next) => {
    const authorization = await getSignedCookie(
      c,
      "14e9f106-9860-4219-ae63-d34e4f5127bd",
      "key"
    );
    if (env.KEY && (!authorization || authorization !== env.KEY)) {
      return c.redirect("/auth/login");
    }

    await next();
  });
