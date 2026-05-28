# Pomodoro

Most people struggle to stay focused for long stretches — distractions pile up, breaks get skipped, and it's hard to know how much deep work you actually did in a day. Pomodoro fixes this by structuring your time into alternating focus and break intervals, so you work in deliberate sprints instead of grinding until burnout.

This app takes the classic technique further: instead of a fixed 25-minute timer, you choose from four session templates scaled to the kind of work you're doing — a quick 15-minute burst, a standard Pomodoro, a long hybrid block, or a full deep-work marathon. You can chain multiple template blocks together into a custom session and loop it automatically. Completed blocks earn stars, giving you a tangible record of how much focused work you've put in across each session type.

A full-stack Pomodoro timer with customizable focus sessions, email-verified 2FA auth, and a star achievement system.

---

## What it does

Users create an account, verify their email with a 6-digit OTP, and land on a personal dashboard where their saved timers live. Each timer has a title, optional description, an ordered list of template blocks, and an optional auto-restart toggle. Starting a timer opens the full-screen focus view: an animated gradient background, an SVG ring countdown, a phase label (Focus / Break), and a block progress bar. When every block in a session completes, the server awards a star for each finished block and the user is returned to the dashboard.

Everything is scoped to the authenticated user — you can never see or touch another user's timers or stars.

---

## Features

- **4 focus templates** — Short (74 min), Standard (130 min), Hybrid (215 min), Deep Work (300 min), each with alternating focus and break phases
- **Custom sessions** — combine up to 10 template blocks in any order to build a session as long or short as you need
- **Auto-restart** — toggle a timer to loop indefinitely until you stop it manually
- **Email-verified auth** — both signup and login require a 6-digit OTP delivered by email; the code expires in 5 minutes and is single-use
- **HTTPS everywhere** — dev server and API both run over TLS via mkcert; the `secure` cookie flag is always set so the JWT is never transmitted over plain HTTP in any environment
- **Stars** — one star per completed block, counted separately per template type, shown as a badge strip on the dashboard
- **Animated focus screen** — a shifting gradient background, SVG ring progress, and smooth transitions between focus and break phases
- **Full REST API** — all timer and star operations are available as JSON endpoints, authenticated via the same httpOnly session cookie as the web UI

---

## Tech Stack

| Concern | Technology |
|---|---|
| Backend | Node.js, Fastify 4, TypeScript 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Cache / rate-limit | Redis 7 (ioredis) |
| Auth | JWT in httpOnly + secure cookies over HTTPS (@fastify/jwt, mkcert in dev) |
| Email | SendGrid (@sendgrid/mail) |
| Password hashing | bcrypt (12 rounds) |
| Frontend | React 18 + TypeScript + Vite 6 |
| Styling | Tailwind CSS v3 |
| Data fetching | TanStack Query v5 + Axios |
| Routing | React Router v6 |
| Client state | Zustand (auth + focus session) |
| Infrastructure | Docker Compose (Postgres + Redis) |

---

## API

All auth, timer, and star endpoints sit under `/api/v1`. A `GET /health` endpoint exists at the root for uptime checks and is not versioned. Authentication uses an `httpOnly` cookie named `token` (issued by `POST /auth/verify-code`). There is no separate token-issuance endpoint for bearer tokens — the session cookie covers both the web UI and direct API use from a browser.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | — | Register (username, email, password) |
| `POST` | `/auth/login` | — | Validate credentials, send OTP |
| `POST` | `/auth/verify-code` | — | Submit OTP, receive JWT cookie |
| `POST` | `/auth/send-code` | — | Resend OTP — rate-limited to 1/min per email |
| `GET` | `/auth/me` | ✓ | Get the authenticated user's profile |
| `POST` | `/auth/logout` | ✓ | Clear the session cookie |

### Timers

All routes require authentication.

| Method | Path | Description |
|---|---|---|
| `GET` | `/timers` | List the user's timers (newest first) |
| `POST` | `/timers` | Create a timer (`title`, `blocks[]`, `description?`, `autoRestart?`) |
| `GET` | `/timers/:id` | Get a single timer |
| `PATCH` | `/timers/:id` | Update any timer fields |
| `DELETE` | `/timers/:id` | Delete a timer |

Every timer response includes: `id`, `userId`, `title`, `description`, `autoRestart`, `blocks`, `createdAt`, `updatedAt`.

### Stars

