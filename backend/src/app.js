import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import multer from 'multer';

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:5173"
]

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

/* require all the routes here */
import authRouter from "./routes/auth.route.js"
import interviewRouter from "./routes/interview.route.js"

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "QuickHire Backend is running"
    })
})

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    })
})

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            message: err.message
        })
    }

    if (err) {
        console.error(err)
        return res.status(err.statusCode || 500).json({
            message: err.message || "Internal server error"
        })
    }

    next()
})

export default app;