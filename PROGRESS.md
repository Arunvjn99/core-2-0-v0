# CORE 2.0 — Build Log

A running record of what's been built, fixed, and decided in this project. Newest entries at the top.

---

## Session: Figma comparison, slide-in overlay, infinite-loop fix

**What changed:**
- Compared the live build against the actual Figma prototype (played through it directly in the Figma desktop app) to find real layout/behavior mismatches, not just guess from static screenshots.
- Found the Manual Investments "fund picker" was built as an in-place panel swap; the real prototype uses a **right-edge slide-in drawer**. Built a proper `SlideOver` primitive (`src/ui-kit/primitives/SlideOver.tsx`) — spring-animated slide from the right, backdrop, respects `prefers-reduced-motion` — and wired it into the standalone Investments screen's "Manage Investment" flow (search + fund type filter + checkbox list, matching Figma).
- **Found and fixed a real infinite-render-loop bug**: `Select.tsx` always passed both `value` (when used as a controlled input) and a hardcoded `defaultValue=""` to the native `<select>`, which put React into a controlled/uncontrolled fight that manifested as "Maximum update depth exceeded" and froze the page. Fixed by only falling back to `defaultValue` when the component is genuinely uncontrolled.
- Verified the fix on a completely fresh browser tab/session (to rule out dev-server HMR staleness, which caused several false alarms earlier in the session) — confirmed zero console errors and the drawer sliding in correctly.

**Note on process:** several "blank screen" scares during this session turned out to be Vite dev-server HMR corruption from rapid file edits, not real bugs — always confirmed by restarting the dev server and/or opening a fresh browser tab before concluding something was actually broken.

---

## Session: Netlify deploy fix + enrollment flow bugs + motion pass

**Netlify blank screen (root cause + fix):**
- `.env.local` (Supabase URL/key) is gitignored by design — Netlify never had it, so the Supabase client threw at module-load time, before React could mount. Blank page, error only in devtools.
- Fixed: `main.tsx` now checks required env vars *before* importing `App`; missing config renders an actual on-screen explanation instead of blank white.
- Added a top-level `ErrorBoundary` so other uncaught render errors also show a message, not a blank unmount.
- Added `netlify.toml`: explicit build command/publish dir + SPA redirect rule (without it, refreshing any deep link like `/dashboard` 404s).
- **Action required on your end:** set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify's Site configuration → Environment variables, then trigger a new deploy.

**Real bugs found while testing the fix:**
1. Both demo Dashboard plan cards were `eligible: false` — Enroll button was silently disabled, clicking did nothing. Fixed: first demo plan is now eligible so the happy path is reachable.
2. Questionnaire submission navigated to `/dashboard` instead of `/enroll` — Figma treats the risk questionnaire and plan enrollment as one continuous flow. Fixed: now chains straight into the enrollment wizard.

**Motion/interactivity layer added** (last open item from the original brief):
- Route transitions (fade + lift) via framer-motion, wrapping `<Routes location=>`
- Toast notification system (`ui-kit/lib/ToastContext.tsx`) replacing static "Saved at HH:MM:SS" text
- Enrollment wizard steps slide directionally (forward/back)
- Risk gauge needle sweeps in on mount instead of appearing static
- Plan cards: hover lift + button press feedback
- Everything respects `prefers-reduced-motion`

---

## Session: Profile rebuild, Transactions module, Review-step rebuild, AnimatePresence bug fix

Full analysis pass (logged in `ANALYSIS.md`) found Profile and Transactions
were far more built-out in Figma than what existed — this session closed
most of that gap:

- **Profile rebuilt as a tabbed screen** (`Profile.tsx` + new
  `lib/profile.ts`): Personal Details (view + inline edit — avatar
  initial, status badge, employer/employee ID, name/gender/DOB with
  computed age), Employment (Payroll Frequency, Classification, Employer,
  Employee ID, read-only), Beneficiaries (Figma's exact empty state, Add
  form, list with Remove) — verified live by adding a real beneficiary
  that persisted to `core2.participants`/beneficiaries
- **Transactions restructured into its own module**
  (`screens/transactions/`): `TransactionsHub.tsx` (filter chips, merged
  demo + real `core2.transaction_requests` list, "+ New Request"),
  `LoanSummary.tsx` (moved from the old single `Transactions.tsx`, fixed
  nav), `NewTransferRequest.tsx` (new — Selected Investments sidebar,
  Units/Amount/Percentage transfer-by tabs, per-source sell amounts,
  real write to `core2.transaction_requests`, verified via direct
  Supabase REST query against the submitted row)
- **Plan Enrollment Review step rebuilt** to match Figma's actual
  3-column layout (`2893:59711`): step tracker | Retirement Goal
  Simulator (donut chart, "Optimize your score", Funding Plan Report
  with Expected/All income/Shortfall) | Summary panel (risk pill, Plan
  Details, full election summary). Previous version was a flat vertical
  list — visually wrong.