| Method | Path | Description |
|---|---|---|
| `GET` | `/stars` | Get star counts keyed by template type |
| `POST` | `/stars/award` | Increment the star count for a `templateType` |

The `GET /stars` response always returns all four template keys, zeroed if the user has no stars yet:

```json
{ "stars": { "short": 0, "standard": 3, "hybrid": 0, "deep_work": 1 } }
```

### System

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Liveness check — returns `{ "ok": true }` |

---

## Database schema

**users** — `id`, `username` (unique), `email` (unique), `passwordHash`, `isVerified`, `createdAt`, `updatedAt`

**timers** — `id`, `userId` (FK → users), `title`, `description`, `autoRestart`, `blocks` (TemplateType[]), `createdAt`, `updatedAt`

**stars** — `id`, `userId` (FK → users), `templateType`, `count` — unique on `(userId, templateType)`

**TemplateType enum:** `short` | `standard` | `hybrid` | `deep_work`

---

## Template definitions

Phases alternate focus → break. All values in minutes. Even indices are focus, odd indices are breaks.

| Template | Phases | Total |
|---|---|---|
| Short | 15 · 3 · 15 · 3 · 15 · 3 · 15 · 5 | 74 min |
| Standard | 25 · 5 · 25 · 5 · 25 · 5 · 25 · 15 | 130 min |
| Hybrid | 40 · 10 · 40 · 10 · 40 · 10 · 40 · 25 | 215 min |
| Deep Work | 60 · 10 · 60 · 10 · 60 · 10 · 60 · 30 | 300 min |

---

## Running locally

### Prerequisites

