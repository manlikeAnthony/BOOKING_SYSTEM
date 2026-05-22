import {redisConnection} from '../config/redis';
import {Queue} from 'bullmq';

export const emailQueue = new Queue("emailQueue" , {
    connection: redisConnection
})