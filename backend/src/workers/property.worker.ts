import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { CustomLogger } from "../logger/CustomLogger";
import { PropertyJobs } from "../jobs/property.jobs";

import { AppCodes } from "../errors/AppCodes";
import { geocodeAddress } from "../utils/geocoder";
import Property from "../models/property.model";

export const propertyWorker = new Worker(
  "propertyQueue",
  async (job) => {
    switch (job.name) {
      case PropertyJobs.GEOCODE_ADDRESS: {
        const { propertyId, addressString } = job.data;

        const geo = await geocodeAddress(addressString);

        await Property.findByIdAndUpdate(propertyId, {
          location: {
            type: "Point",
            coordinates: [geo.lng, geo.lat],
          },
          formattedAddress: geo.formattedAddress,
        });

        return;
      }

      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  },
  {
    connection: redisConnection,
  }
);


propertyWorker.on("completed", (job) => {
  CustomLogger.info("PropertyWorker", AppCodes.SUCCESS, {
    message: `Job completed: ${job.id} (${job.name})`,
  });
});

propertyWorker.on("failed", (job, err) => {
  CustomLogger.error("PropertyWorker", AppCodes.FAILED, {
    message: `Job failed: ${job?.id} (${job?.name})`,
    error: err.message,
  });
});

propertyWorker.on("active", (job) => {
  CustomLogger.info("PropertyWorker", AppCodes.ACTIVE, {
    message: `Processing job: ${job.id} (${job.name})`,
  });
});