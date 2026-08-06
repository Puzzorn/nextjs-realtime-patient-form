# Development & System Architecture Planning Document

**Project**: Agnos Real-Time Patient System  
**Version**: 1.0.0  
**Target Environment**: Next.js 15 (App Router), React 19, TypeScript 5.7, Node.js / Socket.io 4.8  

---

## Executive Summary

The **Agnos Real-Time Patient System** is designed to streamline healthcare intake by providing real-time synchronization between patient-facing registration forms and clinic administrative monitoring dashboards. This document outlines the system architecture, component composition, responsive design guidelines, and real-time WebSocket protocol specifications.

---

## 1. Project Structure & Clean Architecture Boundaries

To ensure long-term maintainability, testability, and decoupling of concerns, the system strictly implements **Clean Architecture** principles across 5 isolated layer boundaries.

```
../nextjs-realtime-patient-form/
├── src/
│   ├── domain/               # [Layer 1] Pure Domain Business Logic & Schemas
│   ├── infrastructure/       # [Layer 2] External Gateway Adapters & Storage Repositories
│   ├── presentation/         # [Layer 3] UI Components, Custom Hooks, & Next.js Pages
│   └── core/                 # [Layer 4] Shared Utility Functions, Tokens, & Constants
└── server/                   # [Layer 5] Standalone Monorepo Socket.io Gateway Server
```

### Layer Responsibility Matrix

| Layer Boundary | Directory Location | Dependencies Allowed | Core Responsibilities |
|---|---|---|---|
| **Domain Layer** | `src/domain/` | Zod only (Zero UI / Next.js dependencies) | Defines business entities, value objects, DTO interfaces, and validation schemas (`patientSchema.ts`). Enforces 9 required & 3 optional field rules. |
| **Infrastructure Layer** | `src/infrastructure/` | Domain layer, `socket.io-client` | Wraps external communication channels (`socketClient.ts`), browser storage adapters (`draftRepository.ts`), and API adapters. Isolates side effects. |
| **Presentation Layer** | `src/presentation/` | Domain, Infrastructure, Core, React, Next.js | Handles rendering and user interaction. Composes UI primitives (`components/ui/`), patient intake forms (`components/patient/`), staff dashboards (`components/staff/`), and custom form hooks (`usePatientForm`). |
| **Core Layer** | `src/core/` | Zero external dependencies | Cross-cutting concerns, class name merger (`cn.ts`), socket event constants (`socketEvents.ts`), design system tokens (`tokens.ts`). |
| **Server Gateway** | `server/` | Express, Socket.io, CORS | Standalone Node.js WebSocket backend server. Manages in-memory patient state Map, room broadcasting (`staff`), and client connection lifecycles. |

---

## 2. Design Decisions & UI/UX Responsiveness Strategy

Healthcare intake systems must operate seamlessly across a wide variety of devices: patient personal mobile phones, clinical tablets, and high-resolution desktop workstations. The UI design follows a **mobile-first, grid-adaptive layout strategy**.

### Viewport Adaptation Breakdown

| Viewport Tier | Resolution Range | Primary Target Device | Layout Strategy & Component Adaptations |
|---|---|---|---|
| **Mobile** | `375px` to `767px` | Patient Smartphones (iOS / Android) | - Single-column vertical form flow (`grid-cols-1`).<br>- Touch-optimized tap targets (minimum 44px height for inputs and buttons).<br>- Full-screen mobile slide-over drawer for Staff Form Inspector.<br>- Stacked KPI summary cards on Staff View. |
| **Tablet** | `768px` to `1023px` | Clinic Check-In Kiosks & iPad Devices | - 2-column input field grids for personal & contact information.<br>- 2-column KPI stats cards (`grid-cols-2`).<br>- Scrollable horizontal table for staff patient list with sticky status columns. |
| **Desktop** | `1024px` and above | Desktop Administrative Workstations | - Centered max-width form container (`max-w-4xl`).<br>- 4-column KPI stats grid (`grid-cols-4`).<br>- Split-view dashboard: 2-column main table view + persistent right-hand side Live Form Inspector drawer. |

### Color System & Status Badging Standard

The color palette adheres to standard clinical UX guidelines, utilizing neutral slate background tones paired with distinct, accessible status badge highlights:

- **Actively Filling In**: `bg-blue-50 text-blue-700 border-blue-200` with an animated blue pulsing indicator dot (`animate-pulse`). Signals ongoing patient activity.
- **Inactive**: `bg-slate-100 text-slate-700 border-slate-200`. Signals 3+ seconds of typing inactivity or temporary socket disconnect.
- **Submitted**: `bg-emerald-50 text-emerald-700 border-emerald-200` with an emerald check icon. Signals complete, validated intake submission.

---

## 3. Component Architecture & State Management

### Component Tree Hierarchy

```
App Router (`src/app/`)
├── RootLayout (`layout.tsx`)
│   ├── Portal Landing Page (`page.tsx`)
│   ├── Patient Intake Route (`patient/page.tsx`)
│   │   └── PatientForm Component (`src/presentation/components/patient/PatientForm.tsx`)
│   │       ├── ConnectionStatusBadge (`src/presentation/components/ui/badge.tsx`)
│   │       ├── Section Header Card (`src/presentation/components/ui/card.tsx`)
│   │       ├── Form Fields (Input, Select, DatePicker, Textarea)
│   │       └── Locked Submit Overlay
│   └── Staff Dashboard Route (`staff/page.tsx`)
│       └── StaffDashboard Component (`src/presentation/components/staff/StaffDashboard.tsx`)
│           ├── KPI Overview Cards (Total Patients, Actively Filling, Inactive, Submitted)
│           ├── Filterable Live Patient Table (`src/presentation/components/ui/table.tsx`)
│           │   └── PatientTableRow (Live Status Badges & Action Buttons)
│           └── Live Form Inspector Drawer (Real-time form mirror)
```

