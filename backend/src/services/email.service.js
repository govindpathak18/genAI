import nodemailer from "nodemailer";

const createTransporter = () => {
    if (
        !process.env.SMTP_HOST ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASS
    ) {
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

export async function sendOtpEmail({ email, otp }) {
    const transporter = createTransporter();

    const from =
        process.env.EMAIL_FROM ||
        "QuickHire <your-email@example.com>";

    if (!transporter) {
        console.log(`[OTP] Email fallback for ${email}: ${otp}`);
        return { success: true, fallback: true };
    }

    await transporter.sendMail({
        from,
        to: email,
        subject: "QuickHire - Verify your email address",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Welcome to QuickHire</h2>

                <p>Your email verification code is:</p>

                <h1 style="letter-spacing: 6px;">
                    ${otp}
                </h1>

                <p>
                    This code will expire in <strong>10 minutes</strong>.
                </p>

                <p>
                    Don't share this OTP with anyone.
                </p>

                <p>
                    Best regards,<br>
                    <strong>QuickHire Team</strong>
                </p>
            </div>
        `
    });

    return { success: true };
}