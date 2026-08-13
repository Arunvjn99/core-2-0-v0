# CORE 2.0 — Figma vs. Build Analysis & Checklist

Source of truth: **Participants Portal Playground** (the only Figma file —
https://www.figma.com/design/ydVeg09j0IRQ9y6GaIlzjs/Participants-Portal-Playground).
All other Figma files/tabs seen during this project are not authoritative.

This file tracks what Figma actually contains vs. what's built, so gaps
don't get rediscovered from scratch each session.

## Method

Figma was explored two ways: (1) `get_metadata`/`get_screenshot` on the
canvas structure, and (2) playing the live prototype in the Figma desktop
app to see actual interaction/overlay behavior (static screenshots don't
show slide/modal animation types). Prototype play mode is the more
reliable source for *interaction* type; canvas metadata is more reliable
for *finding* screens, since the canvas has ~362 top-level frames and most
are unlabeled duplicates/component fragments from iteration.

---

## Profile — mostly missing (found 2026-08-12, second pass)

Figma has this as a **mobile-first** multi-screen flow (414px frames),
not a single desktop page. Real screens found:

| Screen | Figma node | Built? |
|---|---|---|
| Personal Details (view) | 2893:12648 | ❌ replaced with a much thinner custom Profile screen |
| Edit Personal Details | 2893:12743 | ❌ |
| Employment details | 2893:12559 | ❌ |
| Beneficiary details (empty state + Add) | 2893:13321 | ❌ |
| Account statement (Sources/Investments tabs, pie chart) | 2893:12612 / 2893:12633 | ❌ — this is a *balance breakdown* view, distinct from the Account Statements document-list screen already built |
| Mobile slide-out menu (Profile/Personal Info/Account Statements links) | 2893:16598 `menu-slide` | ❌ (desktop drawer built instead; not wrong, just doesn't match this specific mobile pattern) |

**What's built today:** a single generic Profile form (first/last name,
email) — none of the above sections.

**Plan:** build Personal Details (view + edit) and Employment Details as
real screens/tabs within `/profile`; Beneficiary Details as its own
section with the real empty state; keep it responsive rather than
mobile-only since the desktop app doesn't need a phone-only screen.

---

## Transactions — mostly missing (found 2026-08-12, second pass)

Figma has an entire Transaction module beyond the Loan summary screen
already built:

| Sub-flow | Figma nodes (representative) | Built? |
|---|---|---|
| Loan summary (repayment schedule) | 2893:27994 | ✅ built |
| Loans list (Housing loan / Personal loan chips) | 2893:7844 area | ❌ |
| New Transfer Request (multi-step: source, amount, after-transfer summary) | 2893:8093–8767 | ❌ |
| Transfer Request Summary + Transaction ID tracking | 2893:9837–10473 | ❌ |
| New Rollover Request (distribution details, pre-tax/after-tax/Roth rollover amounts) | 2893:9306–9785 | ❌ |
| Rollover Request Summary | 2893:9690 | ❌ |

**Plan:** build a Transactions hub (list: loans / transfers / rollovers,
each with a real status), plus one representative full sub-flow (New
Transfer Request, since it's the most self-contained) to establish the
pattern. Rollover wizard is the next logical follow-up after that.

---

## Enrollment — spot-checked, close but re-verify Contribution/Review

Already rebuilt Auto Increase to match Figma's card + modal pattern (see
PROGRESS.md). Contribution Election and Review were checked against
`2893:56254`/`2893:59711` and are structurally close. Flagged by the user
as still not matching — re-diff both against fresh screenshots as part of
this pass and fix any drift found (spacing, copy, colors).

---

## Checklist for this pass

- [x] Re-screenshot Review step, diff against current build, fix real
      deltas — rebuilt as 3-column layout (step tracker | Retirement Goal
      Simulator donut + Funding Plan Report | Summary panel), matches
      Figma node 2893:59711
- [x] Build Profile: Personal Details (view + inline edit, avatar,
      status badge, employer/employee ID)
- [x] Build Profile: Employment Details (Payroll Frequency, Employee
      Classification, Employer, Employee ID)
- [x] Build Profile: Beneficiary Details (empty state matching Figma
      exactly + Add form + list w/ Remove) — verified live with a real
      beneficiary added and persisted
- [x] Build Transactions hub (`TransactionsHub.tsx`) — filter chip bar,
      demo loan + real `core2.transaction_requests` merged into one list,
      "+ New Request"
- [x] Build New Transfer Request flow (`NewTransferRequest.tsx`) —
      Selected Investments sidebar, Units/Amount/Percentage tabs,
      per-source sell amounts, real Supabase write to
      `core2.transaction_requests`, verified via direct REST query
- [x] Verify all of the above live (fresh browser tab, fresh login,
      scripted DOM checks + direct Supabase REST verification)
- [x] Fixed a real, previously-undiagnosed bug found during this pass:
      `framer-motion` `AnimatePresence` around the enrollment wizard's
      step content stopped updating the DOM after the first transition
      (step tracker advanced, content pane froze) — replaced with a
      plain CSS `@keyframes` fade (`.core2-step-fade` in `index.css`)
- [ ] Re-screenshot Contribution Election step specifically, diff against
      current build (Review is done; Contribution Election still
      unverified this pass)
- [ ] Commit + push (Netlify auto-deploys from `main`)

## Still open (carried forward)

- [ ] Loans list (Housing loan / Personal loan chips) screen — only the
      Loan Summary *detail* view is built; there's no list/landing view
      for choosing between multiple loans yet (TransactionsHub covers a
      generic list, not this specific Figma pattern)
- [ ] Transfer Request Summary + Transaction ID tracking screen (post
      New Transfer Request submission — currently just toasts + redirects
      to the hub instead of showing a dedicated summary screen)
- [ ] Edit Personal Details as its own distinct step — current build
      uses inline edit-in-place on the same screen rather than Figma's
      separate "Edit Personal Details" screen (2893:12743); functionally
      equivalent, visually not diffed

---

## Round 3 — user-reported gaps (2026-08-13)

User feedback after the round-2 batch, verbatim intent: login page doesn't
match Figma (missing gradients, fixed-px sizing breaks on other screens),
header logo is hardcoded (not client-configurable, no dark/light variants),
pre-/post-enrollment Dashboard flow isn't real (no branching on actual
enrollment state), Dashboard widgets (Goal Simulator etc.) don't match
Figma, Profile's sub-flows aren't fully analyzed, Transactions is still
missing pieces, and the enrollment flow's per-screen popups should be
slide-over panels, not modals. A live reference demo
(https://participant-demo.coreretirementsolutions.com) was provided for
flow verification — used for login-page and post-enrollment-dashboard
layout confirmation this round (no login credentials available, so only
the public login screen and Figma screenshots could be cross-checked).

### Done this round

- [x] **Header logo, client-configurable, light/dark aware** — added
      `logo_url_dark` column to `core2.client_themes` (alongside existing
      `logo_url`), admin Theming page now has Logo URL (light) + Logo URL
      (dark, optional, falls back to light) fields with live preview
      swatches, `useClientConfig` exposes `{light, dark}`, `AppShell`
      renders a `ClientLogo` component that swaps by resolved theme and
      falls back to the default CORE wordmark when no client logo is set.
      Verified live end-to-end: admin sets a logo → header repaints with
      zero rebuild, confirmed via direct DB read + screenshot.
- [x] **Pre-/post-enrollment Dashboard flow, no hardcode** — added
      `fetchEnrollments()` (reads `core2.enrollments`) to
      `lib/enrollment.ts`. `Dashboard.tsx` now branches on real enrollment
      rows: zero enrollments → pre-enrollment "Let's Find You the Best
      Plan" picker (unchanged); one or more → post-enrollment layout
      matching Figma node `2893:57381` ("Dashboard-Post enrolled"): "Plans
      you are enrolled in" summary card (real plan name/id, Total
      Vested/Total balance, "View summary"), Recent Transactions count
      (real `core2.transaction_requests` count), Retirement Goal
      Simulator card, Risk Level gauge (unchanged, already real), and an
      "Explore More Plans" section that filters out plans the participant
      is already enrolled in by `plan_id` (was previously just a static
      list with a hand-set `eligible` flag and no enrolled-state
      awareness at all). New `/my-plans` screen ("View summary" target)
      lists every enrollment with its actual saved elections. Verified
      live: real Supabase session showing 4 real enrollment rows renders
      the post-enrollment dashboard and full My Plans history correctly.
