# Schema — AI-Powered Form Builder

// Demo creds:
alice@schema.dev
Password123!

Schema is a full-stack, type-safe form builder. Create forms by hand or generate them with AI, organize them in team workspaces, publish them at a public URL (or embed them), collect responses, and track analytics in real time.

Built as a **Turborepo monorepo** with **end-to-end type safety**: a single tRPC router defines the API contract once, and both the Express backend and the Next.js frontend consume the exact same types — no codegen, no drift.

---

## Features

### Form building

- **14 field types** — `TEXT`, `LONG_TEXT`, `EMAIL`, `NUMBER`, `PHONE`, `WEBSITE`, `DATE`, `YES_NO`, `MULTIPLE_CHOICE`, `CHECKBOXES`, `DROPDOWN`, `RATING`, `PASSWORD`, `STATEMENT`
- **Drag-and-drop reordering** of fields, plus inline label editing
- **Field duplication** and **bulk import** (one question per line)
- **Logic jumps** — branch to another field, the next field, or submit, based on the answer
- **Scoring** — assign points per answer (quizzes, assessments)
- **Welcome & thank-you screens**, custom **redirect URL** after submission
- **Themes** — pick a visual style for the public form

### AI (Groq / Llama 3.3 70B)

- **Generate a full form from a text prompt** — title, description, and 4–12 typed fields
- **Improve a field label** — one-click rewrite to a clearer, friendlier question
- **Suggest next fields** — context-aware suggestions for what to add next
- All AI input is **sanitized and prompt-injection guarded** (HTML stripped, attack patterns fall back to a safe default), and output is **Zod-validated** before it touches the database

### Publishing & sharing

- **Public form pages** at a custom **slug** (`/f/:slug`) with reserved-slug protection
- **Embeddable iframe** (`/embed/:id`) with a drop-in `embed.js`
- **QR code** generation and PNG download
- **Draft auto-save** to `localStorage` with resume
- **Mobile swipe navigation** between questions

### Access control on forms

- **Password protection**
- **Response limit** (stop accepting after N submissions)
- **Expiry date/time** (stop accepting after a deadline)
- **Hidden fields** captured from URL query params (e.g. `?utm_source=…`)

### Workspaces & collaboration

- **Team workspaces** with **role-based access control**: `OWNER` › `ADMIN` › `EDITOR` › `VIEWER`
- **Email invitations** with secure tokens, 7-day expiry, and email-match verification on accept
- **Member management** — invite, remove, change role, leave, revoke pending invites (with owner/admin guardrails)
- Move forms between personal space and workspaces

### Templates

- Browse **public templates** by **category**
- **Publish a form as a template** / unpublish it
- **Clone** a template (or any public form) into your own account

### Analytics

- **Views**, **starts**, **submissions**, and **completion rate** per form (live, polled every 5s on the share tab)
- **Submission time-series** (last N days)
- **Admin stats** across all of a user's forms
- Response browsing with **date filtering**, pagination, and **XLSX export**

### Platform

- **End-to-end type safety** from DB → API → UI
- **Auto-generated OpenAPI docs** served via Scalar at `/docs`
- **JWT auth** in httpOnly cookies (30-day expiry)
- **Rate limiting** on public submission and AI endpoints

---

## Tech stack

| Layer         | Tech                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| Monorepo      | Turborepo, pnpm workspaces                                                      |
| Language      | TypeScript (strict)                                                             |
| Frontend      | Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, Radix UI, Motion |
| Data fetching | tRPC v11 + TanStack React Query                                                 |
| Backend       | Express 5, tRPC server adapter, `trpc-to-openapi` + Scalar                      |
| Database      | PostgreSQL 15, Drizzle ORM                                                      |
| Auth          | JWT (`jsonwebtoken`) + bcrypt, httpOnly cookies                                 |
| AI            | Groq SDK — `llama-3.3-70b-versatile`                                            |
| Validation    | Zod v4                                                                          |

---

## Repository layout

```
trpc/
├── apps/
│   ├── api/                  # Express server — mounts the tRPC router as REST + tRPC
│   │   └── src/
│   │       ├── index.ts      # HTTP server bootstrap
│   │       ├── server.ts     # Express app: CORS, rate limits, OpenAPI, /api + /trpc
│   │       └── env.ts        # Zod-validated env
│   └── web/                  # Next.js frontend
│       └── app/              # Routes (see "Frontend routes" below)
├── packages/
│   ├── trpc/                 # The API contract — shared by api + web
│   │   ├── server/           # routers, context, procedures, OpenAPI meta
│   │   └── client/           # inferred RouterInputs / RouterOutputs for the web app
│   ├── services/             # Business logic (user, form, form-field, submission, workspace, template)
│   ├── database/             # Drizzle schema (models/) + db client + migrations
│   ├── logger/               # Shared logger
│   ├── eslint-config/        # Shared ESLint flat configs (base / next-js / react-internal)
│   └── typescript-config/    # Shared tsconfig bases
├── docker-compose.yml        # Postgres 15
└── turbo.json
```

