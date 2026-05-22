import dotenv from "dotenv";
dotenv.config();

import "./email.worker";
import "./property.worker";

dotenv.config();
console.log("Workers started...");