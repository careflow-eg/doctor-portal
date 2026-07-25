# CareFlow Doctor Portal

## Software Requirements Specification (SRS)

**Version:** 1.0
**Project:** CareFlow AI Platform
**Frontend:** Doctor & Clinic Portal
**Repository:** `careflow-doctor-portal`

---

# 1. Overview

## Purpose

The CareFlow Doctor Portal is the primary application used by clinics, physicians, and assistants during patient encounters.

It provides an AI-powered workflow that allows clinic staff to upload laboratory reports and radiology images, conduct AI-assisted medical history collection, review an intelligent clinical dashboard, and interact with an AI physician assistant.

The frontend communicates **only** with the **Workflow Orchestrator Service**.

---

# 2. Technology Stack

Framework

* Next.js 15 (App Router)
* TypeScript

Styling

* Tailwind CSS
* shadcn/ui
* Framer Motion

State Management

* TanStack Query
* Zustand

Forms

* React Hook Form
* Zod

Charts

* Recharts

Tables

* TanStack Table

Icons

* Lucide React

Deployment

* Vercel

Communication

* REST API
* WebSocket (History Collection)

---

# 3. Goals

The portal shall allow users to:

* Authenticate securely.
* Manage patient encounters.
* Upload laboratory reports.
* Upload radiology images.
* Conduct AI-powered history collection.
* Review AI-generated clinical dashboards.
* Chat with the AI physician assistant.
* View previous encounters.
* Manage clinic profile and settings.

---

# 4. User Roles

## Doctor

Permissions

* View dashboard
* Use AI assistant
* View encounters
* Complete encounters
* View patient history

---

## Clinic Assistant

Permissions

* Register patient
* Create encounter
* Upload files
* Start history collection

Cannot

* Close encounter
* Edit dashboard

---

## Admin (Future)

* User management
* Clinic management
* Billing
* Analytics

---

# 5. Application Structure

```text
/
├── Login
├── Dashboard
├── Encounters
├── Patients
├── AI Assistant
├── Settings
└── Profile
```

---

# 6. Authentication

Support

* JWT Authentication
* Refresh Token
* Role-Based Access

Redirect unauthenticated users to login.

---

# 7. Dashboard

Display

* Today's encounters
* Active encounters
* Recent patients
* Pending history collections
* Pending dashboard generation

Widgets

* Total Patients
* Total Visits
* AI Usage
* Recent Activity

---

# 8. Encounter Management

Users can

* Create encounter
* Search encounters
* Resume encounter
* Complete encounter

Encounter Card

Display

* Patient
* Doctor
* Status
* Time
* Last Activity

---

# 9. Encounter Workflow

```text
Patient Arrives

↓

Create Encounter

↓

Upload Lab Report (Optional)

↓

Upload Radiology Images (Optional)

↓

History Collection

↓

Clinical Dashboard

↓

Doctor Review

↓

AI Assistant

↓

Complete Encounter
```

Display current workflow progress.

---

# 10. Patient Management

Patient List

Display

* Name
* Age
* Gender
* Phone
* Last Visit

Patient Details

Display

* Previous Visits
* Previous Dashboards
* Laboratory History
* Radiology History

---

# 11. Laboratory Upload

Support

* PDF
* Image

Display

* Upload Progress
* Processing Status
* AI Summary

---

# 12. Radiology Upload

Support

* X-Ray
* CT
* MRI
* Ultrasound

Display

* Upload Progress
* AI Analysis
* Findings

Future

* Image Segmentation

---

# 13. History Collection

History collection is conducted through a WebSocket connection.

Workflow

```text
Assistant Starts Interview

↓

Patient Responds

↓

History Service

↓

Generate Next Question

↓

Continue

↓

Interview Complete
```

Display

* Live transcript
* Current question
* Conversation timeline
* AI status

Support

* Voice input
* Text input (fallback)

---

# 14. Clinical Dashboard

Display

## Patient Overview

* Demographics
* Chief Complaint
* Allergies
* Medications

---

## Timeline

Visual chronological timeline.

