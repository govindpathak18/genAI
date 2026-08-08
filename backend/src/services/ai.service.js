import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import puppeteer from "puppeteer";

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const qaSchema = {
    type: "object",
    properties: {
        question: { type: "string" },
        intention: { type: "string" },
        answer: { type: "string" }
    },
    required: ["question", "intention", "answer"],
    additionalProperties: false
};

const interviewJsonSchema = {
    type: "object",
    properties: {
        title: { type: "string" },

        matchScore: {
            type: "number",
            minimum: 0,
            maximum: 100
        },

        technicalQuestions: {
            type: "array",
            minItems: 10,
            maxItems: 10,
            items: qaSchema
        },

        behavioralQuestions: {
            type: "array",
            minItems: 5,
            maxItems: 5,
            items: qaSchema
        },

        skillGaps: {
            type: "array",
            minItems: 5,
            items: {
                type: "object",
                properties: {
                    skill: { type: "string" },
                    severity: {
                        type: "string",
                        enum: ["low", "medium", "high"]
                    }
                },
                required: ["skill", "severity"],
                additionalProperties: false
            }
        },

        preparationPlan: {
            type: "array",
            minItems: 7,
            maxItems: 7,
            items: {
                type: "object",
                properties: {
                    day: {
                        type: "integer",
                        minimum: 1,
                        maximum: 7
                    },
                    focus: { type: "string" },
                    tasks: {
                        type: "array",
                        minItems: 1,
                        items: { type: "string" }
                    }
                },
                required: ["day", "focus", "tasks"],
                additionalProperties: false
            }
        }
    },

    required: [
        "title",
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan"
    ],

    additionalProperties: false
};

const interviewSchema = z.object({
    title: z.string().min(2),

    matchScore: z.number().min(0).max(100),

    technicalQuestions: z.array(
        z.object({
            question: z.string().min(5),
            intention: z.string().min(5),
            answer: z.string().min(5)
        })
    ).length(10),

    behavioralQuestions: z.array(
        z.object({
            question: z.string().min(5),
            intention: z.string().min(5),
            answer: z.string().min(5)
        })
    ).length(5),

    skillGaps: z.array(
        z.object({
            skill: z.string().min(2),
            severity: z.enum(["low", "medium", "high"])
        })
    ).min(5),

    preparationPlan: z.array(
        z.object({
            day: z.number().int().min(1).max(7),
            focus: z.string().min(2),
            tasks: z.array(z.string().min(2)).min(1)
        })
    ).length(7)
});

const resumeSchema = z.object({
    html: z.string().min(20)
});

/**
 * @typedef {Object} InterviewReport
 * @property {string} title
 * @property {number} matchScore
 * @property {Array<Object>} technicalQuestions
 * @property {Array<Object>} behavioralQuestions
 * @property {Array<Object>} skillGaps
 * @property {Array<Object>} preparationPlan
 */

/**
 * @param {Object} response
 * @returns {string}
 */
function getResponseText(response) {
    const value = response?.text || response?.outputText;

    if (!value || typeof value !== "string") {
        throw new Error("Gemini returned an empty response.");
    }

    return value.trim();
}

/**
 * @param {string} value
 * @returns {Object}
 */
function parseJson(value) {
    try {
        return JSON.parse(value);
    } catch {
        throw new Error("Gemini returned invalid JSON.");
    }
}

/**
 * @param {Object} report
 * @returns {InterviewReport}
 */
function validateInterviewReport(report) {
    const result = interviewSchema.safeParse(report);

    if (!result.success) {
        console.error(
            "[AI Service] Invalid Gemini report:",
            JSON.stringify(report, null, 2)
        );

        console.error(
            "[AI Service] Validation errors:",
            JSON.stringify(result.error.issues, null, 2)
        );

        throw new Error("Gemini returned an invalid interview report.");
    }

    const days = result.data.preparationPlan
        .map(item => item.day)
        .sort((a, b) => a - b);

    if (
        JSON.stringify(days) !==
        JSON.stringify([1, 2, 3, 4, 5, 6, 7])
    ) {
        throw new Error(
            "Gemini returned an invalid preparation plan."
        );
    }

    return result.data;
}

