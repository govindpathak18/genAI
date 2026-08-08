import userModel from "../models/user.model.js"
import otpModel from "../models/otp.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import tokenBlacklistModel from "../models/blacklist.model.js"
import { sendOtpEmail } from "../services/email.service.js"

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none"
}

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body
        const trimmedUsername = typeof username === "string" ? username.trim() : ""
        const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
        const trimmedPassword = typeof password === "string" ? password.trim() : ""

        if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }

        const existingUser = await userModel.findOne({
            $or: [{ username: trimmedUsername }, { email: trimmedEmail }]
        })

        if (existingUser) {
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await otpModel.deleteMany({ email: trimmedEmail })

        await otpModel.create({
            email: trimmedEmail,
            username: trimmedUsername,
            password: await bcrypt.hash(trimmedPassword, 10),
            otp,
            expiresAt
        })

        await sendOtpEmail({ email: trimmedEmail, otp })

        res.status(200).json({
            message: "Verification code sent to your email.",
            email: trimmedEmail
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong while registering user."
        })
    }
}

async function verifyOtpController(req, res) {
    try {
        const { email, otp } = req.body
        const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
        const trimmedOtp = typeof otp === "string" ? otp.trim() : ""

        if (!trimmedEmail || !trimmedOtp) {
            return res.status(400).json({
                message: "Please provide email and otp"
            })
        }

        const otpEntry = await otpModel.findOne({ email: trimmedEmail, otp: trimmedOtp })

        if (!otpEntry) {
            return res.status(400).json({
                message: "Invalid verification code"
            })
        }

        if (new Date(otpEntry.expiresAt) < new Date()) {
            await otpModel.deleteMany({ email: trimmedEmail })
            return res.status(400).json({
                message: "Verification code has expired"
            })
        }

        const user = await userModel.create({
            username: otpEntry.username,
            email: trimmedEmail,
            password: otpEntry.password
        })

        await otpModel.deleteMany({ email: trimmedEmail })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, cookieOptions)

        res.status(201).json({
            message: "Email verified successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong while verifying OTP."
        })
    }
}

async function resendOtpController(req, res) {
    try {
        const { email } = req.body
        const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""

        if (!trimmedEmail) {
            return res.status(400).json({
                message: "Please provide email"
            })
        }

        const otpEntry = await otpModel.findOne({ email: trimmedEmail })

        if (!otpEntry) {
            return res.status(404).json({
                message: "No pending verification found for this email"
            })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        otpEntry.otp = otp
        otpEntry.expiresAt = expiresAt
        await otpEntry.save()

        await sendOtpEmail({ email: trimmedEmail, otp })

        res.status(200).json({
            message: "Verification code resent successfully.",
            email: trimmedEmail
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong while resending OTP."
        })
    }
}

async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body
        const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""

        if (!trimmedEmail) {
            return res.status(400).json({
                message: "Please provide email"
            })
        }

        const user = await userModel.findOne({ email: trimmedEmail })

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email"
            })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await otpModel.deleteMany({ email: trimmedEmail })

        await otpModel.create({
            email: trimmedEmail,
            username: user.username,
            password: user.password,
            otp,
            expiresAt,
            purpose: "reset-password"
        })

        await sendOtpEmail({ email: trimmedEmail, otp })

        res.status(200).json({
            message: "Password reset code sent to your email.",
            email: trimmedEmail
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong while sending reset code."
        })
    }
}

async function resetPasswordController(req, res) {
    try {
        const { email, otp, password } = req.body
        const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
        const trimmedOtp = typeof otp === "string" ? otp.trim() : ""
        const trimmedPassword = typeof password === "string" ? password.trim() : ""

        if (!trimmedEmail || !trimmedOtp || !trimmedPassword) {
            return res.status(400).json({
                message: "Please provide email, otp and password"
            })
        }

        const otpEntry = await otpModel.findOne({ email: trimmedEmail, otp: trimmedOtp, purpose: "reset-password" })

        if (!otpEntry) {
            return res.status(400).json({
                message: "Invalid reset code"
            })
        }

        if (new Date(otpEntry.expiresAt) < new Date()) {
            await otpModel.deleteMany({ email: trimmedEmail })
            return res.status(400).json({
                message: "Reset code has expired"
            })
        }

        const hashedPassword = await bcrypt.hash(trimmedPassword, 10)

        await userModel.findOneAndUpdate(
            { email: trimmedEmail },
            { password: hashedPassword }
        )

        await otpModel.deleteMany({ email: trimmedEmail })

        res.status(200).json({
            message: "Password reset successfully"
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong while resetting password."
        })
    }
}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body
        const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
        const trimmedPassword = typeof password === "string" ? password.trim() : ""

        const user = await userModel.findOne({ email: trimmedEmail })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, cookieOptions)
        
        res.status(200).json({
            message: "User loggedIn successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong while logging in."
        })
    }
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies?.token

        if (token) {
            try {
                await tokenBlacklistModel.create({ token })
            } catch (error) {
                console.error(error)
            }
        }

        res.clearCookie("token", cookieOptions)

        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong while logging out."
        })
    }
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong while fetching user details."
        })
    }
}



export default {
    registerUserController,
    verifyOtpController,
    resendOtpController,
    forgotPasswordController,
    resetPasswordController,
    loginUserController,
    logoutUserController,
    getMeController
}