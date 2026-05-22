import nodemailer from "nodemailer";
import nodemailerConfig from "../../config/nodemailer";

export const transporter = nodemailer.createTransport(nodemailerConfig);