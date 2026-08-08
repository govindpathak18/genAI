import React from 'react'
import { Link } from 'react-router'
import heroIllustration from '../../assets/hero-illustration.png'
import './landing.scss'

const Landing = () => {
    return (
        <div className="landing-page">
            <header className="landing-nav landing-nav--accent">
                <div className="landing-brand">
                    <span className="brand-logo">Q</span>
                    <span className="brand-name">QuickHire</span>
                </div>
                <div className="landing-links">
                    <Link className="nav-link" to="#about">About</Link>
                    <Link className="nav-link" to="#features">Features</Link>
                    <Link className="nav-link" to="#pricing">Pricing</Link>
                </div>
                <div className="landing-nav-right">
                    <Link className="btn btn-primary nav-cta" to="/register">Get Started</Link>
                </div>
            </header>

            <main className="landing-hero">
                <div className="hero-top">
                    <section className="hero-copy">
                        <div className="hero-eyebrow">Ace your interview prep with AI</div>
                        <h1>Create ATS-friendly resumes and interview reports in one workflow.</h1>
                        <p>QuickHire helps you build ATS-friendly resumes, analyze job compatibility, generate personalized interview questions, and follow AI-powered preparation plans—all from one intelligent dashboard.</p>
                        <Link className="btn btn-primary hero-button" to="/register">Get Started</Link>
                    </section>

                    <section className="hero-visual">
                        <img src={heroIllustration} alt="QuickHire illustration" />
                    </section>
                </div>

                <section className="hero-images">
                    <div className="hero-card hero-card--resume">
                        <div className="hero-card__label">Generate ATS friendly resume</div>
                        <div className="resume-preview">
                            <div className="resume-title" />
                            <div className="resume-subtitle" />
                            <div className="resume-chip-row">
                                <span>React</span>
                                <span>Node.js</span>
                                <span>AI</span>
                            </div>
                            <div className="resume-line long" />
                            <div className="resume-line short" />
                            <div className="resume-line medium" />
                        </div>
                    </div>

                    <div className="hero-card hero-card--report">
                        <div className="hero-card__label">Interview report preview</div>
                        <div className="report-preview">
                            <div className="report-score">
                                <span>88%</span>
                                <small>Match score</small>
                            </div>
                            <div className="report-lines">
                                <div className="report-line" />
                                <div className="report-line short" />
                                <div className="report-line" />
                            </div>
                            <div className="report-detail-row">
                                <div>Technical questions</div>
                                <div>Behavioral prep</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <section className="landing-features">
                <div className="feature-card">
                    <h3>ATS optimization</h3>
                    <p>Build a resume that passes recruiter scanners and highlights your strengths.</p>
                </div>
                <div className="feature-card">
                    <h3>Interview prep report</h3>
                    <p>Receive match scores, sample questions, and role-specific preparation guidance.</p>
                </div>
                <div className="feature-card">
                    <h3>One-click workflow</h3>
                    <p>Upload your resume, add your profile, and launch your interview plan in minutes.</p>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="footer-note">Made with ❤️</div>
                <div className="footer-links">
                    <span>Privacy</span>
                    <span>Contact</span>
                    <span>Help</span>
                </div>
            </footer>
        </div>
    )
}

export default Landing
