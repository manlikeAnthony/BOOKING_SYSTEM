import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const emailDLQ = new Queue("emailDLQ", {
  connection: redisConnection,
});