import Redis from "ioredis"

export const redisConnection = {
    url: process.env.REDIS_URL,
}

export const redis = new Redis(process.env.REDIS_URL!)