- [x] Confirmed login page's gradient/token values already match Figma's
      `get_design_context` output exactly (same two-layer linear-gradient
      on the brand panel, same CTA gradient on the button) — the gap
      here is layout responsiveness, not colors (see below).

### Still open — real, scoped, and next in line

- [ ] **Login page responsive layout** — current implementation
      (`Login.tsx`) uses Figma's literal fixed pixel values (638px brand
      panel, 474/499px form max-widths, 855px panel height, 82px/124px
      gaps) almost verbatim. This reproduces the design at one viewport
      size but doesn't scale down cleanly on narrower desktop widths or
      between breakpoints. Needs: fluid widths (`clamp()`/`%`/`fr` instead
      of literal px), a defined tablet breakpoint (not just the current
      binary lg: show/hide of the brand panel), and font-size scaling for
      the 52px hero text and 31px "Login" heading.
- [ ] **Dashboard — Rate of Return chart** (Figma node `2893:57381`, left
      column, "Rate of Return +101.20%" line chart with 1M/6M/1Y/YTD
      toggle) — not built this round in the interest of shipping the
      pre-/post branching first; currently omitted entirely rather than
      faked with placeholder data.
  - [ ] Dashboard's "Explore More Plans" PlanCard row and the pre-enrollment
        version should be diffed against Figma's exact card styling once
        more (button sizing, badge placement) — not re-screenshotted this
        round.
