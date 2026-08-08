import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe, verifyOtp, resendOtp, forgotPassword, resetPassword } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            return data
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async ({ email, otp }) => {
        setLoading(true)
        try {
            const data = await verifyOtp({ email, otp })
            setUser(data.user)
            return data
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleResendOtp = async ({ email }) => {
        setLoading(true)
        try {
            return await resendOtp({ email })
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async ({ email }) => {
        setLoading(true)
        try {
            return await forgotPassword({ email })
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async ({ email, otp, password }) => {
        setLoading(true)
        try {
            return await resetPassword({ email, otp, password })
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            try {

                const data = await getMe()
                setUser(data.user)
            } catch (err) { } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleVerifyOtp, handleResendOtp, handleForgotPassword, handleResetPassword, handleLogin, handleLogout }
}