/**
 * @param {Object} data
 * @returns {string}
 */
function buildInterviewPrompt({
    resume,
    selfDescription,
    jobDescription
}) {
    return `
Create an interview preparation report for the candidate.

RESUME:
${resume || "Not provided"}

SELF DESCRIPTION:
${selfDescription || "Not provided"}

JOB DESCRIPTION:
${jobDescription}

Requirements:

- Exactly 10 technical questions.
- Exactly 5 behavioral questions.
- At least 5 skill gaps.
- Exactly 7 preparation days.
- Preparation days must be numbered 1 through 7.
- Use ONLY these exact property names:

title
matchScore
technicalQuestions
behavioralQuestions
skillGaps
preparationPlan

Never use snake_case names.

technicalQuestions must contain question objects.

Each technical question must contain:
question
intention
answer

behavioralQuestions must contain question objects.

Each behavioral question must contain:
question
intention
answer

skillGaps must contain objects with:
skill
severity

severity must be low, medium, or high.

preparationPlan must contain objects with:
day
focus
tasks

Do not return numbers instead of objects.

Do not invent candidate experience.

Return only JSON matching the schema.
`;
}

/**
 * @param {Object} data
 * @returns {Promise<InterviewReport>}
 */
async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
        throw new Error(
            "GOOGLE_GENAI_API_KEY is not configured."
        );
    }

    console.log(
        "[AI Service] Requesting interview report from Gemini"
    );

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",

            contents: buildInterviewPrompt({
                resume,
                selfDescription,
                jobDescription
            }),

            config: {
                responseMimeType: "application/json",
                responseJsonSchema: interviewJsonSchema
            }
        });

        const rawResponse = getResponseText(response);

        if (process.env.NODE_ENV !== "production") {
            console.log(
                "[AI Service] Gemini response:",
                rawResponse
            );
        }

        const report = parseJson(rawResponse);

        return validateInterviewReport(report);

    } catch (error) {
        console.error(
            "[AI Service] Interview report failed:",
            error
        );

        throw error;
    }
}

/**
 * @param {string} html
 * @returns {Promise<Buffer>}
 */
async function htmlToPdf(html) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    });

    try {
        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "domcontentloaded"
        });

        return await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        });
    } finally {
        await browser.close();
    }
}

/**
 * @param {Object} data
 * @returns {string}
 */
function buildResumePrompt({
    resume,
    selfDescription,
    jobDescription
}) {
    return `
Create a professional ATS-friendly resume.

RESUME:
${resume || "Not provided"}

SELF DESCRIPTION:
${selfDescription || "Not provided"}

JOB DESCRIPTION:
${jobDescription}

Rules:

- Tailor the resume to the job description.
- Keep it concise.
- Prefer one page.
- Use clean HTML.
- Do not use tables for layout.
- Do not invent information.
- Do not invent skills, experience, companies, education,
  certifications, or achievements.
- Return only JSON matching the schema.
`;
}

/**
 * @param {Object} data
 * @returns {Promise<Buffer>}
 */
async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
        throw new Error(
            "GOOGLE_GENAI_API_KEY is not configured."
        );
    }

    const resumeJsonSchema = {
        type: "object",

        properties: {
            html: {
                type: "string"
            }
        },

        required: ["html"],
        additionalProperties: false
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",

            contents: buildResumePrompt({
                resume,
                selfDescription,
                jobDescription
            }),

            config: {
                responseMimeType: "application/json",
                responseJsonSchema: resumeJsonSchema
            }
        });

        const data = resumeSchema.safeParse(
            parseJson(getResponseText(response))
        );

        if (!data.success) {
            throw new Error(
                "Gemini returned invalid resume HTML."
            );
        }

        const html = data.data.html.trim();

        if (
            !html.includes("<html") &&
            !html.includes("<body") &&
            !html.includes("<div")
        ) {
            throw new Error(
                "Gemini returned invalid HTML."
            );
        }

        return await htmlToPdf(html);

    } catch (error) {
        console.error(
            "[AI Service] Resume generation failed:",
            error
        );

        throw error;
    }
}

export {
    generateInterviewReport,
    generateResumePdf
};