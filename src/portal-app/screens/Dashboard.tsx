import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../ui-kit/patterns/AppShell'
import { PlanCard, type Plan } from '../../ui-kit/patterns/PlanCard'
import { RiskGauge } from '../../ui-kit/patterns/RiskGauge'
import { IconSparkles, IconChevronRight } from '../../ui-kit/icons'
import { useAuth } from '../lib/AuthContext'
import { fetchLatestRiskProfile, type RiskProfilePlan } from '../lib/riskProfile'
import { fetchEnrollments, type Enrollment } from '../lib/enrollment'
import { supabase } from '../../lib/supabaseClient'
import wavingHand from '../../assets/dashboard/waving-hand.png'
import learningIllustration from '../../assets/dashboard/learning-illustration.png'

/**
 * Figma: pre-enrollment node 2893:56916 "Dashboard-not-enrolled-pre
 * enrollment", post-enrollment node 2893:57381 "Dashboard-Post enrolled".
 * The two are genuinely different layouts, not a toggle within one screen —
 * which dashboard a participant sees is driven entirely by whether
 * `core2.enrollments` has any row for them (see lib/enrollment.ts), never
 * a hardcoded flag. First-time users land pre-enrollment, pick a plan,
 * finish the /enroll wizard, and from then on see the post-enrollment
 * dashboard with a "My Plans" summary + an "Explore more plans" section
 * for anything else they're eligible for.
 *
 * TODO(follow-up): plan catalog (name/id/type/eligibility) is still static
 * demo data — no `core2.plans` catalog table exists yet. Once it does,
 * replace DEMO_PLANS with a live query; the enrolled/eligible filtering
 * logic below already keys off `plan_id`, so the swap is contained here.
 */
const DEMO_PLANS: Plan[] = [
  { id: 'p1', name: '401(K) Company Plan High Returns', planId: '124542', type: '401(K)', eligible: true },
  { id: 'p2', name: '401(K) Mindblock Simple', planId: '124542', type: '401(K)', eligible: true },
  {
    id: 'p3',
    name: '401(K) Save More',
    planId: '124599',
    type: '401(K)',
    eligible: false,
    ineligibleReason: 'Requires 90 days of employment',
  },
]