### State Management Architecture

Form state and real-time side effects are cleanly encapsulated inside the custom hook `usePatientForm.ts`:

1. **Client Validation State**: Managed via `react-hook-form` bound with `@hookform/resolvers/zod` using the strict `patientSchema`.
   - **9 Required Fields**: `firstName`, `lastName`, `dateOfBirth`, `gender`, `phoneNumber` (9-15 digits regex), `email` (valid email regex), `address`, `preferredLanguage`, `nationality`.
   - **3 Optional Fields**: `middleName`, `emergencyContact` (nested object: `name`, `relationship`, `phoneNumber`), `religion`.
2. **Persistent Patient Identification**: Generates or retrieves a persistent patient ID (`PAT-xxxxxxx`) stored in `localStorage` to ensure continuity across reloads.
3. **Local Storage Synchronization**: Executes `draftRepository.saveLocalDraft()` on every field change, guaranteeing offline draft resilience.

---

## 4. Real-Time Synchronization Flow & Protocol Specs

### WebSocket Gateway Architecture (`server/index.js`)

The real-time layer operates over Socket.io 4.8 using dual transport fallback (`websocket`, `polling`). The server maintains two primary in-memory maps:
- `patients`: `Map<patientId, { patientId, socketId, status, data, submittedAt, lastUpdated }>`
- `socketToPatient`: `Map<socketId, patientId>`

### Complete Event Catalog

```
PATIENT CLIENT                           SOCKET.IO GATEWAY                           STAFF DASHBOARD
      │                                         │                                          │
      │─── 1. patient:join {patientId} ────────>│                                          │
      │                                         │─── 2. staff:all_patients [patients] ────>│
      │<── 3. patient:draft_sync {data, status}─│                                          │
      │                                         │                                          │
      │─── 4. patient:field_update {field,val}─>│                                          │
      │                                         │─── 5. staff:receive_update {field,val}──>│
      │                                         │                                          │
      │─── 6. patient:status_change {status}───>│                                          │
      │                                         │─── 7. staff:status_change {status}──────>│
      │                                         │                                          │
      │─── 8. patient:submit {data}────────────>│                                          │
      │                                         │─── 9. staff:patient_submitted {patient}─>│
```

| Event Name | Direction | Payload Interface | Operational Purpose |
|---|---|---|---|
| `patient:join` | Client -> Server | `PatientJoinPayload` | Registers patient socket connection with `patientId`. |
| `patient:draft_sync` | Server -> Client | `PatientDraftSyncPayload` | Sends existing server draft data & status back to joining patient. |
| `patient:field_update` | Client -> Server | `PatientFieldUpdatePayload` | Emits single field input change (debounced 200ms). |
| `staff:receive_update` | Server -> Staff | `StaffReceiveUpdatePayload` | Broadcasts single field update to staff dashboards. |
| `patient:status_change`| Client -> Server | `PatientStatusChangePayload` | Emits lifecycle status updates (`actively_filling_in`, `inactive`, `submitted`). |
| `staff:status_change`  | Server -> Staff | `StaffStatusChangePayload` | Updates patient status badge in real time on staff table. |
| `patient:submit`       | Client -> Server | `PatientSubmitPayload` | Transmits final validated form submission data. |
| `staff:patient_submitted` | Server -> Staff | `StaffPatientSubmittedPayload` | Notifies staff of completed submission & moves record to submitted state. |
| `staff:join`           | Staff -> Server | void | Staff client joins the `staff` broadcasting room. |
| `staff:all_patients`   | Server -> Staff | Array of Patient Records | Sends full list of active and submitted patients on staff join. |

---

### Debouncing & Inactivity Control Flow

To balance network efficiency with instantaneous UI feedback, `usePatientForm.ts` implements a dual-timer mechanism:

1. **200ms Per-Field Debounce Buffer**:
   ```typescript
   // Store field timer references in a mutable ref object
   if (debounceTimers.current[field]) {
     clearTimeout(debounceTimers.current[field]);
   }
   debounceTimers.current[field] = setTimeout(() => {
     if (patientId && isConnected) {
       emitPatientFieldUpdate({ patientId, field, value });
     }
   }, 200);
   ```
2. **3000ms Inactivity Timer & 3-State Tracking**:
   - **`actively_filling_in` Trigger**: Fired immediately when user begins typing or interacting with form inputs. Sends status change event and resets the 3000ms timer ref.
   - **`inactive` Trigger**: Fired automatically when 3000ms elapses without any new keystrokes, or when the client socket disconnects.
   - **`submitted` Trigger**: Fired upon clicking submit after successful Zod schema validation. Clears inactivity timers, locks inputs, clears local storage draft, and sets status permanently to `submitted`.

---

## 5. Verification & Testing Matrix

To guarantee quality compliance, all changes must pass static type checking and production builds:

```bash
# Step 1: Execute TypeScript compiler check (Must return 0 errors)
npx tsc --noEmit

# Step 2: Execute Next.js production build (Must complete with Exit Code 0)
npm run build
```

---

*End of Architecture Planning Document.*
