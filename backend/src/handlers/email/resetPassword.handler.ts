import type { ResetPasswordJob } from "../../types/email";
import { sendResetPasswordEmail } from "../../utils/email";

export const resetPasswordHandler = async(job : ResetPasswordJob) =>{
    await sendResetPasswordEmail({
        name : job.name,
        email : job.email,
        token : job.token,
        origin : job.origin
    })
}