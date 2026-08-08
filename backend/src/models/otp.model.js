import mongoose from "mongoose"

const otpVerificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    otp: {
        type: String,
        required: [true, "OTP is required"]
    },
    purpose: {
        type: String,
        enum: ["register", "reset-password"],
        default: "register"
    },
    verified: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

const otpModel = mongoose.model("OtpVerification", otpVerificationSchema)

export default otpModel
