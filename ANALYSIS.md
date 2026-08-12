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
