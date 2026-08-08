import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import '../style/home.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { getMe as apiGetMe } from '../../auth/services/auth.api.js'
import { useEffect } from 'react'
import LoadingSpinner from '../../../components/LoadingSpinner'

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const { handleLogout, user } = useAuth()

    const [jobDescription, setJobDescription] = useState('')
    const [selfDescription, setSelfDescription] = useState('')
    const [resumeName, setResumeName] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [profileOpen, setProfileOpen] = React.useState(false)
    const [profileInfo, setProfileInfo] = React.useState(null)

    const resumeInputRef = useRef()
    const profileRef = useRef()
    const popoverRef = useRef()

    const navigate = useNavigate()

    const handleResumeChange = (event) => {
        const file = event.target.files?.[0]
        setResumeName(file?.name || '')
        setErrorMessage('')
    }

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0]

        if (
            !jobDescription.trim() ||
            !selfDescription.trim() ||
            !resumeFile
        ) {
            setErrorMessage(
                'Please complete all required fields before generating a report.'
            )
            return
        }

        setErrorMessage('')
        setIsGenerating(true)

        try {
            const data = await generateReport({
                jobDescription,
                selfDescription,
                resumeFile
            })

            if (data?._id) {
                navigate(`/interview/${data._id}`)
            } else {
                setErrorMessage('Failed to generate report.')
            }
        } catch (error) {
            console.error(error)
            setErrorMessage(
                error?.message || 'Failed to generate report.'
            )
        } finally {
            setIsGenerating(false)
        }
    }

    const handleLogoutClick = async () => {
        await handleLogout()
        navigate('/')
    }

    const handleProfileClick = async () => {
        try {
            const data = await apiGetMe()
            setProfileInfo(data?.user || null)
            setProfileOpen((open) => !open)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        const handleDocumentClick = (event) => {
            if (!profileOpen) return

            if (
                popoverRef.current &&
                popoverRef.current.contains(event.target)
            ) {
                return
            }

            if (
                profileRef.current &&
                profileRef.current.contains(event.target)
            ) {
                return
            }

            setProfileOpen(false)
        }

        document.addEventListener('click', handleDocumentClick)

        return () => {
            document.removeEventListener(
                'click',
                handleDocumentClick
            )
        }
    }, [profileOpen])

    const canGenerate =
        Boolean(jobDescription.trim()) &&
        Boolean(selfDescription.trim()) &&
        Boolean(resumeName) &&
        !isGenerating

    if (loading && !isGenerating) {
        return <LoadingSpinner label="Loading dashboard" />
    }

    return (
        <div className="dashboard-page">

            <header className="dashboard-header">
                <div className="container">

                    <Link
                        to="/dashboard"
                        className="dashboard-brand"
                    >
                        <div className="brand-mark">Q</div>

                        <div>
                            <h1>QuickHire</h1>
                            <p>Interview intelligence</p>
                        </div>
                    </Link>

                    <nav className="dashboard-header__nav">
                        <Link
                            to="/dashboard"
                            className="dashboard-header__nav-item active"
                        >
                            Dashboard
                        </Link>

                        <Link
                            to="/getAllReports"
                            className="dashboard-header__nav-item"
                        >
                            Reports
                        </Link>
                    </nav>

                    <div
                        className="dashboard-header__actions"
                        style={{ position: 'relative' }}
                    >
                        <button
                            type="button"
                            className="button secondary-button"
                            onClick={handleLogoutClick}
                        >
                            <svg
                                className="logout-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M10 17l5-5-5-5" />
                                <path d="M15 12H3" />
                                <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                            </svg>

                            Logout
                        </button>
                        <button
                            ref={profileRef}
                            type="button"
                            className="button secondary-button profile-button"
                            onClick={handleProfileClick}
                        >
                            <svg
                                className="profile-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                            </svg>

                            Profile
                        </button>

                        {profileOpen && (
                            <div
                                ref={popoverRef}
                                className="profile-popover"
                            >
                                <div className="profile-popover-row">
                                    <strong>
                                        {profileInfo?.username || '—'}
                                    </strong>
                                </div>

                                <div className="profile-popover-row">
                                    {profileInfo?.email || '—'}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </header>

            <main>

                <section className="dashboard-content">

                    <div className="welcome-block">
                        <h2>
                            Welcome back,{' '}
                            {user?.username || 'there'}
                            👋
                        </h2>

                        <p>
                            Ready to land your dream role?
                            Let's optimize your profile for success.
                        </p>
                    </div>

                    <div className="top-cards">

                        <div className="card upload-card">

                            <label htmlFor="resumeUpload">
                                Upload Resume
                            </label>

                            <label
                                className="upload-box"
                                htmlFor="resumeUpload"
                            >
                                <input
                                    ref={resumeInputRef}
                                    type="file"
                                    id="resumeUpload"
                                    accept=".pdf,.docx"
                                    onChange={handleResumeChange}
                                />

                                <div className="upload-placeholder">

                                    {resumeName ? (
                                        <>
                                            <strong>
                                                {resumeName}
                                            </strong>

                                            <div>
                                                Click to replace file
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <strong>
                                                Drag and drop your resume
                                            </strong>

                                            <div>
                                                PDF or DOCX · Max 5MB
                                            </div>
                                        </>
                                    )}

                                </div>
                            </label>

                        </div>

                        <div className="card">

                            <label htmlFor="jobDescription">
                                Target Job Description
                            </label>

                            <div className="textarea">
                                <textarea
                                    id="jobDescription"
                                    value={jobDescription}
                                    onChange={(event) =>
                                        setJobDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Paste the job requirements here..."
                                />
                            </div>

                        </div>

                        <div className="card">

                            <label htmlFor="selfDescription">
                                Self Description
                            </label>

                            <div className="textarea">
                                <textarea
                                    id="selfDescription"
                                    value={selfDescription}
                                    onChange={(event) =>
                                        setSelfDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="List key achievements or additional technical skills..."
                                />
                            </div>

                        </div>

                    </div>

                    <div className="generate-row">

                        <div
                            className={`generate-shell ${isGenerating ? 'is-generating' : ''
                                }`}
                        >

                            <span className="generate-orb orb-one" />
                            <span className="generate-orb orb-two" />

                            <button
                                type="button"
                                className="generate-button"
                                onClick={handleGenerateReport}
                                disabled={!canGenerate}
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="generate-spinner" />
                                        <span>
                                            Generating your report...
                                        </span>
                                    </>
                                ) : (
                                    <span>
                                        Generate AI Interview Report
                                    </span>
                                )}
                            </button>

                        </div>

                    </div>

                    {errorMessage && (
                        <div className="dashboard-error-banner">
                            {errorMessage}, Retry
                        </div>
                    )}

                </section>

                <section className="reports-section">

                    <div className="reports-header">

                        <div>
                            <h2>Past Interview Reports</h2>
                        </div>

                        <div className="reports-header__right">
                            <span>
                                Click any report to view the full
                                interview details.
                            </span>

                            <Link
                                to="/getAllReports"
                                className="reports-view-all"
                            >
                                View All →
                            </Link>
                        </div>

                    </div>

                    {reports.length === 0 ? (
                        <div className="reports-empty">

                            <div className="reports-empty__icon">
                                Q
                            </div>

                            <h3>
                                No interview reports yet
                            </h3>

                            <p>
                                Generate your first AI-powered
                                interview report to see your
                                preparation insights here.
                            </p>

                            <Link
                                to="/dashboard"
                                className="reports-view-all"
                            >
                                Generate your first report →
                            </Link>

                        </div>
                    ) : (

                        <div className="reports-list">

                            {reports.map((report) => {

                                const score =
                                    Number(report.matchScore) || 0

                                const scoreClass =
                                    score >= 80
                                        ? 'score--high'
                                        : score >= 60
                                            ? 'score--mid'
                                            : 'score--low'

                                return (
                                    <button
                                        key={report._id}
                                        type="button"
                                        className="report-card"
                                        onClick={() =>
                                            navigate(
                                                `/interview/${report._id}`
                                            )
                                        }
                                    >

                                        <div className="report-card__top">

                                            <span className="report-badge">
                                                Finished
                                            </span>

                                            <span
                                                className={`report-score ${scoreClass}`}
                                            >
                                                {score}%
                                            </span>

                                        </div>

                                        <div className="report-card__content">

                                            <span className="section-eyebrow">
                                                Interview Report
                                            </span>

                                            <strong>
                                                {report.title ||
                                                    'Untitled Position'}
                                            </strong>

                                            {report.company && (
                                                <p className="report-sub">
                                                    {report.company}
                                                </p>
                                            )}

                                        </div>

                                        <div className="report-card__bottom">

                                            <span className="report-date">
                                                {new Date(
                                                    report.createdAt
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    }
                                                )}
                                            </span>

                                            <span className="report-card__action">
                                                View report
                                                <span>→</span>
                                            </span>

                                        </div>

                                    </button>
                                )
                            })}

                        </div>

                    )}

                </section>

            </main>

            <footer className="site-footer">

                <div className="container">

                    <div className="footer-left">
                        © 2026 QuickHire. All rights reserved.
                    </div>

                    <div className="footer-right">
                        <a href="#privacy">
                            Privacy Policy
                        </a>

                        <a href="#terms">
                            Terms of Service
                        </a>

                        <a href="#help">
                            Help Center
                        </a>
                    </div>

                </div>

            </footer>

        </div>
    )
}

export default Home