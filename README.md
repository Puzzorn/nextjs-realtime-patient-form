# Agnos Real-Time Patient System

A modern Next.js real-time patient registration form application built with TypeScript, TailwindCSS, Zod, React Hook Form, and Socket.io.

## Clean Architecture Overview

This project strictly adheres to **Clean Architecture** boundaries, isolating domain logic, infrastructure concerns, user interface, and shared core utilities.

```
src/
├── presentation/        # UI components, Next.js App Router pages/views, ViewModels, Hooks
├── domain/              # Entities, Value Objects, Zod schemas (patientSchema.ts), DTO Interfaces
├── infrastructure/      # Socket.io client wrapper (socketClient.ts), Repositories, API adapters
└── core/                # Shared constants (socketEvents.ts), utilities (cn.ts), theme configuration
server/                  # Monorepo standalone Node.js / Socket.io real-time server gateway
```

### Layer Responsibilities

1. **`src/domain/`**: Contains core business rules, entity models, data transfer object (DTO) interfaces, and validation schemas (`patientSchema.ts`). Has zero dependencies on UI or external infrastructure.
2. **`src/infrastructure/`**: Handles external integrations such as WebSockets (`socketClient.ts`), browser storage (`draftRepository.ts`), and API adapters.
3. **`src/presentation/`**: Handles rendering and user interaction using React components, custom form hooks (`usePatientForm`), socket event listeners (`useSocketConnection`), and Next.js App Router layouts.
4. **`src/core/`**: Shared utilities (such as `cn` helper combining `clsx` and `tailwind-merge`), event constants (`socketEvents.ts`), and app configuration.
5. **`server/`**: Standalone Node.js Express & Socket.io server operating on port 4000. Handles real-time draft synchronization, field-level broadcast updates, and final submissions.

---

## Real-Time Socket.io Server Documentation (`server/`)

The real-time gateway runs independently under `server/` with its own `package.json`.

### Events Handled
- `patient:draft_sync` (Client -> Server / Server -> Client): Synchronizes current form draft state upon socket connection.
- `patient:field_update` (Client -> Server / Server -> Client): Broadcasts single field changes in real time across active clients.
- `patient:submit` (Client -> Server / Server -> Client): Emits final submitted patient registration data to connected clients.

### Server Commands
```bash
# Start standalone Socket.io server in development mode (with nodemon)
npm run server:dev

# Start standalone Socket.io server in production mode
npm run server:start
```

---

## Setup & Running Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation
```bash
# Install root dependencies (Next.js app)
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### Development
```bash
# Run Next.js frontend (http://localhost:3000)
npm run dev

# Run Socket.io server (http://localhost:4000)
npm run server:dev
```

### Verification & Production Build
```bash
# Run TypeScript static type check
npx tsc --noEmit

# Run Next.js production build
npm run build
```
