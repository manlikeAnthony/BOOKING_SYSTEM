import { tryCatch, Worker } from "bullmq";
import { redisConnection } from "../config/redis";

import { verificationEmailHandler } from "../handlers/email/verificationEmail.handler";
import { resetPasswordHandler } from "../handlers/email/resetPassword.handler";

import {emailDLQ} from "../queues/email.dlq";
import { CustomLogger } from "../logger/CustomLogger";
import { CustomError } from "../errors/CustomError";
import { HttpCodes } from "../errors/HttpCodes";
import { AppCodes } from "../errors/AppCodes";

const handlerMap: Record<string, (data: any) => Promise<void>> = {
  "send-verification-email": verificationEmailHandler,
  "send-reset-password-email": resetPasswordHandler,
};

export const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const handler = handlerMap[job.name];

    if (!handler) {
     throw new Error(`No handler found for job: ${job.name}`);
    }
    try{
    await handler(job.data);
    }catch(err : any){
        await emailDLQ.add(job.name ,
             {...job.data,
                failedReason : err.message,
                originalJobId : job.id,
                failedAt : new Date().toISOString(),
             },
        )
        throw err; // rethrow to let BullMQ mark the job as failed
    }
  },
  { connection: redisConnection },
);

emailWorker.on("completed", (job) => {
  CustomLogger.info("EmailWorker" , AppCodes.SUCCESS, {message : `Job completed: ${job.id} with name: ${job.name}`});
});

emailWorker.on("failed", (job, err) => {
  CustomLogger.error("EmailWorker" , AppCodes.EXTERNAL_SERVICE_FAILURE, {message : `Job failed: ${job?.id} with name: ${job?.name}`, error: err.message});
});