import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail({ email, otp }) {
    try {
        const from =
            process.env.EMAIL_FROM || "QuickHire <onboarding@resend.dev>";

        const { data, error } = await resend.emails.send({
            from,
            to: [email],
            subject: "QuickHire - Verify your email address",
            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 24px;
                ">
                    <h2 style="margin-bottom: 8px;">
                        Welcome to QuickHire
                    </h2>

                    <p>
                        Thank you for registering with <strong>QuickHire</strong>.
                    </p>

                    <p>
                        Your email verification code is:
                    </p>

                    <h1 style="
                        letter-spacing: 6px;
                        font-size: 32px;
                        margin: 20px 0;
                    ">
                        ${otp}
                    </h1>

                    <p>
                        This code will expire in <strong>10 minutes</strong>.
                    </p>

                    <p>
                        Please don't share this OTP with anyone.
                    </p>

                    <p style="margin-top: 30px;">
                        Best regards,<br>
                        <strong>QuickHire Team</strong>
                    </p>
                </div>
            `
        });

        if (error) {
            console.error("[QuickHire Email] Resend error:", error);
            throw new Error(error.message || "Failed to send OTP email");
        }

        console.log(
            "[QuickHire Email] OTP sent successfully:",
            data?.id
        );

        return {
            success: true,
            id: data?.id
        };

    } catch (error) {
        console.error("[QuickHire Email] Failed to send OTP:", error);
        throw error;
    }
}