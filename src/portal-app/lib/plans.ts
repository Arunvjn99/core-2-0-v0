import type { Plan } from '../../ui-kit/patterns/PlanCard'

/**
 * Shared demo plan catalog — used by both the Dashboard's "Explore More
 * Plans" list and the Enrollment hub's plan browser so the two screens
 * never drift out of sync with each other.
 *
 * TODO(follow-up): no `core2.plans` catalog table exists yet — once it
 * does, replace this with a live query. Enrolled/eligible filtering
 * logic downstream already keys off `plan_id`, so the swap is contained
 * to this file.
 */
export const DEMO_PLANS: Plan[] = [
  { id: 'p1', name: '401(K) Company Plan High Returns', planId: '124542', type: '401(K)', eligible: true },
  { id: 'p2', name: '401(K) Mindblock Simple', planId: '124543', type: '401(K)', eligible: true },
  {
    id: 'p3',
    name: '401(K) Save More',
    planId: '124599',
    type: '401(K)',
    eligible: false,
    ineligibleReason: 'Requires 90 days of employment',
  },
]
