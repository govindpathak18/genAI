# QuickHire

QuickHire is an AI-powered interview preparation platform that helps candidates prepare for job interviews by combining a resume, self-description, and job description into a tailored interview report. The app generates technical and behavioral questions, highlights skill gaps, outlines a 7-day preparation plan, and can create a resume PDF tailored to the target role.

## Features

- User authentication with login, registration, OTP verification, password reset, and logout
- Secure profile and report management
- Resume upload and parsing for interview analysis
- AI-generated interview reports using Google Gemini
- Skill-gap analysis and interview preparation planning
- Resume PDF generation tailored to the target job description

## Deployment

This project is deployed using:

- Render for the backend API
- Vercel for the frontend

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Sass
- Axios

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Multer for file uploads
- Nodemailer for OTP emails
- Puppeteer for PDF generation

## Project Structure

```text
backend/
  src/
    controllers/
    models/
    routes/
    services/
    middlewares/
    config/
frontend/
  src/
    features/
    components/
```

## Prerequisites

Before running the app, make sure you have:

- Node.js 18 or newer
- npm
- A MongoDB instance
- A Google Gemini API key
- SMTP credentials for OTP email delivery

## Environment Variables

Create a .env file in the backend directory with the following variables:

```env
PORT=3000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/quickhire
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=QuickHire <your-email@example.com>
```

## Installation

1. Clone the repository
2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

The backend will run on http://localhost:3000.

### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend will run on http://localhost:5173.

## Available Scripts

### Backend
- npm run dev - Start the backend in development mode with nodemon
- npm start - Start the backend in production mode

### Frontend
- npm run dev - Start the Vite development server
- npm run build - Create a production build
- npm run preview - Preview the production build locally

## API Overview

The backend exposes authentication and interview-related routes under:

- /api/auth
- /api/interview

Health check endpoint:

- GET /health

## Notes

- If SMTP is not configured, OTP emails will fall back to console logging rather than sending mail.
- The app uses cookies for authenticated requests, so the frontend and backend must be served with matching CORS and origin settings.

