import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import '../style/home.scss'
import { useInterview } from '../hooks/useInterview.js'
import LoadingSpinner from '../../../components/LoadingSpinner'

const getScoreClass = (score) => {
    if (score >= 80) return 'score--high'
    if (score >= 60) return 'score--mid'
    return 'score--low'
}

const Reports = () => {
    const {
        reports,
        getReports,
        deleteReport,
        loading
    } = useInterview()

    const navigate = useNavigate()

    const handleDelete = async (event, reportId) => {
        event.stopPropagation()

        const confirmed = window.confirm(
            'Are you sure you want to delete this interview report?'
        )

        if (!confirmed) return

        const success = await deleteReport(reportId)

        if (!success) {
            alert('Unable to delete the report. Please try again.')
        }
    }

    useEffect(() => {
        getReports()
    }, [])

    if (loading) {
        return <LoadingSpinner label="Loading reports" />
    }

    return (
        <div className="dashboard-page">

            <header className="dashboard-header">
                <div className="container">

                    <Link
                        to="/dashboard"
                        className="dashboard-brand"
                    >
                        <div className="brand-mark">
                            Q
                        </div>

                        <div>
                            <h1>QuickHire</h1>
                            <p>Interview intelligence</p>
                        </div>
                    </Link>

                    <nav className="dashboard-header__nav">

                        <Link
                            to="/dashboard"
                            className="dashboard-header__nav-item"
                        >
                            Dashboard
                        </Link>

                        <Link
                            to="/getAllReports"
                            className="dashboard-header__nav-item active"
                        >
                            Reports
                        </Link>
                        

                    </nav>

                </div>
            </header>

            <main>

                <section className="reports-section reports-page-section">

                    <div className="reports-header">

                        <div>

                            <span className="section-eyebrow">
                                Interview history
                            </span>

                            <h2>
                                All Interview Reports
                            </h2>

                            <p className="reports-page-description">
                                Review your previous interview analysis,
                                match scores, and preparation plans.
                            </p>

                        </div>

                        <Link
                            to="/dashboard"
                            className="reports-create-button"
                        >
                            <span>+</span>
                            New Interview
                        </Link>

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
                                className="reports-create-button"
                            >
                                Generate Your First Report
                            </Link>

                        </div>

                    ) : (

                        <div className="reports-list">

                            {reports.map((report) => {

                                const score =
                                    Number(report.matchScore) || 0

                                return (

                                    <div
                                        key={report._id}
                                        className="report-card"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() =>
                                            navigate(
                                                `/interview/${report._id}`
                                            )
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === 'Enter' ||
                                                event.key === ' '
                                            ) {
                                                navigate(
                                                    `/interview/${report._id}`
                                                )
                                            }
                                        }}
                                    >

                                        <div className="report-card__top">

                                            <span className="report-badge">
                                                Finished
                                            </span>

                                            <div className="report-card__top-right">

                                                <button
                                                    type="button"
                                                    className="report-delete-button"
                                                    onClick={(event) =>
                                                        handleDelete(
                                                            event,
                                                            report._id
                                                        )
                                                    }
                                                    aria-label="Delete report"
                                                    title="Delete report"
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        aria-hidden="true"
                                                    >
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6l-1 14H6L5 6" />
                                                        <path d="M10 11v5" />
                                                        <path d="M14 11v5" />
                                                        <path d="M9 6V4h6v2" />
                                                    </svg>
                                                </button>

                                                <span
                                                    className={`report-score ${getScoreClass(score)}`}
                                                >
                                                    {score}%
                                                </span>

                                            </div>

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

                                    </div>
                                )
                            })}

                        </div>

                    )}

                </section>

            </main>

        </div>
    )
}

export default Reports