- Node.js 18+
- Docker + Docker Compose
- A [SendGrid](https://sendgrid.com) account with a verified sender address
- [mkcert](https://github.com/FiloSottile/mkcert) for locally-trusted HTTPS certificates

### 1. Clone and install

```bash
git clone <repo-url>
cd Pomodoro
npm install
```

### 2. Generate local HTTPS certificates

The app runs HTTPS in development so the `secure` cookie flag is enforced locally. `mkcert` issues certificates that your OS and browser trust without any security warnings.

```bash
# Install mkcert and register its root CA with your system trust store (once per machine)
brew install mkcert   # macOS — use choco install mkcert on Windows, apt install mkcert on Debian/Ubuntu
mkcert -install

# Generate the certs (run from the repo root)
mkdir -p certs
mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1
```

The `certs/` directory is gitignored — the private key must not be committed.

### 3. Configure environment

Copy `.env.example` to `server/.env` and `client/.env`:

```env
# server/.env
DATABASE_URL=postgresql://pomodoro:pomodoro@localhost:5432/pomodoro
REDIS_URL=redis://localhost:6379
JWT_SECRET=<at least 32 random characters>
SENDGRID_API_KEY=<your SendGrid API key>
SENDGRID_FROM_EMAIL=<your verified sender address>
CLIENT_ORIGIN=https://localhost:5173
PORT=3000
NODE_ENV=development
```

```env
# client/.env
VITE_API_BASE_URL=https://localhost:3000/api/v1
```

> `JWT_SECRET` must be at least 32 characters — the server will exit on startup if it is not.

### 4. Start infrastructure

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432 and Redis on port 6379, both with persistent volumes.

### 5. Set up the database

```bash
cd server
npm run db:generate   # generate the Prisma client
npm run db:migrate    # run migrations
```

### 6. Start the app

Open two terminals:

```bash
# Terminal 1 — API server (https://localhost:3000)
npm run dev:server

# Terminal 2 — React dev server (https://localhost:5173)
npm run dev:client
```

The app is at **https://localhost:5173**. The `CLIENT_ORIGIN` in `server/.env` must match the exact origin the browser uses, otherwise CORS will block all API requests.

---

## Scripts

| Location | Command | Description |
|---|---|---|
| root | `npm run dev:server` | Start Fastify with hot reload (tsx watch) |
| root | `npm run dev:client` | Start Vite dev server |
| `server/` | `npm run build` | Compile TypeScript to `dist/` |
| `server/` | `npm start` | Run the compiled server |
| `server/` | `npm run db:generate` | Regenerate the Prisma client |
| `server/` | `npm run db:migrate` | Apply pending migrations (dev only) |
| `server/` | `npm run migrate:prod` | Apply pending migrations (production) |
| `server/` | `npm run db:studio` | Open Prisma Studio |
| `client/` | `npm run build` | Production build |
| `client/` | `npm run preview` | Preview the production build locally |

---

## Auth flow

```
Signup:  POST /auth/signup  →  OTP emailed  →  POST /auth/verify-code  →  JWT cookie  →  dashboard
Login:   POST /auth/login   →  OTP emailed  →  POST /auth/verify-code  →  JWT cookie  →  dashboard
```

Verification codes are 6-digit integers (100000–999999) stored in Redis with a 5-minute TTL. The code is deleted immediately after a successful verification so it cannot be reused. The resend endpoint is rate-limited to one request per email address per minute.

---

## Project structure

```
Pomodoro/
├── docker-compose.yml        # PostgreSQL 16 + Redis 7
├── package.json              # npm workspaces root
│
├── server/
│   ├── src/
│   │   ├── index.ts          # Server entry point
│   │   ├── app.ts            # Fastify app factory (plugins + routes)
│   │   ├── config/
│   │   │   ├── env.ts        # Zod env schema — exits on invalid config
│   │   │   └── templates.ts  # Phase minute arrays per template type
│   │   ├── plugins/          # cors, cookie, jwt, prisma, redis
│   │   ├── middleware/
│   │   │   └── authenticate.ts  # JWT preHandler, augments request.user
│   │   ├── routes/
│   │   │   ├── auth/         # signup, login, verify-code, send-code, me, logout
│   │   │   ├── timers/       # CRUD
│   │   │   └── stars/        # list + award
│   │   ├── services/
│   │   │   ├── authService.ts   # bcrypt hash/compare, code generator
│   │   │   └── emailService.ts  # SendGrid dispatch
│   │   └── utils/
│   │       ├── errors.ts        # Typed Fastify error helpers
│   │       └── redisKeys.ts     # Centralised Redis key templates
│   └── prisma/
│       └── schema.prisma
│
└── client/
    └── src/
        ├── main.tsx          # React entry point
        ├── App.tsx           # QueryClient + RouterProvider
        ├── router.tsx        # Route tree, ProtectedRoute wrapper
        ├── types/            # Shared TypeScript interfaces
        ├── constants/
        │   └── templates.ts  # Client-side copy of template definitions
        ├── api/              # Axios client, auth/timers/stars wrappers
        ├── stores/
        │   ├── authStore.ts  # Zustand: current user
        │   └── focusStore.ts # Zustand: all timer countdown state
        ├── hooks/
        │   └── useCountdown.ts  # RAF ticker, star award on block complete
        ├── pages/            # Landing, Login, Signup, Verify, Dashboard, Create, Edit, Focus
        └── components/
            ├── focus/        # PhaseBackground, PhaseDisplay, PhaseLabel, BlockProgress
            ├── layout/       # Navbar, ProtectedRoute
            ├── timer/        # TimerCard, BlockBuilder, BlockBadge, DemoTimer
            └── ui/           # Button, Input, Modal, StarBadge
```

---

## Design decisions worth noting

- **Client-side timer state** — all countdown logic lives in Zustand (`focusStore`). The server is only involved when a block completes and a star is awarded. Closing the tab loses current progress; the trade-off is zero server load during a focus session and no polling.
- **httpOnly + secure cookie JWT** — the JWT is never exposed to JavaScript (`httpOnly`) and is never sent over plain HTTP (`secure: true`). In development, mkcert issues a locally-trusted TLS cert used by both Fastify and the Vite dev server; in production, Railway terminates TLS at the edge so the browser always sees HTTPS even though the app container runs plain HTTP internally. `withCredentials: true` on the Axios client and `credentials: true` on CORS are both required for cross-origin cookie delivery.
- **Two-step auth for both signup and login** — every login requires an OTP, not just signup. This turns the app into 2FA by default, at the cost of one extra email per login.
- **Single-use OTP with immediate deletion** — the Redis key is deleted the moment the code is verified, preventing replay attacks even within the 5-minute TTL window.
- **No session persistence on the client** — `authStore` is plain Zustand with no localStorage. A hard refresh triggers a fresh `GET /auth/me` via `ProtectedRoute`; if the cookie is still valid, the user is restored silently.
- **RAF ticker instead of setInterval** — `useCountdown` uses `requestAnimationFrame` with a wall-clock comparison (`Date.now()`) for the 1-second tick. This stays accurate if the browser throttles `setInterval` in background tabs.
- **Ownership checked in the route, not a global guard** — timer routes manually verify `timer.userId === request.user.sub` and return 403 on mismatch. There is no data leakage: a non-owner gets forbidden, not a 404 that would confirm the resource exists.
