# prescription_reader — Project Plan

**Stack:** Flutter (Android + iOS) | Google Cloud Vision API | Node.js backend | MongoDB  
**Owner:** StaplerLabs  
**Package:** com.staplerlabs.prescriptionreader
---

## What We're Building

A mobile app that lets patients photograph their prescription and automatically get:
- A medication schedule with reminders
- Follow-up appointment and test reminders

---

## Architecture Overview

```
Patient Phone (Flutter App)
        |
        | HTTPS
        v
Backend API (Node.js + Express)
        |
        |--- Google Cloud Vision API  (OCR)
        |--- Medical Layer (parse extracted text into structured fields)(probably llm)
        |--- MongoDB                  (prescriptions, schedules, adherence logs)
```

**Why this split:** The Flutter app should never call Vision API directly. API keys on client = security disaster. All Vision API calls go through your backend.

---

## Development Roadmap

The development workflow is split into two separate, dedicated implementation plans:

1. **[Backend Implementation Plan](file:///E:/staplerlabs/prescription_reader/docs/BACKEND_PLAN.md)** — Node.js configuration, MongoDB schema design, GCP Vision OCR interface, LLM/regex parser, and notification cron.
2. **[Frontend Implementation Plan](file:///E:/staplerlabs/prescription_reader/docs/FRONTEND_PLAN.md)** — Flutter setup, Camera & Image Picker integration, verification and confirmation UI, and FCM listeners.

Refer to the respective files for the step-by-step checklists.

## Folder Structure (Flutter)

```
lib/
  main.dart
  app.dart                  # MaterialApp, routing
  core/
    constants/
    theme/
    utils/
    services/
      api_service.dart      # all HTTP calls
      storage_service.dart  # local preferences/storage
      notification_service.dart
  features/
    scan/
      screens/
      widgets/
      controllers/
    schedule/
      screens/
      widgets/
      controllers/
    history/
      screens/
      widgets/
  models/
    prescription.dart
    medication.dart
    schedule.dart
```

Feature-first structure. Everything related to scanning lives in `features/scan/`. Don't mix concerns.

---

## Folder Structure (Backend)

```
src/
  routes/
    prescription.js
    schedule.js
    adherence.js
  controllers/
  services/
    visionService.js        # Google Vision API wrapper
    notificationService.js  # FCM sender or whatsapp
  models/
    Prescription.js
    Schedule.js
    AdherenceLog.js
  jobs/
    reminderJob.js          # cron job
  middleware/
    upload.js
  config/
    db.js
.env
server.js
```

## Critical Rules

**1. Never call Vision API from the Flutter app directly.**  
API keys will be exposed. All OCR happens on the backend.

**2. Always show extracted data to the user before saving.**  
If the OCR gets a drug name wrong and the patient takes the wrong dose, that's a liability. Confirmation screen is not optional.

**3. Printed prescriptions first, handwritten later.**  
Do not try to solve handwriting in Phase 1. It will eat your timeline.

**4. DPDP Act 2023 compliance from day one.**  
Prescription data is sensitive health information. Get explicit consent during onboarding. Document what data you store, how long you keep it, and who can access it. Don't retrofit this later.


## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| OCR accuracy on real prescriptions is too low | High | High | Start with printed only, add manual edit screen |
| Doctors' handwriting unreadable | Very High | Medium | Explicitly out of scope until Phase 3 |
| Patient stops using app after a week | High | High | WhatsApp reminders in Phase 2, caregiver loop |
| DPDP compliance gaps | Medium | Very High | Legal review before launch |

---

*Last updated: June 2026*