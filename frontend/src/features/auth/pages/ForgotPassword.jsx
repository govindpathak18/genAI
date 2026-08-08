import React, { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../../../components/LoadingSpinner'
import heroIllustration from '../../../assets/hero-illustration.png'
import '../auth.form.scss'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [password, setPassword] = useState('')
    const [step, setStep] = useState('email')
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const { loading, handleForgotPassword, handleResetPassword } = useAuth()

    const handleSendCode = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        setSuccessMessage('')

        try {
            const data = await handleForgotPassword({ email })
            if (data?.message) {
                setSuccessMessage(data.message)
                setStep('reset')
            }
        } catch (error) {
            setErrorMessage(error?.message || 'Unable to send reset code')
        }
    }

    const handleReset = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        setSuccessMessage('')

        try {
            const data = await handleResetPassword({ email, otp, password })
            if (data?.message) {
                setSuccessMessage(data.message)
            }
        } catch (error) {
            setErrorMessage(error?.message || 'Unable to reset password')
        }
    }

    if (loading) {
        return <LoadingSpinner label="Preparing password reset" />
    }

    return (
        <main className="auth-page">
            <div className="auth-panel auth-panel--image">
                <img src={heroIllustration} alt="Password recovery" />
            </div>

            <div className="auth-panel auth-panel--form">
                <div className="auth-form-box">
                    <h1>{step === 'email' ? 'Forgot Password' : 'Reset Password'}</h1>
                    <p className="auth-page__subtitle">
                        {step === 'email'
                            ? 'Enter your email and we will send a verification code to continue.'
                            : 'Enter the code we sent and choose a new password.'}
                    </p>

                    {step === 'email' ? (
                        <form onSubmit={handleSendCode}>
                            <div className="input-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                />
                            </div>
                            {errorMessage && <p className="auth-message auth-message--error">{errorMessage}</p>}
                            {successMessage && <p className="auth-message auth-message--success">{successMessage}</p>}
                            <button className="button primary-button">Send Reset Code</button>
                        </form>
                    ) : (
                        <form onSubmit={handleReset}>
                            <div className="input-group">
                                <label htmlFor="otp">Verification Code</label>
                                <input
                                    onChange={(e) => setOtp(e.target.value)}
                                    value={otp}
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    placeholder="Enter 6-digit code"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">New Password</label>
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter new password"
                                />
                            </div>
                            {errorMessage && <p className="auth-message auth-message--error">{errorMessage}</p>}
                            {successMessage && <p className="auth-message auth-message--success">{successMessage}</p>}
                            <button className="button primary-button">Reset Password</button>
                        </form>
                    )}

                    <p className="auth-page__footer">
                        <Link to="/login">Back to Login</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}

export default ForgotPassword
