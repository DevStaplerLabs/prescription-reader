# prescription_reader — Frontend Implementation Plan

This document outlines the step-by-step plan for developing the Flutter client application for **prescription_reader**.

## Stack & Packages
- **Framework:** Flutter (Android + iOS)
- **State Management:** `provider` or `riverpod`
- **Navigation:** `go_router`
- **HTTP Client:** `dio`
- **Camera/Photos:** `image_picker` or `camera`
- **Push Notifications:** `firebase_messaging` + `flutter_local_notifications`

---

## Step-by-Step Roadmap

### Step 1 — Setup & Infrastructure
- [ ] Initialize Flutter project using `flutter create --org com.staplerlabs prescription_reader`.
- [ ] Setup Git repository, configure `.gitignore` for Flutter, and push to remote.
- [ ] Configure `pubspec.yaml` with required packages (`dio`, `go_router`, `image_picker`, etc.).
- [ ] Set up the directory structure (see Directory Layout below).
- [ ] Setup a basic CI pipeline (e.g. GitHub actions running `flutter analyze`).

### Step 2 — Initial Navigation & API Setup
- [ ] Implement `api_service.dart` using `dio` configured to point to the backend server.
- [ ] Configure `go_router` navigation inside `app.dart` to open directly to the `ScanScreen` or a simple onboarding splash screen.
- [ ] Set up state management (`provider` or `riverpod`) to hold the active prescription/schedule states.

### Step 3 — Camera Integration & Image Upload
- [ ] Request necessary camera and storage permissions in `AndroidManifest.xml` and `Info.plist`.
- [ ] Build scanning interface (`ScanScreen`) integrating `image_picker` to capture a photo of the printed prescription.
- [ ] Implement multipart upload utility in `api_service.dart` to send the captured image to the backend endpoint `POST /api/prescriptions/upload`.
- [ ] Create a temporary debug view showing the raw OCR text returned by the backend to verify OCR processing.

### Step 4 — Confirmation & Edit Form
- [ ] Design Confirmation Screen (`ConfirmationScreen`) displaying parsed prescription data received from the backend:
  - List of medications (editable fields: drug name, dosage, frequency, start date, duration).
  - Add/delete medication actions.
- [ ] Design verification/validation logic to ensure correct formatting before saving.
- [ ] Implement save handler to send the validated JSON back to the backend `POST /api/schedules` endpoint.

### Step 5 — Schedule Dashboard & Notifications
- [ ] Integrate Firebase Cloud Messaging (FCM) via the standard Flutter/Firebase setup.
- [ ] Create notification service (`src/core/services/notification_service.dart`) to register FCM tokens and handle background/foreground notifications.
- [ ] Build Main Schedule Screen (`HomeScreen`):
  - Lists medications grouped by daily times (e.g., Morning, Afternoon, Evening).
  - Interactive checkboxes/buttons to log medication as Taken, Snoozed, or Missed.
  - Interfacing with `POST /api/adherence/log` to record events.

### Step 6 — Polish & Internal Testing
- [ ] Build History Screen (`HistoryScreen`): Lists past prescriptions and their adherence rates.
- [ ] Handle error states gracefully: offline indicator, failed uploads, and scanning validation errors.
- [ ] Generate Android APK build (`flutter build apk --release`) and distribute for internal/closed user testing.

---

## Directory Layout (Flutter)

```
lib/
  main.dart
  app.dart                  # MaterialApp, routing configuration
  core/
    constants/
    theme/
    utils/
    services/
      api_service.dart      # HTTP calls configuration
      storage_service.dart  # local preferences/storage handler
      notification_service.dart
  features/
    scan/
      screens/
        scan_screen.dart
        confirmation_screen.dart
      widgets/
      controllers/
    schedule/
      screens/
        home_screen.dart
      widgets/
      controllers/
    history/
      screens/
        history_screen.dart
      widgets/
  models/
    prescription.dart
    medication.dart
    schedule.dart
```
