import crypto from "crypto";

export const generatePaystackReference = (): string => {
    return `PAY-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}