# prescription_reader — Backend Implementation Plan

This document outlines the step-by-step plan for developing the Node.js backend for the **prescription_reader** app.

## Stack & Services
- **Runtime:** Node.js (Express framework)
- **Database:** MongoDB (using Mongoose ODM)
- **OCR:** Google Cloud Vision API (`DOCUMENT_TEXT_DETECTION`)
- **NLP / Parsing:** Rule-based Regex and/or LLM endpoint
- **Notifications:** WhatsApp Business API integration
- **Job Scheduler:** `node-cron` or `bullmq`

---

## Step-by-Step Roadmap

### Step 1 — Setup & Infrastructure
- [x] Initialize Express.js project with `npm init` and configure ES modules/CommonJS.
- [x] Setup Git repository, `.gitignore` (excl. `node_modules` and `.env`), and push to remote.
- [x] Setup MongoDB Atlas cluster (free tier) and write the database connection utility in `src/config/db.js`.
- [x] Create a Google Cloud project, enable the **Cloud Vision API**, generate credentials, and save the service account key/API key.
- [x] Configure environment variables in `.env` (Port, MongoDB URI, GCP Credentials).

### Step 2 — Prescription Upload & OCR
- [x] Configure `multer` middleware (`src/middleware/upload.js`) to handle image uploads and store them temporarily or on cloud storage.
- [x] Create a vision service (`src/services/visionService.js`) to interface with `@google-cloud/vision`.
- [x] Create route: `POST /api/prescriptions/upload` (Public)
  - Processes uploaded image via the Vision API.
  - Returns raw OCR text extracted from the document to the frontend.

### Step 3 — Parsing & Schedule Generation
- [x] Build the parser service (`src/services/nlpService.js`):
  - Parses prescription images directly using Gemini 3.5 Flash Vision for structured extraction.
  - Extracts structured fields: `drugName`, `dosage`, `frequency`, `duration` (in days), appointment/test dates.
  - Uses `responseMimeType: 'application/json'` for guaranteed JSON output.
  - Includes validation layer for frequency, duration, and required fields.
- [x] Design DB Schemas:
  - `src/models/Prescription.js`: `rawOcrText`, `extractedData`, `createdAt`.
  - `src/models/Schedule.js`: `prescriptionId`, `medications` (array of object: `drugName`, `dosage`, `frequencyTimes` e.g. 08:00, 20:00, `startDate`, `endDate`), `appointments` (array of dates), `tests` (array of dates), `isActive`.
- [x] Create routes:
  - `POST /api/prescriptions/parse` — Receives image, triggers OCR + Gemini Vision parsing, returns structured JSON representation to the client for validation.
  - `POST /api/prescriptions/confirm` — Receives validated JSON from user, saves `Prescription` and `Schedule` records.

### Step 4 — Reminders & Scheduler
- [ ] Implement notification service (`src/services/notificationService.js`):
  - Integrates with WhatsApp Business API to dispatch messaging reminders.
- [ ] Implement cron job scheduler (`src/jobs/reminderJob.js`):
  - Set up a cron task running every minute (or every 5-15 mins).
  - Checks for medications scheduled within the current window and triggers WhatsApp alerts.

### Step 5 — Polish & Testing
- [ ] Create history routes:
  - `GET /api/prescriptions` — Retrieve all past prescriptions.
  - `GET /api/schedules/active` — Get the currently active medication schedule.
- [x] Implement centralized error-handling middleware (configured in `server.js`).
- [ ] Conduct local integration testing using tools like Postman/Insomnia.

### Step 6 — Adherence Logs (To be completed last)
- [ ] Design adherence schema (`src/models/AdherenceLog.js`):
  - Fields: `scheduleId`, `medicationName`, `scheduledTime`, `status` (`taken` / `missed` / `snoozed`), `loggedAt`.
- [ ] Create routes:
  - `POST /api/adherence/log` — Updates adherence status when a user marks a dose.

---

## Directory Layout (Backend)

```
src/
  routes/
    prescription.js
    schedule.js
    adherence.js
  controllers/
    prescriptionController.js
    scheduleController.js
    adherenceController.js
  services/
    visionService.js        # Google Vision API wrapper
    nlpService.js           # OCR text parsing layer
    notificationService.js  # FCM & WhatsApp notification sender
  models/
    Prescription.js
    Schedule.js
    AdherenceLog.js
  jobs/
    reminderJob.js          # cron schedules
  middleware/
    upload.js
  config/
    db.js
.env
server.js
```
