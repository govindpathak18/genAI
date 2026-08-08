// to interact with backend api's
import axios from "axios"

const api = axios.create({ // axios instance
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true
})

export const getApiErrorMessage = (error) => {
    const message = error?.response?.data?.message || error?.message || "Something went wrong."
    return typeof message === "string" ? message : "Something went wrong."
}

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export async function verifyOtp({ email, otp }) {
    try {
        const response = await api.post('/api/auth/verify-otp', {
            email, otp
        })

        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export async function resendOtp({ email }) {
    try {
        const response = await api.post('/api/auth/resend-otp', { email })
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export async function forgotPassword({ email }) {
    try {
        const response = await api.post('/api/auth/forgot-password', { email })
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export async function resetPassword({ email, otp, password }) {
    try {
        const response = await api.post('/api/auth/reset-password', { email, otp, password })
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })

        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}