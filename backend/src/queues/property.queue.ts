import {Queue} from "bullmq";
import { redisConnection } from "../config/redis";

export const propertyQueue = new Queue("propertyQueue", {
  connection: redisConnection,
});