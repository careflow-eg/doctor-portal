<div align="center">
  <h1>🏥 CareFlow Doctor Portal</h1>
  <p><em>Doctor-facing clinical dashboard for encounters, diagnostics, and AI-assisted workflows</em></p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
    <img src="https://github.com/careflow-eg/doctor-portal/actions/workflows/ci.yml/badge.svg" />
  </p>
</div>

---

## Overview

The **Doctor Portal** is the primary clinician interface for the CareFlow platform. It provides encounter management, lab/radiology upload, AI-powered medical history collection, clinical dashboard generation, and a diagnostic AI assistant — all in a polished, responsive glassmorphic UI.

## Key Features

- **Encounter Management** — Create, track, and complete patient encounters
- **Lab & Radiology Upload** — Drag-and-drop file upload for clinical data
- **AI History Collection** — Real-time conversational medical history with voice support
- **Clinical Dashboard** — AI-generated diagnostic summaries and treatment suggestions
- **AI Assistant** — Conversational diagnostic assistant with human-in-the-loop review
- **Patient Search** — MRN and name-based patient lookup with registration

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x
- **UI**: React 19, Tailwind CSS, Framer Motion
- **State**: Zustand, TanStack Query
- **Auth**: JWT-based authentication
- **API Client**: Axios with interceptors

## Project Structure

```
doctor-portal/
├── .github/workflows/    # CI/CD pipeline
├── app/                  # Next.js App Router pages & layouts
│   ├── (auth)/           # Login & registration pages
│   └── (portal)/         # Protected portal pages
├── components/           # Reusable UI components
│   ├── encounters/       # Encounter-specific components
│   ├── ui/               # Base UI components
│   └── voice/            # Voice recording widgets
├── hooks/                # Custom React hooks
├── lib/                  # API client, utilities
├── services/             # API service layers
├── stores/               # Zustand state stores
├── types/                # TypeScript interfaces
├── public/               # Static assets
├── docs/                 # Architecture docs
├── .env.example          # Environment template
├── next.config.ts        # Next.js configuration
└── package.json          # Dependencies
```

## Quick Start

```bash
git clone https://github.com/careflow-eg/doctor-portal.git
cd doctor-portal
cp .env.example .env
npm install
npm run dev
# Open http://localhost:3000
```

## License

Proprietary — CareFlow © 2026
