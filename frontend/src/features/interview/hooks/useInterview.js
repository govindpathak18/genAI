import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf,
    deleteInterviewReport
} from "../services/interview.api"
import { useContext, useEffect, useState } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

const getStoredResumeState = (reportId) => {
    if (typeof window === "undefined" || !reportId) return false

    try {
        return window.localStorage.getItem(`quickhire_resume_ready_${reportId}`) === "true"
    } catch (error) {
        console.warn("Unable to read resume generation state", error)
        return false
    }
}

const setStoredResumeState = (reportId, value) => {
    if (typeof window === "undefined" || !reportId) return

    try {
        window.localStorage.setItem(`quickhire_resume_ready_${reportId}`, String(value))
    } catch (error) {
        console.warn("Unable to persist resume generation state", error)
    }
}

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context
    const [resumePdfReady, setResumePdfReady] = useState(() => getStoredResumeState(interviewId))
    const [resumePdfUrl, setResumePdfUrl] = useState(null)

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            console.log('[Interview Hook] Starting generateReport flow')
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            console.log('[Interview Hook] generateReport response payload', response)

            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return response.interviewReport
            }

            console.error('[Interview Hook] Unexpected generateInterviewReport response structure:', response)
        } catch (error) {
            console.error('[Interview Hook] generateReport failed', error)
        } finally {
            setLoading(false)
        }

        return null
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            console.log('[Interview Hook] Fetching report by id', interviewId)
            response = await getInterviewReportById(interviewId)
            console.log('[Interview Hook] getReportById response payload', response)

            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return response.interviewReport
            }

            console.error('[Interview Hook] Unexpected getInterviewReportById response structure:', response)
        } catch (error) {
            console.error('[Interview Hook] getReportById failed', error)
        } finally {
            setLoading(false)
        }
        return null
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            console.log('[Interview Hook] Fetching all reports')
            response = await getAllInterviewReports()
            console.log('[Interview Hook] getReports response payload', response)

            if (response && response.interviewReports) {
                setReports(response.interviewReports)
                return response.interviewReports
            }

            console.error('[Interview Hook] Unexpected getAllInterviewReports response structure:', response)
        } catch (error) {
            console.error('[Interview Hook] getReports failed', error)
        } finally {
            setLoading(false)
        }

        return []
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }))
            setResumePdfUrl(url)
            setResumePdfReady(true)
            setStoredResumeState(interviewReportId, true)
            return url
        }
        catch (error) {
            console.log(error)
            setResumePdfReady(false)
            setStoredResumeState(interviewReportId, false)
            return null
        } finally {
            setLoading(false)
        }
    }

    const downloadResumePdf = (interviewReportId, pdfUrl = resumePdfUrl) => {
        const resolvedPdfUrl = pdfUrl || resumePdfUrl
        if (!resolvedPdfUrl) {
            return false
        }

        const link = document.createElement("a")
        link.href = resolvedPdfUrl
        link.setAttribute("download", `resume_${interviewReportId}.pdf`)
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return true
    }

    const deleteReport = async (interviewId) => {
        try {
            await deleteInterviewReport(interviewId)

            setReports((prev) =>
                prev.filter((report) => report._id !== interviewId)
            )

            return true
        } catch (error) {
            console.error('[Interview Hook] Delete report failed', error)
            return false
        }
    }

    useEffect(() => {
        if (interviewId) {
            setResumePdfReady(getStoredResumeState(interviewId))
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId])

    return { loading, deleteReport, report, reports, generateReport, getReportById, getReports, getResumePdf, downloadResumePdf, resumePdfReady, resumePdfUrl }

}