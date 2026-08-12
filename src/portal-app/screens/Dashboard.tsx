import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../ui-kit/patterns/AppShell'
import { PlanCard, type Plan } from '../../ui-kit/patterns/PlanCard'
import { RiskGauge } from '../../ui-kit/patterns/RiskGauge'
import { IconSparkles } from '../../ui-kit/icons'
import { useAuth } from '../lib/AuthContext'
import { fetchLatestRiskProfile, type RiskProfilePlan } from '../lib/riskProfile'
import wavingHand from '../../assets/dashboard/waving-hand.png'
import learningIllustration from '../../assets/dashboard/learning-illustration.png'

/**
 * Figma: node 2893:56916 "Dashboard-not-enrolled-pre enrollment" (canonical —
 * matches the Login screen's demo user "Margot Robbie" / Galileo brand).
 *
 * TODO(task #7 follow-up): plans currently come from static demo data —
 * once a `core2.plans` / `core2.enrollments` table exists, replace with a
 * live query keyed to the participant's client_id.
 */
const DEMO_PLANS: Plan[] = [
  { id: 'p1', name: '401(K) Save More', planId: '124542', type: '401(K)', eligible: false },
  { id: 'p2', name: '401(K) Save More', planId: '124542', type: '401(K)', eligible: false },
]

export default function Dashboard() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [showIneligible, setShowIneligible] = useState(true)
  const [riskProfile, setRiskProfile] = useState<RiskProfilePlan | null>(null)
  const [riskLoading, setRiskLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetchLatestRiskProfile(session.user.id)
      .then((profile) => {
        if (!cancelled) setRiskProfile(profile)
      })
      .finally(() => {
        if (!cancelled) setRiskLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [session])

  const firstName = useMemo(() => {
    const meta = session?.user.user_metadata as { first_name?: string; full_name?: string } | undefined
    return meta?.first_name ?? meta?.full_name?.split(' ')[0] ?? 'there'
  }, [session])

  const visiblePlans = showIneligible ? DEMO_PLANS : DEMO_PLANS.filter((p) => p.eligible)

  return (
    <AppShell>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div
            className="flex items-center rounded-core-md bg-core-surface p-6 shadow-[0_1px_1px_rgba(0,0,0,0.25)] sm:p-8"
            style={{
              backgroundImage:
                'radial-gradient(circle at 0 0, rgba(103,252,189,0.2), rgba(69,238,249,0) 90%)',
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <img src={wavingHand} alt="" className="size-6" />
                <p className="text-2xl font-semibold text-core-text">Hello, {firstName}!</p>
              </div>
              <p className="text-core-text-muted">How have you been?</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[22px] font-semibold text-core-text">Let's Find You the Best Plan</p>
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
                {visiblePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onEnroll={() => navigate('/enroll')} />
                ))}
                {visiblePlans.length === 0 && (
                  <p className="rounded-core-md border border-dashed border-core-border p-6 text-center text-core-text-muted">
                    No eligible plans to show right now.
                  </p>
                )}
              </div>

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
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 rounded-core-md bg-core-surface p-4 shadow-[0_1px_3px_rgba(0,0,0,0.25)] lg:w-[280px]">
          <div className="flex flex-col items-center gap-4">
            <div className="flex w-full items-center justify-between">
              <p className="text-[18px] font-semibold text-core-text">Risk Level</p>
              {riskProfile && (
                <span className="rounded-full bg-core-warning-bg px-2 py-1 text-[14px] font-semibold text-core-warning">
                  {riskProfile.level} Investor
                </span>
              )}
            </div>

            {riskLoading ? (
              <p className="py-8 text-[14px] text-core-text-muted">Loading…</p>
            ) : riskProfile ? (
              <>
                <RiskGauge level={riskProfile.level} />
                <p className="text-[16px] font-semibold uppercase tracking-tight text-core-text">
                  {riskProfile.level}
                </p>
                <p className="text-center text-[12px] leading-[18px] text-core-text-muted">
                  We picked this investment style based on how you answered the questionnaire. Want to
                  change it? You can go back and update your answers.
                </p>
                <button
                  onClick={() => navigate('/enrollment')}
                  className="flex items-center gap-2 rounded-core-sm px-3 py-2 text-[12px] font-medium text-white"
                  style={{ backgroundImage: 'linear-gradient(90deg, var(--core-color-cta-from) 14.6%, var(--core-color-cta-to) 107.38%)' }}
                >
                  <IconSparkles className="size-4" />
                  Edit Preferences
                </button>
              </>
            ) : (
              <>
                <p className="text-center text-[13px] text-core-text-muted">
                  Take the quick questionnaire to see your personalized risk level.
                </p>
                <button
                  onClick={() => navigate('/enrollment')}
                  className="flex items-center gap-2 rounded-core-sm px-3 py-2 text-[12px] font-medium text-white"
                  style={{ backgroundImage: 'linear-gradient(90deg, var(--core-color-cta-from) 14.6%, var(--core-color-cta-to) 107.38%)' }}
                >
                  <IconSparkles className="size-4" />
                  Take Questionnaire
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
