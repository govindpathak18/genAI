import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({
    jobDescription,
    selfDescription,
    resumeFile
}) => {
    const formData = new FormData();

    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    console.log("[Interview API] Sending generate report request", {
        jobDescriptionLength: jobDescription?.length || 0,
        selfDescriptionLength: selfDescription?.length || 0,
        resumeName: resumeFile?.name || null
    });

    try {
        const response = await api.post(
            "/api/interview/",
            formData
        );

        console.log(
            "[Interview API] Generate report response received",
            response?.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "[Interview API] Generate report request failed",
            error
        );

        throw error;
    }
};

/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    console.log(
        "[Interview API] Fetching report by id",
        interviewId
    );

    try {
        const response = await api.get(
            `/api/interview/report/${interviewId}`
        );

        console.log(
            "[Interview API] Report fetch response received",
            response?.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "[Interview API] Report fetch failed",
            error
        );

        throw error;
    }
};

/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    console.log("[Interview API] Fetching all reports");

    try {
        const response = await api.get(
            "/api/interview/"
        );

        console.log(
            "[Interview API] All reports response received",
            response?.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "[Interview API] All reports fetch failed",
            error
        );

        throw error;
    }
};

/**
 * @description Service to generate resume PDF.
 */
export const generateResumePdf = async ({
    interviewReportId
}) => {
    const response = await api.post(
        `/api/interview/resume/pdf/${interviewReportId}`,
        null,
        {
            responseType: "blob"
        }
    );

    return response.data;
};

/**
 * @description Service to delete an interview report.
 */
export const deleteInterviewReport = async (interviewId) => {
    console.log(
        "[Interview API] Deleting report",
        interviewId
    );

    try {
        const response = await api.delete(
            `/api/interview/${interviewId}`
        );

        console.log(
            "[Interview API] Delete report response received",
            response?.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "[Interview API] Delete report failed",
            error
        );

        throw error;
    }
};