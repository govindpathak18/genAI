import React, { useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { Link, useLocation, useParams } from 'react-router'
import LoadingSpinner from '../../../components/LoadingSpinner'

const QuestionCard = ({ item }) => (
    <div className='question-card'>
        <p className='question-card__title'>&ldquo;{item?.question || 'No question captured.'}&rdquo;</p>
        <div className='question-card__focus'>
            <span className='question-card__focus-label'>Focus area</span>
            <p>{item?.intention || item?.answer || 'No focus area captured for this question.'}</p>
        </div>
    </div>
)

const RoadmapItem = ({ day, isLast }) => (
    <div className={`roadmap-step ${isLast ? 'roadmap-step--pending' : 'roadmap-step--done'}`}>
        <div className='roadmap-step__rail'>
            <span className='roadmap-step__dot' />
            {!isLast ? <span className='roadmap-step__line' /> : null}
        </div>
        <div className='roadmap-step__body'>
            <span className='roadmap-step__day'>Day {day.day}: {(day.focus || '').toString().toUpperCase()}</span>
            <strong className='roadmap-step__heading'>{day.headline || day.title || day.focus}</strong>
            <p className='roadmap-step__desc'>{(day.tasks || []).join(' ')}</p>
        </div>
    </div>
)

const scorePercentage = (severity) => {
    if (severity === 'high') return 92
    if (severity === 'medium') return 78
    return 45
}

const buildInsightHighlights = (skillGaps) => {
    if (!skillGaps.length) return []
    const sorted = [...skillGaps].sort((a, b) => scorePercentage(b.severity) - scorePercentage(a.severity))
    const strong = sorted.slice(0, 2).map((gap) => ({ icon: '⏱', label: `High ${gap.skill} Score`, tone: 'default' }))
    const weakest = sorted[sorted.length - 1]
    const warning = weakest ? [{ icon: '⚠', label: `Refine ${weakest.skill}`, tone: 'warning' }] : []
    return [...strong, ...warning]
}

const Interview = () => {
    const { report, getReportById, loading, getResumePdf, downloadResumePdf, resumePdfReady, resumePdfUrl } = useInterview()
    const { interviewId } = useParams()
    const location = useLocation()
    const [isGeneratingResume, setIsGeneratingResume] = React.useState(false)
    const [resumeMessage, setResumeMessage] = React.useState('')

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId])

    if (loading || !report) {
        return <LoadingSpinner label="Loading interview report" />
    }

    const behavioralQuestions = Array.isArray(report.behavioralQuestions) ? report.behavioralQuestions : []
    const technicalQuestions = Array.isArray(report.technicalQuestions) ? report.technicalQuestions : []
    const skillGaps = Array.isArray(report.skillGaps) ? report.skillGaps : []
    const preparationPlan = Array.isArray(report.preparationPlan) ? report.preparationPlan : []
    const insightHighlights = buildInsightHighlights(skillGaps)

    const scoreLabel = report.matchScore >= 80 ? 'Strong Fit' : report.matchScore >= 60 ? 'Good Fit' : 'Needs Improvement'
    const roleTitle = report.title || 'Interview report'
    const currentPath = location.pathname || ''
    const isDashboardActive = currentPath === '/dashboard'
    const isReportsActive = currentPath.startsWith('/getAllReports') || currentPath.startsWith('/interview')
    const summary = report.jobDescription
        ? report.jobDescription.slice(0, 220)
        : 'This report highlights the strengths and gaps that matter most for your next interview.'
    const insightSummary = report.selfDescription
        ? report.selfDescription.slice(0, 260)
        : 'Based on your session, your strengths lie in Scalability Planning and Cultural Alignment. You effectively demonstrated leadership through the STAR method, though more quantitative data in your technical explanations would enhance your impact.'
    const scoreCopy = report.matchScoreSummary
        || `Your technical depth and behavioral alignment exceed requirements for a ${roleTitle} role.`

    const handleResumeAction = async () => {
        setResumeMessage('')

        if (resumePdfReady && resumePdfUrl) {
            const started = downloadResumePdf(interviewId, resumePdfUrl)
            if (started) {
                setResumeMessage('Resume download started.')
            }
            return
        }

        if (isGeneratingResume) {
            return
        }

        setIsGeneratingResume(true)
        try {
            const pdfUrl = await getResumePdf(interviewId)
            if (pdfUrl) {
                const started = downloadResumePdf(interviewId, pdfUrl)
                if (started) {
                    setResumeMessage('Resume generated and download started.')
                } else {
                    setResumeMessage('Resume generated. Click download again to save it.')
                }
            } else {
                setResumeMessage('Unable to generate the resume right now. Please try again.')
            }
        } finally {
            setIsGeneratingResume(false)
        }
    }

    const handleDownloadResume = () => {
        setResumeMessage('')
        if (!resumePdfReady || !resumePdfUrl) {
            setResumeMessage('Generate the resume first to enable download.')
            return
        }

        const started = downloadResumePdf(interviewId, resumePdfUrl)
        if (started) {
            setResumeMessage('Resume download started.')
        }
    }

    return (
        <div className='interview-report-page'>
            <header className='dashboard-header report-shell-header'>
                <div className='container'>
                    <div className='dashboard-brand'>
                        <div className='brand-mark'>Q</div>
                        <div>
                            <h1>QuickHire</h1>
                        </div>
                    </div>

                    <div className='dashboard-header__nav'>
                        <Link to='/dashboard' className={`dashboard-header__nav-item ${isDashboardActive ? 'is-active' : ''}`}>Dashboard</Link>
                        <Link to='/getAllReports' className={`dashboard-header__nav-item ${isReportsActive ? 'is-active' : ''}`}>Reports</Link>
                    </div>

                    <div className='dashboard-header__actions'>

                    </div>
                </div>
            </header>

            <div className='report-main-content'>
                <section className='report-hero-grid'>
                    <div className='report-panel report-score-card'>
                        <div className='report-score-ring'>
                            <strong>{report.matchScore ?? 0}%</strong>
                            <span>MATCH SCORE</span>
                        </div>
                        <span className='report-fit-pill'>{scoreLabel}</span>
                        <p className='report-score-copy'>{scoreCopy}</p>
                    </div>

                    <div className='report-panel report-insight-card'>
                        <p className='report-insight-eyebrow'>
                            <strong>AI Interview Insight:</strong> {roleTitle}
                        </p>
                        <p className='report-insight-copy'>{insightSummary}</p>
                        <div className='report-pill-row'>
                            {insightHighlights.length
                                ? insightHighlights.map((tag, index) => (
                                    <span key={`${tag.label}-${index}`} className={`report-pill ${tag.tone === 'warning' ? 'report-pill--warning' : ''}`}>
                                        <span className='report-pill__icon' aria-hidden='true'>{tag.icon}</span>
                                        {tag.label}
                                    </span>
                                ))
                                : <span className='report-pill report-pill--muted'>No highlights available yet.</span>}
                        </div>
                    </div>
                </section>

                <section className='report-analysis-grid'>
                    <div className='report-panel'>
                        <div className='report-panel__header'>
                            <div>
                                <h3><span aria-hidden='true'>📋</span> Behavioral Questions</h3>
                                <p>Focus on soft skills and leadership narratives.</p>
                            </div>
                        </div>
                        <div className='question-list report-scroll-area'>
                            {behavioralQuestions.length ? behavioralQuestions.map((item, index) => (
                                <QuestionCard key={`behavioral-${index}`} item={item} />
                            )) : <p className='empty-state'>No behavioral questions were returned for this report.</p>}
                        </div>
                    </div>

                    <div className='report-panel'>
                        <div className='report-panel__header'>
                            <div>
                                <h3><span aria-hidden='true'>💻</span> Technical Questions</h3>
                                <p>Focus on depth, architecture, and edge cases.</p>
                            </div>
                        </div>
                        <div className='question-list report-scroll-area'>
                            {technicalQuestions.length ? technicalQuestions.map((item, index) => (
                                <QuestionCard key={`technical-${index}`} item={item} />
                            )) : <p className='empty-state'>No technical questions were returned for this report.</p>}
                        </div>
                    </div>
                    <div className='report-panel report-panel--roadmap'>
                        <div className='report-panel__header'>
                            <div>
                                <h3><span aria-hidden='true'>🧭</span> Preparation Roadmap</h3>
                                <p>Track your learning path and milestones.</p>
                            </div>
                        </div>
                        <div className='roadmap-list report-scroll-area'>
                            {preparationPlan.length ? preparationPlan.map((day, index) => (
                                <RoadmapItem key={day.day ?? index} day={day} isLast={index === preparationPlan.length - 1} />
                            )) : <p className='empty-state'>No roadmap data was returned for this report.</p>}
                        </div>
                    </div>

                    <div className='report-panel'>
                        <div className='report-panel__header'>
                            <div>
                                <h3><span aria-hidden='true'>📊</span> Skill Gap Analysis</h3>
                                <p>Identify and bridge your key skill gaps.</p>
                            </div>
                        </div>
                        <div className='skill-list report-scroll-area'>
                            {skillGaps.length ? skillGaps.map((gap, index) => {
                                const score = scorePercentage(gap.severity)
                                const isUrgent = score < 50
                                return (
                                    <div key={`${gap.skill}-${index}`} className='skill-row'>
                                        <div className='skill-row__label'>
                                            <span>{gap.skill}</span>
                                            <strong>{score}%</strong>
                                        </div>
                                        <div className='skill-row__bar'>
                                            <div
                                                className={`skill-row__fill ${isUrgent ? 'skill-row__fill--urgent' : ''}`}
                                                style={{ width: `${score}%` }}
                                            />
                                        </div>
                                        {isUrgent ? (
                                            <span className='skill-row__warning'>⚠ Needs urgent attention before technical round</span>
                                        ) : null}
                                    </div>
                                )
                            }) : <p className='empty-state'>No skill gaps were returned for this report.</p>}
                        </div>
                    </div>
                </section>

                <section className='report-cta'>
                    <div className='report-cta__copy'>
                        <h3>Ready to move forward?</h3>
                        <p>Use your interview insights to build a tailored, high-conversion resume that highlights your newly identified strengths.</p>
                    </div>
                    <div className='report-cta__actions'>
                        <button type='button' className='report-action-button report-action-button--primary' onClick={handleResumeAction} disabled={isGeneratingResume}>
                            {isGeneratingResume ? (
                                <>
                                    <span className='report-action-icon' aria-hidden='true'>⏳</span>
                                    <span>Generating Resume</span>
                                </>
                            ) : resumePdfReady ? (
                                <>
                                    <span className='report-action-icon' aria-hidden='true'>✨</span>
                                    <span>Generate Resume</span>
                                </>
                            ) : (
                                <>
                                    <span className='report-action-icon' aria-hidden='true'>✨</span>
                                    <span>Generate Resume</span>
                                </>
                            )}
                        </button>
                        <button type='button' className='report-action-button report-action-button--secondary' onClick={handleDownloadResume} disabled={!resumePdfReady || isGeneratingResume}>
                            <span className='report-action-icon' aria-hidden='true'>⬇️</span>
                            <span>Download Resume</span>
                        </button>
                    </div>
                </section>

                {resumeMessage ? (
                    <p className='report-cta__status' role='status'>{resumeMessage}</p>
                ) : null}
            </div>

            <footer className='site-footer report-site-footer'>
                <div className='container'>
                    <div className='footer-left'>© 2026 QuickHire. All rights reserved.</div>
                    <div className='footer-right'>
                        <a href='#'>Privacy Policy</a>
                        <a href='#'>Terms of Service</a>
                        <a href='#'>Help Center</a>
                    </div>
                </div>
            </footer>
        </div >
    )
}

export default Interview