- [x] **Profile — full audit** — superseded by round 4's live-demo
      walkthrough (more reliable than the duplicate-heavy Figma canvas):
      confirmed all 5 real sub-screens and built Contact Details, SSN,
      Marital status, Bank Details, and the Employment Info/Classification
      split. Still open: "Edit Personal Details" as its own distinct step
      vs. today's inline edit-in-place (functionally equivalent, not
      visually diffed against the live app's dedicated edit screen).
- [ ] **Transactions — still incomplete per the round-2 checklist's own
      carried-forward list**: Loans list/landing screen (multiple loans,
      not just the one Loan Summary detail view), Transfer Request
      Summary + Transaction ID tracking screen (post-submit — currently
      just a toast + redirect), New Rollover Request wizard.
- [ ] **Enrollment flow — slide-over, not modal/inline.** The live demo
      and Figma prototype show per-step option panels (e.g. Auto
      Increase's "Compound your savings" configuration) opening as a
      right-edge slide-over (matches the pattern already built once for
      the Investments fund picker, `ui-kit/primitives/SlideOver.tsx`) —
      today's `PlanEnrollment.tsx` renders these inline/as a centered
      modal instead. Needs: identify every such panel across all 4 steps
      and convert each to `SlideOver`, re-verified against the live demo
      interaction (not just a static screenshot) since slide direction
      and trigger behavior don't show up in stills.
- [x] Live demo login credentials were provided in round 4 — Dashboard,
      Profile, and Enrollment were re-verified directly against it (see
      "Round 4" section below). Transactions/Documents/Investment
      Portfolio still need the same treatment.

---

## Round 4 — live demo walkthrough (2026-08-13, logged in as "Michael Carter" / Galileo)

User provided a logged-in session this time. Walked the real app (mobile-
width chrome, bottom tab bar MENU/DASHBOARD/SETTINGS + a left slide-in
"Menu" drawer) screen by screen. This is now the highest-confidence source
we have — more reliable than Figma's duplicate-heavy canvas — and reveals
real gaps Figma alone didn't surface.

### Real navigation structure (menu drawer, confirmed live)

```
Dashboard
Enrollment          <- NOT the risk questionnaire. A plan browser: All/
                        Enrolled/Eligible filter chips, dark gradient card
                        per enrolled plan ("Manage" -> per-plan summary +
                        Opt-Out/Edit), white card per eligible plan
                        ("Enroll" -> wizard). Our /enrollment route
                        currently goes straight to the risk questionnaire
                        instead — real IA mismatch, not just styling.
Profile              <- expandable, 5 real sub-screens:
  Personal Details      Basic Details (incl. SSN, masked+eye-toggle,
                         Marital status) + a full Contact Details section
                         (Email, Primary/Secondary phone w/ country code,
                         Address lines 1-3, City, Country, State, Zip) —
                         we have NONE of the Contact Details section today.
  Bank Details           "Set bank information" Yes/No toggle -> account
                         fields when Yes. We have nothing here at all.
  Employment Information Payroll frequency, Date of hire, QDRO status,
                         Ownership %, Family-of-owner/Officer/HCE/Key
                         employee/Insider flags, Rehire details (most
                         recent rehire/term dates). Ours only has Payroll
                         Frequency + Classification as one flat tab.
  Employee Classification Location, Division, Department, Paycode,
                         Classification type/code/name/start-end dates,
                         Classification History table. Entirely missing.
  Beneficiary Details    Confirmed our empty state text matches exactly
                         ("No beneficiary has been added" / "add
                         beneficiary and complete your profile" / "Add
                         Beneficiary") — no changes needed here.
Transaction          <- separate from Documents; real screen has a plan
                        chip tab bar + collapsible "Plan details" row;
                        didn't finish loading in this session (likely a
                        demo-data gap), transaction list contents unseen.
Documents            <- not explored this round (time-boxed).
Investment Portfolio <- not explored this round (time-boxed).
```

### Dashboard — confirmed real vs. what we built last round

Real dashboard is simpler than the Figma static frame we built from:
- Has: Hello card + View Summary, enrolled-plan name/id/balance pair +
  View Details (routes to `/participant/enrollment/manage-plan?planId=…`,
  a single-plan summary — see below), Explore More Plans cards (their
  eligible-plans list showed 3 real plans, not our 1-2 demo plans),
  Retirement Goal Simulator, Risk Level gauge.
- Does NOT have: a Recent Transactions panel, a Learning/Financial
  Wellness tile, or a Rate of Return chart on the dashboard itself — all
  three of those were built last round based on the Figma static frame
  and are not in the real shipped app. Not necessarily wrong to keep
  (could be a demo-data-off case), but worth flagging: **the Figma frame
  we based Round 3's post-enrollment dashboard on is richer than what's
  actually live** — real Goal Simulator only has 3 rows (Expected
  expense / All Income / ShortFall), not the 5 we built (Social
  security / Other income / Plan income split out).
- `Show Ineligible Plans` toggle uses this exact copy/casing (title
  case, not sentence case) — ours currently reads "Show Ineligible
  plans" (lowercase p) — trivial but easy to match exactly.

### "Manage Plan" (View Details / Manage target) — real screen, differs from our /my-plans

Real route: `/participant/enrollment/manage-plan?planId=<id>` — a
**single selected plan's** management view, not a full enrollment
history list like the `/my-plans` screen built last round. Shows: Plan
balance / Vested balance, Contribution Election (per source), Investment
Election with a "Breakdown" link, Auto-Features (Period of increase,
per-source ADI / ADI Stops At table, Smart rebalance, Auto rebalance),
and a bottom action bar with **Opt-Out Plan** / **Edit**. Our `/my-plans`
approximates this content per-enrollment but as a stacked history list
rather than a per-plan drill-in, and has no Opt-Out/Edit actions.

### Slide-over/overlay pattern — confirmed, partially

Two distinct overlay patterns observed live:
1. **Menu (nav drawer)**: slides in from the **left** as a narrower
   panel over a dimmed backdrop — this matches our existing mobile
   AppShell drawer behavior already (no change needed).
2. **Profile sub-screens (Personal Details, Bank Details, Employment
   Information, Employee Classification)**: full-viewport-width panel
   with a title bar (title + X close, top-right) and a **pinned bottom
   action bar** (Cancel/Edit or just Edit). At this viewport width it's
   indistinguishable from a full-screen route vs. a right-edge
   slide-over — desktop-width behavior of this exact pattern is still
   unconfirmed. The enrollment wizard's step panels (Auto Increase's
   "Compound your savings" etc.) were not re-checked this round — still
   open per Round 3's note.

