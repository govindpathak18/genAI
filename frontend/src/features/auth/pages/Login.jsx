import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import heroIllustration from '../../../assets/hero-illustration.png'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../../../components/LoadingSpinner'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate('/dashboard')
    }

    if (loading) {
        return <LoadingSpinner label="Signing you in" />
    }

    return (
        <main className="auth-page">
            <div className="auth-panel auth-panel--image">
                <img src={heroIllustration} alt="Career success" />
            </div>

            <div className="auth-panel auth-panel--form">
                <div className="auth-form-box">
                    <h1>Login</h1>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>

                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>

                            <div className="password-input-wrapper">
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="Enter password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
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
                                            <circle cx="12" cy="12" r="3" />
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

                        <button
                            type="submit"
                            className="button primary-button"
                        >
                            Login
                        </button>

                        <div className="auth-form-meta">
                            <Link to="/forgot-password">
                                Forgot password?
                            </Link>
                        </div>
                    </form>

                    <p className="auth-page__footer">
                        Don't have an account?{" "}
                        <Link to="/register">Register</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}

export default Login