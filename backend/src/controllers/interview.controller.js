import pdfParse from "pdf-parse/lib/pdf-parse.js";
import {
    generateInterviewReport,
    generateResumePdf,
} from "../services/ai.service.js";
import interviewReportModel from "../models/interviewReport.model.js";


/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body
        const trimmedJobDescription = typeof jobDescription === "string" ? jobDescription.trim() : ""
        const trimmedSelfDescription = typeof selfDescription === "string" ? selfDescription.trim() : ""


        if (!trimmedJobDescription) {
            return res.status(400).json({
                message: "Please provide a job description."
            })
        }

        if (!req.file?.buffer && !trimmedSelfDescription) {
            return res.status(400).json({
                message: "Please provide either a resume file or a self description."
            })
        }

        let resumeText = ""

        if (req.file?.buffer) {
            try {
                const resumeContent = await pdfParse(req.file.buffer)
                resumeText = resumeContent.text || ""
            } catch (error) {
                return res.status(400).json({
                    message: "Unable to parse the uploaded resume."
                })
            }
        }

        console.log('[Interview Controller] Starting report generation for user', req.user?.id)

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: trimmedSelfDescription,
            jobDescription: trimmedJobDescription
        })

        console.log('[Interview Controller] AI report received, preparing DB payload')

        const interviewPayload = {
            user: req.user.id,
            resume: resumeText,
            selfDescription: trimmedSelfDescription,
            jobDescription: trimmedJobDescription,
            title: interViewReportByAi.title || interViewReportByAi.job_title || "Interview Report",
            matchScore: interViewReportByAi.matchScore,
            technicalQuestions: interViewReportByAi.technicalQuestions,
            behavioralQuestions: interViewReportByAi.behavioralQuestions,
            skillGaps: interViewReportByAi.skillGaps,
            preparationPlan: interViewReportByAi.preparationPlan
        }

        if (!Array.isArray(interviewPayload.technicalQuestions) || !Array.isArray(interviewPayload.behavioralQuestions) || !Array.isArray(interviewPayload.skillGaps) || !Array.isArray(interviewPayload.preparationPlan)) {
            console.error("Invalid AI interview report structure:", interViewReportByAi);
            return res.status(500).json({
                message: "AI returned an invalid interview report structure."
            });
        }

        console.log('[Interview Controller] Saving interview report to database')
        const interviewReport = await interviewReportModel.create(interviewPayload)

        console.log('[Interview Controller] Report created successfully', interviewReport?._id)

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({
            message: error.message,
            stack: error.stack,
        });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        if (!interviewId) {
            return res.status(400).json({
                message: "Interview report id is required."
            })
        }

        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong while fetching the interview report."
        })
    }
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong while fetching interview reports."
        })
    }
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        if (!interviewReportId) {
            return res.status(400).json({
                message: "Interview report id is required."
            })
        }

        const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        console.log(pdfBuffer)

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong while generating the resume PDF."
        })
    }
}

/**
 * @description Delete an interview report belonging to the logged-in user.
 */
async function deleteInterviewReportController(req, res) {
    try {
        const { interviewId } = req.params

        if (!interviewId) {
            return res.status(400).json({
                message: 'Interview report id is required.'
            })
        }

        const report = await interviewReportModel.findOneAndDelete({
            _id: interviewId,
            user: req.user.id
        })

        if (!report) {
            return res.status(404).json({
                message: 'Interview report not found.'
            })
        }

        return res.status(200).json({
            message: 'Interview report deleted successfully.'
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            message: 'Something went wrong while deleting the interview report.'
        })
    }
}

export default {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    deleteInterviewReportController
}