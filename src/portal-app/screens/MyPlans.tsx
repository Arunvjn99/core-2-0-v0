import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../ui-kit/patterns/AppShell'
import { useAuth } from '../lib/AuthContext'
import { fetchEnrollments, type Enrollment } from '../lib/enrollment'

/**
 * "View summary" destination from the post-enrollment Dashboard — lists
 * every plan the participant has completed the enrollment wizard for, with
 * their actual saved elections (no hardcoded values, all read from
 * core2.enrollments). Figma doesn't have a single dedicated frame for this
 * exact list (the closest is the Dashboard's own "Plans you are enrolled
 * in" card), so this reuses the portal's existing card/summary-row
 * patterns rather than inventing a new visual language.
 */
export default function MyPlans() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetchEnrollments(session.user.id).then((rows) => !cancelled && setEnrollments(rows))
    return () => {
      cancelled = true
    }
  }, [session])

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div>
          <button onClick={() => navigate('/dashboard')} className="text-[14px] font-semibold text-core-info">
            ‹ Back
          </button>
          <h1 className="text-[22px] font-semibold text-core-text">My Plans</h1>
          <p className="text-[14px] text-core-text-muted">Plans you've enrolled in and their current elections.</p>
        </div>

        {enrollments === null ? (
          <p className="text-core-text-muted">Loading…</p>
        ) : enrollments.length === 0 ? (
          <p className="rounded-core-md border border-dashed border-core-border p-8 text-center text-core-text-muted">
            You haven't enrolled in a plan yet.{' '}
            <button onClick={() => navigate('/dashboard')} className="font-semibold text-core-info">
              Browse plans
            </button>
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {enrollments.map((e) => (
              <div key={e.id} className="flex flex-col gap-4 rounded-core-md border border-core-border bg-core-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[17px] font-semibold text-core-text">{e.plan_name}</p>
                    <p className="text-[13px] text-core-text-muted">
                      Plan ID {e.plan_id} · Enrolled {new Date(e.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-core-success-bg px-3 py-1 text-[12px] font-semibold uppercase text-core-success">
                    {e.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-core-border pt-4 sm:grid-cols-3">
                  <div>
                    <p className="mb-1 text-[12px] font-semibold text-core-text-muted">Contribution</p>
                    <Row label="Pretax" value={`${e.contribution?.pretax ?? 0}%`} />
                    <Row label="Roth" value={`${e.contribution?.roth ?? 0}%`} />
                    <Row label="After tax" value={`${e.contribution?.afterTax ?? 0}%`} />
                  </div>
                  <div>
                    <p className="mb-1 text-[12px] font-semibold text-core-text-muted">Auto Increase</p>
                    <Row label="Enabled" value={e.auto_increase?.enabled ? 'Yes' : 'No'} />
                    {e.auto_increase?.enabled && (
                      <>
                        <Row label="Pretax rate" value={`+${e.auto_increase.pretaxRate}%/yr`} />
                        <Row label="Cap" value={`${e.auto_increase.limit}%`} />
                      </>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-[12px] font-semibold text-core-text-muted">Investments</p>
                    <Row label="Mode" value={e.investments?.mode === 'manual' ? 'Manual' : 'Plan default'} />
                    <Row label="Auto-rebalance" value={e.investments?.autoRebalance ? 'Enabled' : 'Disabled'} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-core-text-muted">{label}</span>
      <span className="font-medium text-core-text">{value}</span>
    </div>
  )
}
