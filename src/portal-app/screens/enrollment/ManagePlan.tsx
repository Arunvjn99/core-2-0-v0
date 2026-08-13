import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '../../../ui-kit/patterns/AppShell'
import { Button } from '../../../ui-kit/primitives/Button'
import { useAuth } from '../../lib/AuthContext'
import { useToast } from '../../../ui-kit/lib/ToastContext'
import { fetchEnrollmentByPlanId, setEnrollmentStatus, estimateBalances, type Enrollment } from '../../lib/enrollment'

/**
 * Confirmed live (round 4): route `/participant/enrollment/manage-plan?planId=…`
 * — a single selected plan's management view (balance pair, Contribution
 * Election, Investment Election w/ Breakdown, Auto-Features w/ per-source
 * ADI table, Opt-Out Plan / Edit actions). Replaces the old /my-plans
 * stacked-history approach with the real per-plan drill-in.
 */
export default function ManagePlan() {
  const { session } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const planId = params.get('planId') ?? ''
  const [enrollment, setEnrollment] = useState<Enrollment | null | undefined>(undefined)
  const [optingOut, setOptingOut] = useState(false)
  const [breakdown, setBreakdown] = useState(false)

  useEffect(() => {
    if (!session || !planId) return
    let cancelled = false
    fetchEnrollmentByPlanId(session.user.id, planId).then((row) => !cancelled && setEnrollment(row))
    return () => {
      cancelled = true
    }
  }, [session, planId])

  async function handleOptOut() {
    if (!enrollment) return
    setOptingOut(true)
    try {
      await setEnrollmentStatus(enrollment.id, 'opted_out')
      setEnrollment({ ...enrollment, status: 'opted_out' })
      show('Plan opted out')
    } catch (e) {
      show(e instanceof Error ? e.message : 'Could not opt out', 'error')
    } finally {
      setOptingOut(false)
    }
  }

  if (enrollment === undefined) {
    return (
      <AppShell>
        <p className="text-core-text-muted">Loading…</p>
      </AppShell>
    )
  }

  if (enrollment === null) {
    return (
      <AppShell>
        <button onClick={() => navigate('/enrollment')} className="text-[14px] font-semibold text-core-info">
          ‹ Back
        </button>
        <p className="mt-4 rounded-core-md border border-dashed border-core-border p-8 text-center text-core-text-muted">
          You're not enrolled in this plan.
        </p>
      </AppShell>
    )
  }

  const { totalBalance, vestedBalance } = estimateBalances(planId)
  const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const sources = [
    { name: 'PRETAX', pct: enrollment.contribution?.pretax ?? 0 },
    { name: 'ROTH', pct: enrollment.contribution?.roth ?? 0 },
    { name: 'AFTERTAX', pct: enrollment.contribution?.afterTax ?? 0 },
  ].filter((s) => s.pct > 0)

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => navigate('/enrollment')} className="text-[14px] font-semibold text-core-info">
              ‹ Back
            </button>
            <h1 className="text-[22px] font-semibold text-core-text">{enrollment.plan_name}</h1>
            <p className="text-[13px] text-core-text-muted">Plan ID {planId} | 401(K)</p>
          </div>
          {enrollment.status === 'opted_out' && (
            <span className="rounded-full bg-core-critical/10 px-3 py-1 text-[12px] font-semibold uppercase text-core-critical">
              Opted out
            </span>
          )}
        </div>

        <div className="flex gap-8 rounded-core-md bg-core-surface p-5 shadow-core-sm">
          <div>
            <p className="text-[18px] font-semibold text-core-text">{money(totalBalance)}</p>
            <p className="text-[12px] text-core-text-muted">Plan balance</p>
          </div>
          <div>
            <p className="text-[18px] font-semibold text-core-text">{money(vestedBalance)}</p>
            <p className="text-[12px] text-core-text-muted">Vested balance</p>
          </div>
        </div>

        <div className="rounded-core-md bg-core-surface p-5 shadow-core-sm">
          <h3 className="mb-3 text-[15px] font-semibold text-core-text">Contribution Election</h3>
          <div className="flex flex-col gap-2">
            {sources.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-[14px]">
                <span className="text-core-text">{s.name}</span>
                <span className="font-medium text-core-text">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-core-md bg-core-surface p-5 shadow-core-sm">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-core-text">Investment Election</h3>
            <button onClick={() => setBreakdown((v) => !v)} className="text-[13px] font-semibold text-core-info">
              Breakdown
            </button>
          </div>
          <div className="flex flex-col gap-2 text-[14px]">
            {sources.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="text-core-text">{s.name}</span>
                <span className="font-medium text-core-text">{enrollment.investments?.mode === 'manual' ? 'Manual' : '100%'}</span>
              </div>
            ))}
          </div>
          {breakdown && (
            <p className="mt-3 border-t border-core-border pt-3 text-[13px] text-core-text-muted">
              {enrollment.investments?.mode === 'manual'
                ? 'Manual fund allocation — see Investment Portfolio for the full breakdown.'
                : 'Invested per the plan default allocation across all elected sources.'}
            </p>
          )}
        </div>

        <div className="rounded-core-md bg-core-surface p-5 shadow-core-sm">
          <h3 className="mb-3 text-[15px] font-semibold text-core-text">Auto-Features</h3>
          <div className="mb-3 flex items-center justify-between text-[14px]">
            <span className="text-core-text-muted">Period of increase</span>
            <span className="font-medium text-core-text">
              {enrollment.auto_increase?.enabled ? 'Calendar Year' : '—'}
            </span>
          </div>
          {enrollment.auto_increase?.enabled ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-core-text-muted">
                    <th className="pb-2 font-medium">Source name</th>
                    <th className="pb-2 font-medium">ADI</th>
                    <th className="pb-2 font-medium">ADI stops at</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-core-border">
                    <td className="py-2 text-core-text">PRETAX</td>
                    <td className="py-2 text-core-text">+{enrollment.auto_increase.pretaxRate}%/yr</td>
                    <td className="py-2 text-core-text">{enrollment.auto_increase.limit}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[13px] text-core-text-muted">Auto increase is not enabled for this plan.</p>
          )}
          <div className="mt-4 flex flex-col gap-1 border-t border-core-border pt-3 text-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-core-text-muted">Smart rebalance</span>
              <span className="font-medium text-core-text">{enrollment.investments?.autoRebalance ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-core-text-muted">Auto rebalance</span>
              <span className="font-medium text-core-text">{enrollment.investments?.autoRebalance ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            loading={optingOut}
            disabled={enrollment.status === 'opted_out'}
            onClick={handleOptOut}
          >
            Opt-Out Plan
          </Button>
          <Button variant="cta" onClick={() => navigate('/enroll')}>
            Edit
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
