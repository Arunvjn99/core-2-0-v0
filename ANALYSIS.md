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
- [ ] **Profile — full frame-by-frame audit.** Round 2 built Personal
      Details / Employment / Beneficiaries as tabs based on 4 node IDs
      found in a keyword search of canvas metadata, not an exhaustive
      walk of every Profile-related frame. Given the file has ~362
      top-level frames with heavy duplication, a full audit needs a
      dedicated pass: enumerate every frame under the Profile/Account
      cluster, screenshot each, and check it against what's built,
      including states (empty/filled/editing) and the "Edit Personal
      Details" as a distinct screen vs. today's inline edit-in-place.
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
- [ ] Live demo (https://participant-demo.coreretirementsolutions.com)
      could only be checked pre-login this round — no credentials were
      available. If credentials can be shared, re-verify Dashboard,
      Profile, Transactions, and Enrollment interaction patterns against
      it directly rather than relying solely on Figma stills.

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