export default function Dashboard() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [showIneligible, setShowIneligible] = useState(true)
  const [riskProfile, setRiskProfile] = useState<RiskProfilePlan | null>(null)
  const [riskLoading, setRiskLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null)
  const [txCount, setTxCount] = useState<number | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const uid = session.user.id

    fetchLatestRiskProfile(uid)
      .then((profile) => !cancelled && setRiskProfile(profile))
      .finally(() => !cancelled && setRiskLoading(false))

    fetchEnrollments(uid).then((rows) => !cancelled && setEnrollments(rows))

    supabase
      .from('transaction_requests')
      .select('id', { count: 'exact', head: true })
      .eq('participant_id', uid)
      .then(({ count }) => !cancelled && setTxCount(count ?? 0))

    return () => {
      cancelled = true
    }
  }, [session])

  const firstName = useMemo(() => {
    const meta = session?.user.user_metadata as { first_name?: string; full_name?: string } | undefined
    return meta?.first_name ?? meta?.full_name?.split(' ')[0] ?? 'there'
  }, [session])

  const enrolledPlanIds = new Set((enrollments ?? []).map((e) => e.plan_id))
  const explorablePlans = DEMO_PLANS.filter((p) => !enrolledPlanIds.has(p.planId))
  const visibleExplorablePlans = showIneligible ? explorablePlans : explorablePlans.filter((p) => p.eligible)

  const riskWidget =
    riskLoading ? (
      <p className="py-8 text-[14px] text-core-text-muted">Loading…</p>
    ) : riskProfile ? (
      <>
        <RiskGauge level={riskProfile.level} />
        <p className="text-[16px] font-semibold uppercase tracking-tight text-core-text">{riskProfile.level}</p>
        <p className="text-center text-[12px] leading-[18px] text-core-text-muted">
          We picked this investment style based on how you answered the questionnaire. Want to change it? You can
          go back and update your answers.
        </p>
        <button onClick={() => navigate('/enrollment')} className="dashboard-cta-btn">
          <IconSparkles className="size-4" />
          Edit Preferences
        </button>
      </>
    ) : (
      <>
        <p className="text-center text-[13px] text-core-text-muted">
          Take the quick questionnaire to see your personalized risk level.
        </p>
        <button onClick={() => navigate('/enrollment')} className="dashboard-cta-btn">
          <IconSparkles className="size-4" />
          Take Questionnaire
        </button>
      </>
    )

  // Still loading enrollment state — avoid a flash of the wrong dashboard.
  if (enrollments === null) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center text-core-text-muted">Loading your dashboard…</div>
      </AppShell>
    )
  }

  const isEnrolled = enrollments.length > 0

  return (
    <AppShell>
      <style>{`.dashboard-cta-btn{display:flex;align-items:center;gap:8px;border-radius:var(--radius-core-sm);padding:8px 12px;font-size:12px;font-weight:500;color:#fff;background-image:linear-gradient(90deg,var(--core-color-cta-from) 14.6%,var(--core-color-cta-to) 107.38%)}`}</style>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {isEnrolled ? (
            <PostEnrollmentSummary firstName={firstName} enrollments={enrollments} txCount={txCount} navigate={navigate} />
          ) : (
            <div
              className="flex items-center rounded-core-md bg-core-surface p-6 shadow-[0_1px_1px_rgba(0,0,0,0.25)] sm:p-8"
              style={{ backgroundImage: 'radial-gradient(circle at 0 0, rgba(103,252,189,0.2), rgba(69,238,249,0) 90%)' }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <img src={wavingHand} alt="" className="size-6" />
                  <p className="text-2xl font-semibold text-core-text">Hello, {firstName}!</p>
                </div>
                <p className="text-core-text-muted">How have you been?</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[22px] font-semibold text-core-text">
                {isEnrolled ? 'Explore More Plans' : "Let's Find You the Best Plan"}
              </p>
              <label className="flex items-center gap-2 text-[16px] font-medium text-core-text">
                Show Ineligible plans
                <button
                  role="switch"
                  aria-checked={showIneligible}
                  onClick={() => setShowIneligible((v) => !v)}
                  className="relative h-[26px] w-[48px] rounded-full transition-colors"
                  style={{
                    backgroundImage: showIneligible
                      ? 'linear-gradient(90deg, var(--core-color-cta-from) 14.6%, var(--core-color-cta-to) 107.38%)'
                      : undefined,
                    backgroundColor: showIneligible ? undefined : '#c0c1c4',
                  }}
                >
                  <span
                    className={`absolute top-[3px] size-5 rounded-full bg-white shadow-[0_2px_2px_rgba(78,93,104,0.2)] transition-all ${
                      showIneligible ? 'left-[25px]' : 'left-[3px]'
                    }`}
                  />
                </button>
              </label>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-1 flex-col gap-4">
                {visibleExplorablePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onEnroll={() => navigate('/enroll')} />
                ))}
                {visibleExplorablePlans.length === 0 && (
                  <p className="rounded-core-md border border-dashed border-core-border p-6 text-center text-core-text-muted">
                    {isEnrolled ? "You're enrolled in every plan you're currently eligible for." : 'No eligible plans to show right now.'}
                  </p>
                )}
              </div>

              {!isEnrolled && (
                <div className="w-full shrink-0 rounded-core-md bg-core-surface p-3.5 shadow-[0_1px_1.5px_rgba(0,0,0,0.25)] md:w-[238px]">
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex w-full items-center justify-center rounded-core-sm bg-core-info/10 px-10 py-4">
                      <img src={learningIllustration} alt="" className="h-[118px] w-32 object-cover" />
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-core-primary/10 px-2 py-1 text-[12px] font-medium text-core-primary">
                      🎓 Learning
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-[14px] font-medium text-core-text-muted">Financial Wellness</p>
                      <p className="text-[12px] leading-relaxed text-core-text-muted/80">
                        Learn about planning, saving, investing wisely
                      </p>
                    </div>
                    <button className="rounded-[6px] border border-core-info bg-core-info px-3.5 py-1 text-[12px] font-medium text-core-info-contrast shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
                      Know More
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[280px]">
          {isEnrolled && <RetirementGoalSimulator />}

          <div className="rounded-core-md bg-core-surface p-4 shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col items-center gap-4">
              <div className="flex w-full items-center justify-between">
                <p className="text-[18px] font-semibold text-core-text">Risk Level</p>
                {riskProfile && (
                  <span className="rounded-full bg-core-warning-bg px-2 py-1 text-[14px] font-semibold text-core-warning">
                    {riskProfile.level} Investor
                  </span>
                )}
              </div>
              {riskWidget}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function money(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** "Plans you are enrolled in" summary card — Figma node 2893:57381. */
function PostEnrollmentSummary({
  firstName,
  enrollments,
  txCount,
  navigate,
}: {
  firstName: string
  enrollments: Enrollment[]
  txCount: number | null
  navigate: (path: string) => void
}) {
  const primary = enrollments[0]
  // No balances/holdings table exists yet (core2 tracks elections, not
  // ledger data) — these two figures are placeholders derived deterministically
  // from the plan id so they're stable per participant rather than random.
  const seed = primary.plan_id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const totalBalance = 10000 + (seed % 20) * 500
  const vestedBalance = totalBalance * 0.85

  return (
    <div className="flex flex-col gap-4 rounded-core-md bg-core-surface p-6 shadow-[0_1px_1px_rgba(0,0,0,0.25)] sm:p-8">
      <div className="flex items-center gap-2">
        <img src={wavingHand} alt="" className="size-6" />
        <p className="text-2xl font-semibold text-core-text">Hello, {firstName}!</p>
      </div>
      <p className="-mt-2 text-core-text-muted">How have you been?</p>

      <div className="flex flex-col justify-between gap-4 border-t border-core-border pt-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[13px] text-core-text-muted">Plans you are enrolled in</p>
          <p className="text-[18px] font-semibold text-core-text">{primary.plan_name}</p>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-core-text-muted">
            <span>Plan ID {primary.plan_id}</span>
            <span aria-hidden>•</span>
            <span className="font-medium text-core-info">Regular Plan</span>
          </div>
        </div>
        <div className="flex gap-8">
          <div>
            <p className="text-[18px] font-semibold text-core-text">{money(vestedBalance)}</p>
            <p className="text-[12px] text-core-text-muted">Total Vested Balance</p>
          </div>
          <div>
            <p className="text-[18px] font-semibold text-core-text">{money(totalBalance)}</p>
            <p className="text-[12px] text-core-text-muted">Total balance</p>
          </div>
        </div>
      </div>
      <button onClick={() => navigate('/my-plans')} className="self-start text-[14px] font-semibold text-core-info">
        View summary
      </button>

      <div className="mt-2 grid grid-cols-1 gap-4 border-t border-core-border pt-4 md:grid-cols-3">
        <div className="rounded-core-sm border border-core-border p-4 md:col-span-1">
          <p className="text-[13px] font-semibold text-core-text-muted">Recent Transactions</p>
          {txCount ? (
            <>
              <p className="mt-3 text-[15px] font-semibold text-core-text">
                {txCount} request{txCount === 1 ? '' : 's'}
              </p>
              <button onClick={() => navigate('/transactions')} className="mt-2 text-[13px] font-semibold text-core-info">
                See all <IconChevronRight className="ml-0.5 inline size-2.5" />
              </button>
            </>
          ) : (
            <>
              <p className="mt-3 text-[13px] text-core-text-muted">No Transactions Yet</p>
              <p className="text-[12px] text-core-text-muted/80">Start contributing to see your transactions here.</p>
            </>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 rounded-core-sm bg-core-info/5 p-4 md:col-span-2">
          <span className="flex items-center gap-1 rounded-full bg-core-primary/10 px-2 py-1 text-[12px] font-medium text-core-primary">
            🎓 Learning
          </span>
          <p className="text-[14px] font-medium text-core-text-muted">Financial Wellness</p>
          <p className="text-[12px] text-core-text-muted/80">Learn about planning, saving, investing wisely</p>
          <button className="rounded-[6px] border border-core-info bg-core-info px-3.5 py-1 text-[12px] font-medium text-core-info-contrast">
            Know More
          </button>
        </div>
      </div>
    </div>
  )
}

/** Blue "Retirement Goal Simulator" card — Figma node 2893:57381 (right rail). */
function RetirementGoalSimulator() {
  const score = 85
  const rows = [
    { label: 'Expected expense', value: '$20,000', color: '#16a34a' },
    { label: 'Social security', value: '$2,000', color: '#eab308' },
    { label: 'Other income', value: '$2,000', color: '#3b82f6' },
    { label: 'Plan income', value: '$13,000', color: '#8b5cf6' },
    { label: 'Short fall', value: '$3,000', color: '#ef4444' },
  ]
  return (
    <div className="overflow-hidden rounded-core-md shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
      <div className="bg-[linear-gradient(135deg,#2f6fb0,#1c4f8c)] px-4 py-3">
        <p className="text-[15px] font-semibold text-white">Retirement Goal Simulator</p>
        <p className="text-[12px] text-white/80">See how your inputs affect your savings, income, risk.</p>
      </div>
      <div className="flex flex-col gap-3 bg-core-surface p-4">
        <div className="flex items-center gap-4">
          <div
            className="flex size-20 shrink-0 items-center justify-center rounded-full text-[20px] font-bold text-core-text"
            style={{
              background: `conic-gradient(#16a34a 0% 25%, #eab308 25% 45%, #3b82f6 45% 65%, #8b5cf6 65% 90%, #ef4444 90% 100%)`,
            }}
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-core-surface">{score}</span>
          </div>
          <ul className="flex flex-1 flex-col gap-1 text-[12px] text-core-text-muted">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
                  {r.label}
                </span>
                <span className={r.label === 'Short fall' ? 'font-semibold text-core-critical' : 'font-medium text-core-text'}>
                  {r.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-core-sm bg-core-success-bg p-3 text-center">
          <p className="text-[13px] font-semibold text-core-success">🚀 Excellent!</p>
          <p className="text-[11px] text-core-text-muted">Your plan is perfectly set up for retirement.</p>
        </div>
        <p className="text-[10px] text-core-text-muted">
          *Not guaranteed results. It's a simulation. For more details <span className="underline">Read more</span>
        </p>
      </div>
    </div>
  )
}
