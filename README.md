# LexSafe AI

A privacy-first AI legal research assistant built exclusively for licensed attorneys and law firms.

LexSafe AI gives attorneys a private workspace to research case law, draft documents, analyze contracts, and discuss legal strategy — with a technical architecture strong enough to support attorney-client privilege protections. Conversations are never stored in our database, never used to train AI models, and are permanently destroyed when the session ends.

The product is sold to lawyers and law firms, not directly to clients.

---

## What We're Building

Most AI products store your conversations. LexSafe AI does not. The architecture makes it technically impossible for conversation content to reach our database — messages flow directly from the browser to Anthropic's API and back. When you close a session, it's gone forever.

This is a feature, not a limitation. It's the core privacy guarantee that makes the product viable for privileged legal work.

**Target users:** Solo attorneys, small-to-mid size law firms, paralegals  
**Sold as:** SaaS with firm-level accounts and role-based access  
**Current phase:** Phase 1 (MVP — core chat product)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Clerk (firm-level isolation, SSO-ready) |
| Database | Supabase (Postgres) — user/firm data only, never conversations |
| AI | Anthropic API (`claude-sonnet-4-6`, streaming) |
| Hosting | Vercel |
| Payments | Stripe (Phase 2) |

---

## Core Architecture Rules

These are non-negotiable. Do not break them.

1. **Conversations never touch the database.** Chat messages flow client → our API route → Anthropic → back to client. Nothing is written to Supabase at any point in this flow.
2. **API key never exposed to the client.** The Anthropic API key lives only in server-side environment variables. All AI requests go through `/api/chat`.
3. **System prompt is server-side only.** The legal assistant system prompt is injected in `src/app/api/chat/route.ts` and never sent to the browser.
4. **No conversation persistence.** Chat state lives in React `useState` only — no localStorage, no sessionStorage, no database writes. Closing the window destroys it permanently.
5. **Firm isolation.** Every user belongs to a firm. Users can only see their own sessions. No cross-firm data access at any level.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Marketing landing page
│   ├── pricing/page.tsx                # Pricing page
│   ├── privacy/page.tsx                # Privacy architecture explanation
│   ├── login/[[...sign-in]]/page.tsx   # Clerk sign-in
│   ├── signup/[[...sign-up]]/page.tsx  # Clerk sign-up
│   ├── onboarding/page.tsx             # Firm creation flow (post-signup)
│   ├── dashboard/
│   │   ├── layout.tsx                  # Protected layout, redirects if no firm
│   │   ├── page.tsx                    # Redirects to /dashboard/chat
│   │   ├── chat/page.tsx               # Main product — AI chat interface
│   │   ├── settings/page.tsx           # User profile settings
│   │   └── firm/
│   │       ├── page.tsx                # Firm overview (admin only)
│   │       └── users/page.tsx          # User management (admin only)
│   └── api/
│       ├── chat/route.ts               # Anthropic streaming — core AI endpoint
│       ├── onboarding/route.ts         # Creates firm + links user in Supabase
│       └── webhooks/
│           └── clerk/route.ts          # Syncs Clerk user events to Supabase
├── components/
│   ├── ChatInterface.tsx               # Full chat UI (in-memory state only)
│   └── DashboardSidebar.tsx            # Nav sidebar with privacy badge
├── lib/
│   ├── supabase.ts                     # Supabase public + admin clients
│   └── database.types.ts              # TypeScript types for DB schema
└── middleware.ts                       # Clerk auth middleware, public routes
supabase/
└── schema.sql                          # Full DB schema — run this first
```

---

## Database Schema

Only three tables exist. **There is no messages table. There is no conversations table.**

- **firms** — firm name, subscription tier/status, user limit
- **users** — clerk_id, firm_id, email, role (admin/attorney/paralegal)
- **audit_logs** — session metadata only (timestamps, token counts). Never contains conversation content.

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- [Clerk](https://clerk.com) account
- [Supabase](https://supabase.com) project
- [Anthropic](https://console.anthropic.com) API key
- [ngrok](https://ngrok.com) (for webhook testing)

### 1. Clone and install

```bash
git clone <repo>
cd counselai
npm install
```

### 2. Environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in all values (see table below).

### 3. Supabase — create the schema

In the Supabase dashboard → **SQL Editor** → **New query** → paste the contents of `supabase/schema.sql` → click **Run**.

### 4. Clerk webhook (required for user sync)

Run ngrok to expose localhost:

```bash
npx ngrok http 3000
```

In the Clerk dashboard → **Configure → Webhooks → Add Endpoint**:
- URL: `https://your-ngrok-url.ngrok-free.dev/api/webhooks/clerk`
- Events: `user.created`, `user.deleted`

Copy the signing secret to `CLERK_WEBHOOK_SECRET` in `.env.local`.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks → your endpoint → Signing Secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Secret key |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally, your domain in production |

---

## Deploying to Vercel

```bash
npx vercel
```

Add all environment variables in the Vercel dashboard under **Project Settings → Environment Variables**.

For production, update the Clerk webhook endpoint URL from your ngrok URL to your Vercel domain:
```
https://your-app.vercel.app/api/webhooks/clerk
```

---

## User Flow

1. Attorney visits `/` → clicks **Start free trial**
2. Creates account via Clerk → redirected to `/onboarding`
3. Enters firm name → firm record created in Supabase, user linked as admin
4. Redirected to `/dashboard/chat` — ready to use
5. To invite colleagues: firm admin goes to `/dashboard/firm/users` (invite flow Phase 2)

---

## Roles

| Role | Access |
|---|---|
| `admin` | Full chat + firm settings + user management + audit logs |
| `attorney` | Full chat access |
| `paralegal` | Full chat access |

---

## Pricing (Phase 2 — designed for now)

| Plan | Price | Users |
|---|---|---|
| Solo | $79/mo | 1 |
| Firm | $199/mo | Up to 5 |
| Professional | $499/mo | Up to 20 |
| Enterprise | Custom | Unlimited + ZDR + SSO |

---

## Phase 2 Roadmap

- Stripe billing integration
- Document upload (PDF analysis, in-session only, never stored)
- Firm admin audit log dashboard
- User invitation flow
- Zero Data Retention enterprise agreement
- Mobile responsive polish
- Email notifications
