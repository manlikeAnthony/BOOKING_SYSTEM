import { RedisStore } from "rate-limit-redis";
import { rateLimit } from "express-rate-limit";

import { redis } from "../config/redis";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<any>,
  }),
});