### Why the layers split this way

- **`packages/database`** owns the schema (Drizzle models) and the `db` client. Nothing else talks to Postgres directly.
- **`packages/services`** holds all business logic as plain classes (e.g. `UserService`, `FormService`). They take Zod-validated input, enforce authorization, and call the database. They are framework-agnostic — no knowledge of HTTP or tRPC.
- **`packages/trpc/server`** is the thin contract layer. Each router maps a procedure to a service method, attaches input/output Zod schemas, and declares OpenAPI metadata. `authenticatedProcedure` enforces auth; `publicProcedure` does not.
- **`packages/trpc/client`** re-exports the **inferred** input/output types so the frontend is typed against the live router with zero codegen.
- **`apps/api`** wires it all up over Express and exposes both a REST surface (`/api/...`, OpenAPI) and a tRPC surface (`/trpc`).
- **`apps/web`** is the UI; its hooks call the typed tRPC client.

---

## Request flow

```
Browser (Next.js)
  → tRPC React Query hook
    → HTTP request (cookies included)
      → Express (apps/api/src/server.ts)
        → CORS + rate limiter
        → createContext({ req, res })   // exposes getCookie/setCookie/clearCookie
        → tRPC procedure (packages/trpc/server/routes/*)
            → authenticatedProcedure middleware  // verifies JWT cookie → ctx.user
            → Zod input validation
            → Service method (packages/services/*)  // authz + business logic
            → Drizzle query (packages/database)
        → Zod output validation
  ← typed response
```

### Auth flow

1. `auth.createUserWithEmailAndPassword` / `auth.signInUserWithEmailAndPassword` — `UserService` hashes/verifies the password with bcrypt, signs a JWT (`{ id }`, 30-day expiry), and the procedure sets it as an **httpOnly `token` cookie** (`secure` + `sameSite=none` in production, `strict` otherwise).
2. Protected procedures use `authenticatedProcedure`, which reads the `token` cookie, verifies it, and injects `ctx.user = { id }`. Failure → `TRPCError UNAUTHORIZED`.
3. `auth.logout` clears the cookie.

### AI form-generation flow

1. Client calls `form.generateForm` with a prompt (rate-limited to 5/min/IP).
2. `FormService.generateFormWithAI` strips HTML, caps length to 500 chars, and runs an **injection-pattern check** — on a hit it substitutes a safe fallback prompt.
3. Groq (`llama-3.3-70b-versatile`) is called with a hardened system prompt and `response_format: json_object`.
4. The response is `JSON.parse`d and **validated against a Zod schema** (1–15 typed fields). Invalid output is rejected.
5. The form and its fields/options are inserted in the database; the new form `id` is returned.

---

## API surface

All procedures are available both as **tRPC** (`/trpc`) and as **REST** (`/api/...`, documented at `/docs`).

| Router         | Procedures                                                                                                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **health**     | `getHealth`                                                                                                                                                                                                                                      |
| **auth**       | `createUserWithEmailAndPassword`, `signInUserWithEmailAndPassword`, `getLoggedInUserInfo`, `logout`                                                                                                                                              |
| **form**       | `createForm`, `listForms`, `getForm`, `updateForm`, `deleteForm`, `cloneForm`, `archiveForm`, `listPublicForms`, `clonePublicForm`, `generateForm` (AI), `improveField` (AI), `suggestFields` (AI), `updateSlug`, `getFormBySlug`, `moveForm`    |
| **formField**  | `addField`, `listFields`, `updateField`, `deleteField`, `reorderFields`                                                                                                                                                                          |
| **submission** | `getPublicForm`, `submitForm`, `verifyFormPassword`, `recordEvent`, `listSubmissions`, `getAnalytics`, `getAdminStats`, `getSubmissionTimeSeries`                                                                                                |
| **workspace**  | `createWorkspace`, `listWorkspaces`, `getWorkspace`, `updateWorkspace`, `deleteWorkspace`, `inviteMember`, `acceptInvitation`, `removeMember`, `updateMemberRole`, `listMembers`, `leaveWorkspace`, `listPendingInvitations`, `revokeInvitation` |
| **template**   | `listCategories`, `listTemplates`, `getTemplate`, `publishAsTemplate`, `unpublishTemplate`, `cloneTemplate`                                                                                                                                      |

**Rate limits** (per IP): public submission endpoints 30/min (`recordEvent`, `verifyFormPassword`, `getPublicForm`) and 10/min (`submitForm`); AI endpoints 5/min (`generateForm`, `suggestFields`).

