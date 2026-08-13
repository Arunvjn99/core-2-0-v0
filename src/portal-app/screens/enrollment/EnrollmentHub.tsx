import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../../ui-kit/patterns/AppShell'
import { useAuth } from '../../lib/AuthContext'
import { fetchEnrollments, type Enrollment } from '../../lib/enrollment'
import { DEMO_PLANS } from '../../lib/plans'
import { IconChevronRight } from '../../../ui-kit/icons'

/**
 * Confirmed live (round 4): the "Enrollment" nav item is a plan browser,
 * NOT the risk questionnaire — All/Enrolled/Eligible filter chips, a dark
 * gradient card per enrolled plan with a "Manage" action routing to the
 * per-plan Manage Plan screen, and a white card per eligible plan with an
 * "Enroll" action routing to the /enroll wizard. The risk questionnaire
 * moved to /enrollment/questionnaire, reachable from the Dashboard's risk
 * widget ("Take Questionnaire" / "Edit Preferences").
 */
const FILTERS = ['All', 'Enrolled', 'Eligible'] as const
type Filter = (typeof FILTERS)[number]

export default function EnrollmentHub() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('All')
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetchEnrollments(session.user.id).then((rows) => !cancelled && setEnrollments(rows))
    return () => {
      cancelled = true
    }
  }, [session])

  if (enrollments === null) {
    return (
      <AppShell>
        <p className="text-core-text-muted">Loading…</p>
      </AppShell>
    )
  }

  const enrolledPlanIds = new Set(enrollments.filter((e) => e.status === 'enrolled').map((e) => e.plan_id))
  const enrolledCards = DEMO_PLANS.filter((p) => enrolledPlanIds.has(p.planId)).map((p) => ({ ...p, kind: 'enrolled' as const }))
  const eligibleCards = DEMO_PLANS.filter((p) => !enrolledPlanIds.has(p.planId)).map((p) => ({ ...p, kind: 'eligible' as const }))
  const cards =
    filter === 'Enrolled' ? enrolledCards : filter === 'Eligible' ? eligibleCards : [...enrolledCards, ...eligibleCards]

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-core-text">Enrollment</h1>
          <p className="text-[15px] text-core-text-muted">View your enrolled plans or enroll in a new one</p>
        </div>

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-[13px] font-medium ${
                filter === f
                  ? 'border-core-info bg-core-info/10 text-core-info'
                  : 'border-core-border text-core-text-muted hover:bg-core-surface'
              }`}
            >
              {f === filter && <span aria-hidden>✓ </span>}
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((plan) =>
            plan.kind === 'enrolled' ? (
              <div
                key={plan.id}
                className="flex flex-col justify-between gap-6 rounded-core-md p-5 text-white shadow-core-sm"
                style={{ backgroundImage: 'linear-gradient(135deg, #1c2a4d, #2f5d8c)' }}
              >
                <div>
                  <span className="rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide">
                    Enrolled
                  </span>
                  <p className="mt-3 text-[13px] text-white/70">Plan Name</p>
                  <p className="text-[18px] font-semibold">{plan.name}</p>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <div>
                    <p className="text-white/70">Plan ID</p>
                    <p className="font-medium">{plan.planId}</p>
                  </div>
                  <div>
                    <p className="text-white/70">Plan Type</p>
                    <p className="font-medium">{plan.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/enrollment/manage-plan?planId=${encodeURIComponent(plan.planId)}`)}
                  className="w-full rounded-core-sm py-2.5 text-[14px] font-semibold text-white"
                  style={{ backgroundImage: 'linear-gradient(90deg, var(--core-color-cta-from) 14.6%, var(--core-color-cta-to) 107.38%)' }}
                >
                  Manage
                </button>
              </div>
            ) : (
              <div key={plan.id} className="flex flex-col justify-between gap-6 rounded-core-md border border-core-border bg-core-surface p-5 shadow-core-sm">
                <div>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      plan.eligible ? 'bg-core-success-bg text-core-success' : 'bg-core-critical text-white'
                    }`}
                  >
                    {plan.eligible ? 'Eligible' : 'Ineligible'}
                  </span>
                  <p className="mt-3 text-[13px] text-core-text-muted">Plan Name</p>
                  <p className="text-[18px] font-semibold text-core-text">{plan.name}</p>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <div>
                    <p className="text-core-text-muted">Plan ID</p>
                    <p className="font-medium text-core-text">{plan.planId}</p>
                  </div>
                  <div>
                    <p className="text-core-text-muted">Plan Type</p>
                    <p className="font-medium text-core-text">{plan.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/enroll')}
                  disabled={!plan.eligible}
                  className="flex w-full items-center justify-center gap-2 rounded-core-sm border border-core-info py-2.5 text-[14px] font-semibold text-core-info disabled:cursor-not-allowed disabled:border-core-border-strong disabled:text-core-text-muted"
                >
                  Enroll <IconChevronRight className="size-3.5" />
                </button>
              </div>
            ),
          )}
          {cards.length === 0 && (
            <p className="col-span-full rounded-core-md border border-dashed border-core-border p-8 text-center text-core-text-muted">
              No plans to show for this filter.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  )
}
