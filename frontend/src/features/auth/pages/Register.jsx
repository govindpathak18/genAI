import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import heroIllustration from '../../../assets/hero-illustration.png'
import '../auth.form.scss'
import LoadingSpinner from '../../../components/LoadingSpinner'

const Register = () => {
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [verificationEmail, setVerificationEmail] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const {
        loading,
        handleRegister,
        handleVerifyOtp,
        handleResendOtp
    } = useAuth()

    const sendRegistration = async () => {
        if (!username.trim() || !email.trim() || !password.trim()) {
            setErrorMessage(
                'Please enter username, email, and password.'
            )
            return
        }

        try {
            setErrorMessage('')
            setSuccessMessage('')

            await handleRegister({
                username,
                email,
                password
            })

            setVerificationEmail(email)
            setOtpSent(true)

            setSuccessMessage(
                'Verification OTP has been sent to your email.'
            )
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message ||
                error?.message ||
                'Registration failed.'
            )
        }
    }

    const verifyOtpCode = async () => {
        if (!otp.trim()) {
            setErrorMessage(
                'Please enter the OTP sent to your email.'
            )
            return
        }

        try {
            setErrorMessage('')
            setSuccessMessage('')

            await handleVerifyOtp({
                email: verificationEmail || email,
                otp
            })

            navigate('/dashboard')
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message ||
                error?.message ||
                'Verification failed.'
            )
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (otpSent) {
            await verifyOtpCode()
        } else {
            await sendRegistration()
        }
    }

    const handleResend = async () => {
        setErrorMessage('')
        setSuccessMessage('')

        try {
            await handleResendOtp({
                email: verificationEmail || email
            })

            setSuccessMessage(
                'A new OTP has been sent to your email.'
            )
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message ||
                error?.message ||
                'Unable to resend OTP.'
            )
        }
    }

    if (loading) {
        return <LoadingSpinner label="Setting up your account" />
    }

    return (
        <main className="auth-page">
            <div className="auth-panel auth-panel--image">
                <img
                    src={heroIllustration}
                    alt="Career success"
                />
            </div>

            <div className="auth-panel auth-panel--form">
                <div className="auth-form-box">
                    <h1>Register</h1>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="username">
                                Username
                            </label>

                            <input
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                value={username}
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Enter username"
                                disabled={otpSent}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                value={email}
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter email address"
                                disabled={otpSent}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="password-input-wrapper">
                                <input
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    value={password}
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="password"
                                    name="password"
                                    placeholder="Enter password"
                                    disabled={otpSent}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (prev) => !prev
                                        )
                                    }
                                    disabled={otpSent}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="3"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M3 3l18 18" />
                                            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                            <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c7 0 10 8 10 8a17.4 17.4 0 0 1-3 4.1" />
                                            <path d="M6.6 6.6C3.6 8.6 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4.1-.9" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {errorMessage && (
                            <p className="auth-message auth-message--error">
                                {errorMessage}
                            </p>
                        )}

                        {successMessage && (
                            <p className="auth-message auth-message--success">
                                {successMessage}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="button primary-button"
                        >
                            {otpSent
                                ? 'Verify & Complete'
                                : 'Send Verification Code'}
                        </button>
                    </form>

                    {otpSent && (
                        <div className="otp-modal">
                            <div className="otp-modal__content">
                                <h2>
                                    Verify Your Account
                                </h2>

                                <p>
                                    Verification OTP has been sent
                                    to{' '}
                                    <strong>
                                        {verificationEmail}
                                    </strong>.
                                </p>

                                <div className="input-group">
                                    <label htmlFor="otp">
                                        OTP Code
                                    </label>

                                    <input
                                        onChange={(e) =>
                                            setOtp(e.target.value)
                                        }
                                        value={otp}
                                        type="text"
                                        id="otp"
                                        name="otp"
                                        placeholder="Enter 6-digit OTP"
                                    />
                                </div>

                                <div className="otp-modal__actions">
                                    <button
                                        type="button"
                                        className="button primary-button"
                                        onClick={verifyOtpCode}
                                    >
                                        Verify & Complete
                                    </button>

                                    <button
                                        type="button"
                                        className="link-button"
                                        onClick={handleResend}
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <p className="auth-page__footer">
                        Already have an account?{" "}
                        <Link to="/login">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}

export default Register