---

## Data model

| Table                   | Purpose                                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `users`                 | Accounts (email, fullName, passwordHash)                                                                                         |
| `forms`                 | Form definition + settings (status, visibility, slug, theme, password, expiry, maxResponses, hiddenFields, redirectUrl, screens) |
| `form_fields`           | Fields belonging to a form (type, label, labelKey, index, isRequired, logic, scores)                                             |
| `form_field_options`    | Options for choice-type fields                                                                                                   |
| `submissions`           | Submitted responses (JSON `data` keyed by field `labelKey`)                                                                      |
| `form_events`           | View/start events for analytics                                                                                                  |
| `workspaces`            | Team workspaces (name, slug, ownerId)                                                                                            |
| `workspace_members`     | Membership + role (`OWNER`/`ADMIN`/`EDITOR`/`VIEWER`)                                                                            |
| `workspace_invitations` | Pending invites (email, role, token, expiry, status)                                                                             |
| `template_categories`   | Template browsing categories                                                                                                     |

---

## Frontend routes (`apps/web/app`)

| Route                    | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `/`                      | Landing page                                         |
| `/signin`, `/signup`     | Auth (support `?redirect=` for invite flow)          |
| `/dashboard`             | Overview + admin stats                               |
| `/dashboard/forms`       | Form list (create, AI-create, clone, archive, move)  |
| `/dashboard/forms/[id]`  | Form editor — Build / Themes / Settings / Share tabs |
| `/dashboard/workspaces`  | Workspaces + members + invitations                   |
| `/form/[id]`             | Public form fill (also resolves by slug)             |
| `/form/[id]/submissions` | Responses table + analytics + XLSX export            |
| `/f/[slug]`              | Public form by slug                                  |
| `/embed/[id]`            | Iframe-embeddable form                               |
| `/invite/[token]`        | Accept a workspace invitation                        |
| `/templates`             | Browse and clone templates                           |
| `/pricing`               | Pricing page                                         |

---

## Getting started

### Prerequisites

- Node ≥ 18
- pnpm 9
- Docker (for Postgres) — or your own Postgres 15 instance

### 1. Install

```sh
pnpm install
```

### 2. Environment

Create a `.env` at the repo root:

```sh
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dev
NEXT_PUBLIC_API_URL=http://localhost:8000
WEB_URL=http://localhost:3000
JWT_SECRET=<a-long-random-secret>
GROQ_API_KEY=<your-groq-api-key>   # optional; required only for AI features
```

`setup.sh` links the root `.env` into each app/package:

```sh
./setup.sh
```

### 3. Database

```sh
pnpm db:up         # start Postgres via docker-compose
pnpm db:generate   # generate Drizzle migrations from the schema
pnpm db:migrate    # apply migrations
```

### 4. Develop

```sh
pnpm dev           # runs the API (:8000) and web (:3000) together via Turbo
```

- Web: http://localhost:3000
- API: http://localhost:8000
- API docs (Scalar): http://localhost:8000/docs

---

## Scripts

| Command            | What it does                              |
| ------------------ | ----------------------------------------- |
| `pnpm dev`         | Run all apps in dev (Turbo)               |
| `pnpm build`       | Production build of all apps/packages     |
| `pnpm check-types` | Type-check every package (`tsc --noEmit`) |
| `pnpm lint`        | Lint every package                        |
| `pnpm format`      | Prettier write                            |
| `pnpm db:up`       | Start Postgres (docker-compose)           |
| `pnpm db:generate` | Generate Drizzle migrations               |
| `pnpm db:migrate`  | Apply migrations                          |

---

## Environment variables

| Var                   | Used by  | Required  | Notes                                                                |
| --------------------- | -------- | --------- | -------------------------------------------------------------------- |
| `DATABASE_URL`        | database | ✅        | Postgres connection string                                           |
| `JWT_SECRET`          | services | ✅        | Secret for signing JWTs                                              |
| `WEB_URL`             | api      | ✅ (prod) | Frontend origin for CORS; defaults to `http://localhost:3000`        |
| `BASE_URL`            | api      | —         | API base for OpenAPI; defaults to `http://localhost:8000`            |
| `NEXT_PUBLIC_API_URL` | web      | ✅        | API origin the browser calls                                         |
| `GROQ_API_KEY`        | services | —         | Enables AI features; without it AI endpoints return "not configured" |
| `PORT`                | api      | —         | API port; defaults to `8000`                                         |
| `NODE_ENV`            | all      | —         | `development` \| `production` \| `test` — controls prod cookie flags |

> In **production**, auth cookies are issued with `secure: true` and `sameSite: "none"`, so the API must be served over **HTTPS**.
