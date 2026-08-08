import nodemailer from "nodemailer";

const createTransporter = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
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
    const from = process.env.EMAIL_FROM || "no-reply@genaiapp.com";

    if (!transporter) {
        console.log(`[OTP] Email fallback for ${email}: ${otp}`);
        return { success: true, fallback: true };
    }

    await transporter.sendMail({
        from,
        to: email,
        subject: "Verify your email address",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h2>Email Verification</h2>
                <p>Your verification code is:</p>
                <p>Don't share this otp with anyone.</p>
                <h1 style="letter-spacing: 4px;">${otp}</h1>
                <p>This code will expire in 10 minutes.</p>
            </div>
        `
    });

    return { success: true };
}
