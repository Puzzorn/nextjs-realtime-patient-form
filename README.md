# CareSync Real-Time Patient System

A production-grade, real-time patient registration intake application and staff monitoring dashboard built with **Next.js 15 (App Router)**, **React 19**, **TypeScript 5.7**, **TailwindCSS 3.4**, **Zod**, **React Hook Form**, and **Socket.io 4.8**.

---

## 📌 Project Overview

The **CareSync Real-Time Patient System** addresses the critical operational challenge of patient intake delays and data entry bottlenecks in healthcare environments. By establishing a bidirectional WebSocket gateway between patient mobile devices and clinic administrative dashboards, staff members gain instant visibility into patient registration progress as it happens.

### Key Architectural Pillars
- **Dual-Portal Architecture**:
  - **Patient Intake Portal (`/patient`)**: A mobile-first, sectioned intake form with instant validation, autosave resilience, and keystroke streaming.
  - **Staff Monitoring Portal (`/staff`)**: A real-time administrative command center rendering live KPI metrics, dynamic status badges, filterable registration tables, and an interactive side-drawer form inspector.
- **Live Field Streaming**: Form keystrokes are buffered via a 200ms client-side debounce algorithm and streamed over Socket.io, allowing staff to monitor patient progress field-by-field.
- **3-State Patient Lifecycle**: Automated transition tracking between three distinct operational states: `actively_filling_in` (blue pulsing badge), `inactive` (slate neutral badge), and `submitted` (emerald success badge).
- **Clean Architecture Boundaries**: Strict separation of concerns isolating pure domain business logic from infrastructure adapters, custom hooks, UI primitives, and the standalone real-time backend gateway.

---

## 🛠️ Tech Stack

| Layer / Domain | Technology | Version | Description |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | `15.1.7` | Server/Client components, optimized client routing, app layout |
| **UI Library & React** | React | `19.0.0` | React 19 hooks, concurrent rendering capabilities |
| **Type Safety** | TypeScript | `5.7.3` | Strict type checking, shared domain models, DTO interfaces |
| **Styling & Icons** | TailwindCSS & Lucide | `3.4.1` / `0.475.0` | Medical-grade design system, mobile-first responsive utility classes |
| **Form Management** | React Hook Form | `7.54.2` | High-performance uncontrolled form handling with Zod validation |
| **Schema Validation** | Zod | `3.24.2` | Type-safe runtime validation schema for 9 required & 3 optional fields |
| **Resolver Integration** | `@hookform/resolvers` | `3.10.0` | Seamless bridge connecting React Hook Form with Zod schemas |
| **Real-Time Gateway** | Socket.io & Client | `4.8.1` | Bidirectional WebSocket engine for event streaming and state sync |
| **HTTP Server Gateway** | Express | `4.21.2` | Standalone Node.js server hosting Socket.io connection manager |
| **Class Utilities** | `clsx` & `tailwind-merge` | `2.1.1` / `3.0.1` | Conditional class joining and Tailwind utility overrides |
| **Client Storage** | HTML5 LocalStorage | Native | Persistent client-side draft cache (`draftRepository.ts`) |

---

## 🚀 Local Setup & Running Instructions

### Prerequisites
- **Node.js**: `v18.0.0` or higher (v20+ recommended)
- **npm**: `v9.0.0` or higher

---

### 1. Installation

Clone the repository and install dependencies for both the Next.js frontend application and the standalone backend gateway:

```bash
# Clone the repository
git clone https://github.com/Puzzorn/nextjs-realtime-patient-form.git
cd nextjs-realtime-patient-form

# Install root dependencies (Next.js Frontend)
npm install

# Install backend server dependencies
cd server
npm install
cd ..
```

---

### 2. Environment Configuration

Create local environment files for both the frontend and backend applications.

#### Frontend Environment (`.env.local` in root directory):
```env
# Socket.io gateway connection URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

#### Backend Environment (`server/.env` in `server/` directory):
```env
# Node server port (defaults to 4000)
PORT=4000

# Permitted CORS origin for Socket.io
CLIENT_ORIGIN=http://localhost:3000
```

---

### 3. Running Development Servers

To run the application locally, start both the standalone Socket.io gateway server and the Next.js development server:

```bash
# Terminal 1: Run Standalone Socket.io Gateway (Runs on http://localhost:4000)
npm run server:dev