### Also checked this round: Figma "mobile App" page (2046:1447)

Looked for Employment/Classification/Bank/Manage-Plan frames there since
the canonical "core 2.0" page's ~362 frames are too duplicate-heavy to
search by name reliably. Found `Enroll Wizard walkthrough` (2226:3529)
and a few related frames — but a screenshot confirmed this is a
**different, unrelated prototype** (different visual language, "Hi
Arun" branding, AI-recommendation framing) rather than a mobile variant
of the canonical Participants Portal Playground flow. Disregarded; the
live demo remains the authoritative source for this round's build.

### Round 4 build — completed

- [x] Enrollment nav now opens a real plan browser (`EnrollmentHub.tsx`
      at `/enrollment`) — All/Enrolled/Eligible filter chips, dark
      gradient card + Manage for enrolled plans, white card + Enroll for
      eligible ones. Verified live, matches the real screen's layout.
- [x] Risk questionnaire moved to `/enrollment/questionnaire`, reachable
      from the Dashboard risk widget's Take Questionnaire/Edit
      Preferences buttons.
- [x] New `ManagePlan.tsx` at `/enrollment/manage-plan?planId=…` — real
      per-plan drill-in (balance pair, Contribution Election, Investment
      Election + Breakdown toggle, Auto-Features w/ ADI table, Opt-Out
      Plan / Edit actions backed by a real `setEnrollmentStatus` write).
      Replaces `/my-plans` (now a redirect to `/enrollment`).
- [x] Profile split into 5 real tabs: Personal Details, Bank Details,
      **Employment Info** (payroll frequency, date of hire, QDRO,
      ownership %, officer/HCE/key-employee/insider flags, rehire
      details) and **Classification** (location/division/department/
      paycode, classification type/code/name/dates, classification
      history) as two distinct screens — matches the live app field for
      field. New `core2.participants` columns for all of it.
  - Note: filled from a `git mv`-free split of the old flat Employment
    tab; all fields are read-only for now (matches the real app's
    read-only presentation of HR/payroll-sourced data).
- [x] Fixed the pre-existing `DEMO_PLANS` bug where two demo plans
      shared the same `plan_id` (124542) — caused false "already
      enrolled" collisions; moved the catalog to a shared `lib/plans.ts`
      so Dashboard and Enrollment hub can't drift from each other again.
- [x] Full clean build + live verification on a fresh dev-server
      restart: Dashboard → Enrollment hub → Manage Plan → Profile's new
      tabs, all screenshotted and confirmed against the live reference.

### Round 5 — follow-through (2026-08-13, same session)

- [x] **Fixed the hardcoded-plan bug**: `PlanEnrollment.tsx` now reads
      `?planId=&planName=` from the URL (Dashboard's PlanCard and the
      Enrollment hub's Enroll button both pass them), falling back to
      the original demo plan only when `/enroll` is opened directly.
      Verified live: enrolling via "401(K) Mindblock Simple" now shows
      that plan's actual name/ID throughout the wizard and Review step,
      not the old always-124542 default.
- [x] **Login page responsive layout** — replaced every literal Figma
      pixel value (638px panel, 474/855px card, 52px hero text, 124px
      gap, 45px logo, 31px heading) with `clamp()` equivalents that
      scale fluidly between a floor and the original Figma value.
      Verified live at 1024px and 900px widths: no overflow, brand panel
      degrades to hidden below `lg` as before, full-width layout still
      matches the original design at native size.
- [x] Re-checked Documents against the live demo — structurally already
      close (search, Generate Statement, records list, empty state);
      no changes made this round, logged as "good enough" rather than
      re-verified pixel-for-pixel.
- [x] Attempted Transaction and Investment Portfolio against the live
      demo again — **both hang on an infinite "Loading…" spinner on
      this demo account** (confirmed twice, not a fluke). This is a
      live-app data/backend issue on their end for this account, not
      something further exploration here can resolve — nothing more to
      extract from them this way.

### Still open after round 5

- [ ] Re-check whether Dashboard's Recent Transactions / Learning tile /
      Rate of Return chart should stay — they don't appear in the real
      live dashboard we now have confirmation of; either they're
      demo-data-gated in the real app or Figma's static frame oversells
      what's shipped. Lowest priority — "maybe remove," not "definitely
      missing."
- [ ] Employment Info / Classification fields are read-only display only
      (matches the live app for now) — no edit UI yet if that turns out
      to be needed; also no data seeded for these new columns, so every
      field currently reads "—" for the demo user until seeded.
- [ ] Transaction and Investment Portfolio screens couldn't be verified
      against the live demo (both stuck loading on that account, see
      above) — still built from Figma/earlier-session assumptions only,
      unverified this round.
- [ ] Enrollment wizard step panels (e.g. Auto Increase's "Compound your
      savings") — slide-over vs. modal/inline still unconfirmed at
      desktop width; carried from round 3.

---

## Deliberately deferred (documented, not forgotten)

- Rollover Request wizard (Transfer flow ships first as the template)
- Mobile-specific slide-out menu pattern (`menu-slide` node) — desktop
  drawer already covers the same nav, revisit only if a true mobile
  build is prioritized
- Account statement balance-breakdown view (Sources/Investments pie
  chart) — distinct from the Account Statements document list already
  built; follow-up item
- Mobile Investment Portfolio performance chart (line chart with
  invest-amount tooltip) — desktop Investments screen covers the same
  data differently; follow-up item if a true mobile build is prioritized