- **Fixed a real bug, not an environment artifact**: after the Review
  rebuild, the wizard's step tracker would advance on "Next" but the
  main content pane froze on the previous step indefinitely. Reproduced
  consistently across dev-server restarts and fresh browser tabs/logins
  (ruling out HMR staleness), and confirmed via scripted DOM checks that
  `step` state was updating correctly but the rendered content wasn't.
  Root cause: `framer-motion`'s `AnimatePresence` (`mode="wait"`, keyed
  by `step`) never completed its exit/enter cycle after the first
  transition in this React 19 setup. Fix: removed `AnimatePresence`/
  `motion.div` for step content, replaced with a plain keyed `<div>` +
  CSS `@keyframes` fade (`.core2-step-fade` in `index.css`). Verified
  all 4 steps now render correctly on sequential clicks, fresh tab.
- Full checklist and Figma node references logged in `ANALYSIS.md`.
- Still open (carried forward, see `ANALYSIS.md`): Loans list screen,
  Transfer Request Summary/tracking screen, Rollover Request wizard,
  mobile slide-out menu pattern, Account statement balance-breakdown
  view, Contribution Election step re-verification.

---

## Session: Admin console

Net-new (no Figma source) — built to match the participant portal's design system:
- **Clients** (`/admin/clients`) — create/list white-label tenants, each auto-seeded with a default theme + all modules enabled
- **Theming** (`/admin/theme`) — color-picker editor with live preview, writes to `core2.client_themes`
- **Modules** (`/admin/modules`) — per-client module toggles over `core2.module_config`
- `useClientConfig.ts` hook: loads the logged-in participant's `client_id`, applies that client's theme via CSS variables, returns enabled modules so `AppShell` can filter its nav
- **Verified live**: disabled "Investment Portfolio" in the admin console and watched it disappear from the Dashboard sidebar with zero rebuild; changed the primary brand color and watched the participant portal repaint immediately
- Known gap: no RBAC yet — any authenticated user can reach `/admin` (documented as a TODO in `adminApi.ts`)

---

## Session: Plan Enrollment wizard (Contribution → Auto Increase → Investments → Review)

- Figma: 4-step wizard triggered from a Dashboard plan card's "Enroll" button (`/enroll`), distinct from the risk-profile Questionnaire (`/enrollment`)
- Step tracker sidebar with completed/in-progress states
- **Contribution**: Plan Default / Maximum / Manual presets with live-editable rates
- **Auto Increase**: rebuilt after comparing to the actual Figma prototype — three illustrated option cards (No/Plan Default/Manual) + a "Compound your savings" modal with Increment Cycle radios (Calendar Year / Plan participant date / Plan Year, each showing next-increase date) and per-source (Pre tax/Roth/After tax) increment + max-limit fields
- **Investments**: plan-default vs. manual mode + auto-rebalance
- **Review**: full election summary + risk gauge
- Submits to `core2.enrollments` (new table, RLS scoped to participant)
- Every enrollment header now shows "Enrolment Plan Details" + risk gauge across all 4 steps, matching Figma

---

## Session: Core screens (Dashboard, Statements, Investments, Transactions, Profile)

- **Dashboard**: plan cards (eligible/ineligible states), live risk-level widget reading from `core2.saved_plans`, "Show ineligible plans" toggle
- **Account Statements**: filterable document list + "Generate statement" modal that inserts a real row into `core2.documents` and triggers a genuine client-side file download
- **Investment Portfolio**: mode selector (Manage/Plan Default/Manual) + fund allocation table + auto-rebalance
- **Transactions**: loan/transaction detail view with tabbed repayment schedule (demo data — real values need a loan-servicing backend that doesn't exist yet)
- **Profile**: reads/writes `core2.participants` for real

---

## Session: Risk questionnaire

- 6-step wizard: 5 Likert-scale questions + a funding-details form
- Scores answers into a risk level (`Conservative` → `Aggressive`), written to `core2.saved_plans`
- Dashboard's risk widget reads this live instead of being hardcoded

---

## Foundational session: scaffold + design system + first screens

- Explored the Figma file (`Participants Portal Playground`) — 362 top-level frames, ~35 distinct flows once duplicates/component fragments were filtered out
- Scaffolded Vite + React 19 + TypeScript + Tailwind 4
- Design token system (`src/design-tokens/tokens.css`) as CSS variables — the mechanism that makes white-labeling work at runtime
- Supabase wired to an isolated `core2` Postgres schema in the existing **Core-Claude** project (chosen specifically to avoid touching the existing `public.*` tables/data) — required a manual fix later when it turned out PostgREST wasn't exposing the schema by default
- Light/dark/system theme toggle, responsive layout (sidebar collapses to a drawer below `lg`)
- Login and Dashboard screens built and verified against a real Supabase login

---

## Architecture notes (for future reference)

- **Two apps sharing one design system**: the participant portal (`portal-app/`) and the admin console (`admin-app/`), both built from the same `ui-kit/` primitives and `design-tokens/`
- **White-labeling**: `core2.clients` → `core2.client_themes` (CSS variable overrides) → `core2.module_config` (nav visibility). Applied at runtime via `useClientConfig.ts`, no rebuild needed
- **Supabase isolation**: everything lives in the `core2` Postgres schema, never touching the existing `public.*` tables in the shared Core-Claude project
- **Two distinct enrollment flows**: `/enrollment` is the risk-profile questionnaire (chains into `/enroll` on completion); `/enroll` is the actual 4-step plan enrollment wizard