# Terminal 2: Run Next.js Frontend Application (Runs on http://localhost:3000)
npm run dev
```

Once started, open your browser to:
- **Patient Intake Form**: `http://localhost:3000/patient`
- **Staff Monitoring Dashboard**: `http://localhost:3000/staff`
- **Portal Navigation Hub**: `http://localhost:3000/`

---

### 4. Code Quality & Build Verification

Run strict static type checks and execute the production Next.js build:

```bash
# TypeScript strict static type checking (must output 0 errors)
npx tsc --noEmit

# Production Next.js build execution
npm run build
```

---

## ✨ Bonus Features & UX Innovations

1. **LocalStorage Draft Resilience (`draftRepository.ts`)**:
   - Automatically saves unsubmitted patient form progress to browser `localStorage`.
   - On page refresh or accidental tab closure, the form seamlessly restores previous field values without losing patient progress.
2. **200ms Debounced Keystroke Streaming (`usePatientForm.ts`)**:
   - Field updates are debounced by 200ms per input field before emitting `patient:field_update` over WebSockets.
   - Prevents gateway network congestion while maintaining instantaneous visual synchronization on staff monitoring dashboards.
3. **Automated 3-Second Inactivity Detection**:
   - Active typing sets patient status to `actively_filling_in` and kicks off a 3000ms inactivity countdown.
   - If no keystrokes are detected within 3 seconds, the system automatically emits a status update transitioning the patient to `inactive`.
4. **Interactive Staff Live Form Inspector (`StaffDashboard.tsx`)**:
   - Staff members can click "Inspect Draft" on any live patient record in the dashboard table.
   - Opens a sliding side-drawer panel rendering a real-time mirror of the patient's incoming intake form, including field-by-field progress indicators.
5. **Form Submission Input Locking**:
   - Upon successful form submission, all form input fields, select dropdowns, and date pickers are immediately disabled.
   - Shows a clean confirmation view preventing post-submission edits or duplicate entries.
6. **Graceful Socket Disconnection Recovery**:
   - Handles network dropouts gracefully. If a patient closes their browser tab or loses connection, the server automatically updates their dashboard status to `inactive`.

---

## 🏛️ Architecture & Project Structure Overview

```
../nextjs-realtime-patient-form/
├── src/
│   ├── app/                      # Next.js 15 App Router pages & layouts
│   │   ├── page.tsx              # Main portal navigation hub
│   │   ├── patient/page.tsx      # Patient intake form page
│   │   └── staff/page.tsx        # Staff monitoring dashboard page
│   ├── domain/                   # Business Entities, Value Objects, Zod Schemas
│   │   └── patientSchema.ts      # 9 required & 3 optional field validation schema + Socket DTOs
│   ├── infrastructure/           # External System Adapters & Repositories
│   │   ├── websocket/
│   │   │   └── socketClient.ts   # Typed Socket.io client wrapper & event subscriptions
│   │   └── storage/
│   │       └── draftRepository.ts# LocalStorage persistence repository for client drafts
│   ├── presentation/             # UI Components, Layouts, & Presentation Hooks
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI primitives (Button, Input, Select, Badge, Card, etc.)
│   │   │   ├── patient/          # PatientForm & sub-components
│   │   │   └── staff/            # StaffDashboard & Live Inspector drawer components
│   │   └── hooks/
│   │       ├── usePatientForm.ts # Form state, 200ms debounce, 3s inactivity, & socket sync logic
│   │       └── useSocketConnection.ts # Socket connection state monitor
│   └── core/                     # Shared Constants, Utilities, & Design Tokens
│       ├── constants/
│       │   └── socketEvents.ts   # Centralized WebSocket event string constants
│       ├── theme/
│       │   └── tokens.ts         # Theme tokens and badge styling maps
│       └── utils/
│           └── cn.ts             # Tailwind class merging utility (`clsx` + `tailwind-merge`)
├── server/                       # Standalone Backend Gateway Monorepo Directory
│   ├── index.js                  # Express & Socket.io server with in-memory state store
│   └── package.json              # Server dependencies (express, socket.io, cors)
├── docs/
│   └── PLANNING.md               # Detailed architectural design & technical specifications
├── README.md                     # Maintainer-ready project documentation
└── package.json                  # Root Next.js application dependencies & scripts
```