---

## Symptoms

Display

* Severity
* Duration
* Confidence

---

## Laboratory Insights

Display AI-generated summaries.

---

## Radiology Insights

Display

* Findings
* Impression
* Clinical significance

---

## Clinical Correlations

Display evidence relationships.

---

## Differential Diagnosis

Display

* Diagnosis
* Confidence
* Supporting evidence

---

## Suggested Investigations

Display AI recommendations.

---

## Suggested Actions

Display clinical recommendations.

---

# 15. AI Physician Assistant

Provide conversational interface.

Example questions

* Summarize this patient.
* Explain the diagnosis.
* Compare previous visits.
* Show abnormal labs.
* Generate SOAP note.
* Generate referral letter.

Display

* Answer
* Citations
* Sources

---

# 16. Previous Encounters

Display

* Dashboard Summary
* Laboratory Summary
* Radiology Summary
* Visit Timeline

Search by

* Patient
* Date
* Doctor

---

# 17. Notifications

Support

* Dashboard Ready
* Upload Completed
* Encounter Updated
* Errors

---

# 18. Settings

Doctor

* Profile
* Password
* Notifications

Clinic

* Clinic Information
* Branding
* Users (Future)

---

# 19. Navigation

Sidebar

```text
Dashboard

Encounters

Patients

AI Assistant

Settings
```

Top Bar

* Search
* Notifications
* User Menu

---

# 20. WebSocket

History Collection

```text
WS /ws/history/{encounter_id}
```

Events

* Connected
* Transcript
* Next Question
* Interview Completed
* Error

---

# 21. UI Requirements

Theme

* Modern
* Medical
* Clean
* Professional

Support

* Light Mode
* Dark Mode

Primary Color

```text
#2563EB
```

Accent

```text
#14B8A6
```

---

# 22. Responsive Design

Support

* Desktop
* Laptop
* Tablet

Mobile support is optional.

---

# 23. Folder Structure

```text
careflow-doctor-portal/

app/
components/
hooks/
lib/
services/
stores/
types/
public/

components/

dashboard/
encounters/
patients/
history/
assistant/
layout/
ui/
charts/
tables/
forms/
```

---

# 24. API Integration

The frontend communicates only with

```text
https://api.careflowai.health
```

Modules

* Authentication
* Encounters
* Patients
* Laboratory
* Radiology
* History
* Dashboard
* AI Assistant

No direct communication with AI microservices.

---

# 25. Performance

Requirements

* Initial Load < 2s
* Dashboard Navigation < 300ms
* Lazy Loading
* Route Prefetching
* Optimized Images

---

# 26. Accessibility

Support

* Keyboard Navigation
* Screen Readers
* Proper Focus States
* WCAG AA

---

# 27. Security

* JWT Authentication
* Role-Based Access
* Secure Cookies
* HTTPS
* Automatic Token Refresh
* Session Timeout
* Route Protection

---

# 28. Future Features

* Appointment Scheduling
* Billing
* Multi-Clinic Support
* Real-Time Collaboration
* Electronic Prescription
* Hospital Integration
* FHIR/HL7 Support
* AI Voice Dictation
* ECG Viewer
* Radiology Segmentation Viewer
* Mobile Application

---

# 29. Non-Functional Requirements

Performance

* Lighthouse > 90
* Responsive UI
* Optimized bundle size

Maintainability

* Component-based architecture
* Shared UI library
* Strict TypeScript
* Reusable hooks
* Feature-based folder structure

Scalability

* Modular pages
* Easily extendable workflows
* Independent deployment

---

# 30. Deliverables

The implementation shall include:

* Production-ready Next.js application
* Tailwind CSS + shadcn/ui
* Fully responsive doctor portal
* Authentication flow
* Encounter management
* Laboratory & radiology upload workflow
* Real-time history collection via WebSocket
* AI-powered clinical dashboard
* AI physician assistant
* Previous encounter viewer
* Protected routes
* Reusable component architecture
* Dark/Light mode
* Vercel deployment ready
* Clean, maintainable, and documented code
