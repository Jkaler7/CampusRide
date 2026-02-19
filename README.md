# CampusRide - Smart College Bus Management System

## Overview

CampusRide is a full-stack web application for college bus coordination. It provides digital bus passes, bus arrival tracking, boarding confirmation, parking location updates, seat availability, and notifications. The system serves three user roles: Students, Drivers, and Admins. It replaces manual communication (WhatsApp groups, Google Forms) with a centralized, low-bandwidth dashboard.

Key features:
- **Digital Bus Pass**: Students apply for transport passes; admins approve/reject; approved passes generate a QR code displayed in the student's profile
- **Bus Tracking**: Drivers update bus status (stop progress, parking location); students see real-time status
- **Attendance**: Boarding confirmation system per bus per day
- **Notices**: Admin-posted announcements with categories (general, schedule, emergency, fest)
- **Role-based Dashboards**: Different views and capabilities for students, drivers, and admins

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React SPA)
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: `wouter` (lightweight alternative to React Router)
- **State/Data Fetching**: TanStack React Query for server state management with custom hooks per resource (`use-auth`, `use-buses`, `use-passes`, `use-notices`, `use-routes`)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Forms**: react-hook-form with Zod schema validation via `@hookform/resolvers`
- **QR Codes**: `qrcode.react` for client-side bus pass QR generation
- **Design System**: Custom "student-friendly" theme using CSS variables (DM Sans body font, Space Grotesk display font), blue primary + yellow secondary palette, large touch targets, responsive mobile-first layout
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (Express + Node.js)
- **Framework**: Express.js with TypeScript, run via `tsx` in development
- **Authentication**: Passport.js with `passport-local` strategy, express-session for session management
- **API Design**: All API routes defined under `/api/` namespace. Route contracts are defined in `shared/routes.ts` with Zod schemas for input validation and response types
- **Password Storage**: Currently plaintext comparison (not hashed) — this is a known simplification

### Shared Layer (`shared/`)
- **Schema** (`shared/schema.ts`): Drizzle ORM table definitions and Zod insert schemas (via `drizzle-zod`). Tables: `users`, `routes`, `buses`, `busPasses`, `notices`, `attendance`
- **Routes** (`shared/routes.ts`): API contract definitions with method, path, input/output Zod schemas — used by both client hooks and server route handlers

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Driver**: `@neondatabase/serverless` (Neon Postgres with WebSocket support)
- **Schema Push**: `drizzle-kit push` command (no migration files needed for dev)
- **Connection**: Requires `DATABASE_URL` environment variable pointing to a PostgreSQL instance
- **Storage Pattern**: `DatabaseStorage` class in `server/storage.ts` implements an `IStorage` interface, providing a clean abstraction over all database operations

### Build System
- **Development**: Vite dev server with HMR proxied through Express (via `server/vite.ts`)
- **Production Build**: `script/build.ts` uses Vite for client build and esbuild for server bundle. Client outputs to `dist/public/`, server outputs to `dist/index.cjs`
- **SPA Fallback**: `server/static.ts` serves the built client and falls back to `index.html` for client-side routing

### Key Database Tables
- **users**: Stores students, drivers, admins. Username doubles as roll number for students. Has role enum.
- **routes**: Bus routes with array of stop names
- **buses**: Bus records linked to routes and drivers, with live status and parking location
- **busPasses**: Transport pass applications with status workflow (pending → approved/rejected/expired), linked to user, route, and optionally bus
- **notices**: Announcements with title, content, category (general/schedule/emergency/fest), and priority
- **attendance**: Daily boarding records per user per bus

## External Dependencies

### Database
- **PostgreSQL** via Neon Serverless (`@neondatabase/serverless`) — requires `DATABASE_URL` environment variable

### Authentication
- **express-session** for session cookies
- **passport** + **passport-local** for username/password authentication
- `SESSION_SECRET` environment variable (falls back to "secret" in development)

### Key npm Packages
- **drizzle-orm** + **drizzle-kit**: Database ORM and schema management
- **@tanstack/react-query**: Async state management
- **shadcn/ui ecosystem**: Radix UI primitives, class-variance-authority, tailwind-merge, clsx
- **qrcode.react**: QR code generation for digital bus passes
- **date-fns**: Date formatting
- **zod**: Schema validation (shared between client and server)
- **framer-motion**: Animations (listed in requirements)
- **lucide-react**: Icon library
