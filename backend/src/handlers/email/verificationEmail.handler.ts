import {sendVerificationEmail} from "../../utils/email/sendVerificationEmail";
import type {VerificationEmailJob} from "../../types/email";

export const verificationEmailHandler = async (job : VerificationEmailJob) => {
    await sendVerificationEmail({
        name : job.name,
        email : job.email,
        verificationToken : job.verificationToken,
        origin : job.origin
    })
}
