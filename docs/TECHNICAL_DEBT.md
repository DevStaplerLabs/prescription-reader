# Technical Debt & Architecture Trade-offs (MVP)

This document tracks the technical compromises made to accelerate the development of the **prescription_reader** MVP and outlines the security and scalability improvements required before launching in production.

---

## 1. Authentication & Security

### Direct Google Cloud API Key
* **Current Approach:** Use a simple API Key (`GOOGLE_VISION_API`) inside the `.env` file to authenticate with Google Cloud Vision.
* **Trade-off:** API keys are easy to leak, hard to rotate automatically, and provide broader access if compromised.
* **Production Fix:** Transition to **Application Default Credentials (ADC)** using a Google Cloud Service Account JSON key file, and store it securely using secret managers (e.g., AWS Secrets Manager, GCP Secret Manager).

### Public Upload & OCR Endpoints
* **Current Approach:** Keep endpoints like `POST /api/prescriptions/upload` completely public.
* **Trade-off:** Vulnerable to API abuse, spam uploads, and high cloud costs.
* **Production Fix:** Implement JWT-based user authentication (e.g., via Firebase Auth or Supabase Auth) and apply rate limiting (e.g., `express-rate-limit`).

---

## 2. Infrastructure & Performance

### Multer Memory Storage for Uploads
* **Current Approach:** Store uploaded images in RAM (`multer.memoryStorage()`) during OCR processing.
* **Trade-off:** High traffic or large image uploads can easily exhaust server RAM, leading to Out-of-Memory (OOM) crashes.
* **Production Fix:** 
  1. Set strict file size limits (e.g., max 3MB).
  2. Implement **direct-to-cloud uploads**: Let the client upload images directly to Google Cloud Storage (via presigned URLs) and send only the file URL to the backend, bypassing backend RAM entirely.

### Rule-Based Regex Parsing
* **Current Approach:** Use regular expressions to extract structured drug names, dosages, and timings.
* **Trade-off:** Highly fragile. Any slight spelling mistake, layout variation, or handwritten text will cause parsing to fail or misidentify medications.
* **Production Fix:** Integrate a clinical LLM endpoint (like Gemini Pro or OpenAI GPT-4o) with structured JSON schemas, or use a dedicated medical entity recognition tool (like AWS Comprehend Medical).

### Polling Scheduler (node-cron) vs. Event-Driven Job Queue
* **Current Approach:** Use `node-cron` to poll MongoDB every minute for active schedules matching the current time slot.
* **Trade-off:** Resource inefficient. The backend queries the database every minute regardless of whether there are actual reminders to send. Does not scale well as the number of users and active schedules grows.
* **Production Fix:** Transition to a dedicated, event-driven message queue/scheduler (such as **BullMQ** backed by **Redis**, or cloud solutions like **Google Cloud Tasks**). When a prescription schedule is confirmed, schedule a single delayed job to execute at the exact reminder timestamp, eliminating database polling entirely.


---

## 3. Privacy & Compliance (DPDP Act 2023 / HIPAA)

### Plaintext Storage of Health Data
* **Current Approach:** Save raw prescription texts in plaintext within MongoDB.
* **Trade-off:** Prescription text contains Sensitive Personal Data (SPD) which must be protected.
* **Production Fix:** Encrypt health data at rest (using database-level field encryption) and implement strict access controls.

### Missing Data Retention Policy
* **Current Approach:** Store prescription records and texts indefinitely.
* **Trade-off:** Non-compliant with the "Right to be Forgotten" and storage limitation principles under modern privacy laws.
* **Production Fix:** Implement automatic TTL (Time-To-Live) indexes in MongoDB to purge/anonymize health records after a specified period or when the user requests account deletion.

### Consent, Phone Verification & Privacy Claims
* **Current Approach:** Consent is collected only in the Flutter UI, phone numbers are not verified, and the app states that health data is encrypted at rest and images are deleted even though these controls are not implemented.
* **Trade-off:** The application cannot prove consent or ownership of a WhatsApp number, and its privacy copy does not reflect actual data handling.
* **Production Fix:** Record versioned consent server-side, verify ownership through OTP, obtain and record explicit WhatsApp opt-in, align privacy copy with implementation, and add account deletion/data-export controls.

---

## 4. Reminder Delivery Reliability

### Duplicate Reminder Prevention
* **Current Approach:** The cron job sends a matching reminder immediately without recording a delivery key.
* **Trade-off:** A server restart or multiple backend instances can send the same reminder more than once.
* **Production Fix:** Add an idempotent reminder-delivery record keyed by schedule, medication group, date, and time; use an outbox/queue before sending.

### WhatsApp Send Failures
* **Current Approach:** Failed WhatsApp sends are logged only.
* **Trade-off:** Failed reminders are lost with no retry, monitoring, or support visibility.
* **Production Fix:** Persist delivery attempts, retry transient failures with a bounded backoff, and add error monitoring/alerts. Live-test every approved WhatsApp template, including grouped newline/bullet lists.

### Follow-Up and Appointment Notifications
* **Current Approach:** Follow-up information is extracted and stored, but only medication reminders are scheduled.
* **Trade-off:** Users do not receive reminders for follow-up visits, tests, or appointments.
* **Production Fix:** Add scheduled notification flows for follow-ups, tests, and appointments after the medicine-reminder MVP is stable.

---

## 5. Data Integrity & Medical Safety

### Client-Controlled Prescription Data
* **Current Approach:** The client submits the final prescription payload and confirmation currently normalizes some fields, including form, route, duration unit, and special instructions.
* **Trade-off:** Important prescription details can be changed or discarded before the schedule is saved.
* **Production Fix:** Validate the complete payload server-side, preserve parsed fields unless explicitly edited, and add a clear user-review acknowledgement before reminders begin.

### Missing Ownership Checks
* **Current Approach:** Schedule and prescription routes accept patient phone numbers and record IDs without authenticated ownership verification.
* **Trade-off:** A caller can potentially access or alter another patient’s schedule.
* **Production Fix:** Add authenticated users and enforce ownership on every patient, prescription, and schedule query/mutation.

---

## 6. Mobile Release Readiness & Quality

### iOS Capture Permissions
* **Current Approach:** The iOS project lacks camera and photo-library usage descriptions required by the image picker.
* **Trade-off:** Image capture or selection can fail on iOS.
* **Production Fix:** Add localized `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` entries, then test on a physical iPhone.

### Release Configuration and Automated Testing
* **Current Approach:** Android release signing is still a TODO, the app label is unfinished, and there is no automated backend test suite, Flutter test suite, or CI pipeline.
* **Trade-off:** Regressions can reach users and builds are not release-ready.
* **Production Fix:** Configure release signing and app metadata, then add targeted integration tests and CI checks before a wider rollout.


C:\Users\ASUS\flutter\bin\flutter.bat run -d chrome --web-port=5556
