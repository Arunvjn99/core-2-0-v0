import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../../ui-kit/patterns/AppShell'
import { Button } from '../../../ui-kit/primitives/Button'
import { useAuth } from '../../lib/AuthContext'
import { useToast } from '../../../ui-kit/lib/ToastContext'
import { supabase } from '../../../lib/supabaseClient'

/**
 * Figma: "New Transfer Request" (node 2893:8306, full desktop screen —
 * misleadingly nested under a duplicate "Dashboard-not-enrolled" template
 * frame in the raw file, which is why it wasn't found on the first pass).
 * Select investment(s) to sell, choose transfer-by mode, enter per-source
 * amounts.
 */
const SOURCES = ['PRETAX', 'AFTERTAX', 'MATCH', 'ROTH'] as const
type TransferBy = 'Units' | 'Amount' | 'Percentage'

const INVESTMENT = { name: 'Pioneer Equity Income A', balance: 5831.6, units: 971.933 }

export default function NewTransferRequest() {
  const { session } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const [transferBy, setTransferBy] = useState<TransferBy>('Amount')
  const [amounts, setAmounts] = useState<Record<string, number>>({ PRETAX: 0, AFTERTAX: 0, MATCH: 0, ROTH: 0 })
  const [submitting, setSubmitting] = useState(false)

  const total = Object.values(amounts).reduce((a, b) => a + b, 0)

  async function handleSubmit() {
    if (!session || total <= 0) return
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('transaction_requests')
        .insert({
          participant_id: session.user.id,
          request_type: 'transfer',
          status: 'pending',
          details: { investment: INVESTMENT.name, transferBy, amounts, amount: total },
        })
        .select('transaction_ref')
        .single()
      if (error) throw error
      show(`Transfer request submitted — track it with #${data.transaction_ref}`)
      navigate('/transactions')
    } catch (e) {
      show(e instanceof Error ? e.message : 'Could not submit request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-core-text">New Transfer Request</h1>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/transactions')}>
              Cancel
            </Button>
            <Button variant="cta" loading={submitting} disabled={total <= 0} onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-core-md bg-core-surface p-5 shadow-core-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-[13px] text-core-text-muted">Plan details</p>
            <p className="text-[18px] font-semibold text-core-text">401(K) Mindblock Simple</p>
            <p className="text-[13px] text-core-text-muted">Plan ID 124542 · Type 401(K)</p>
          </div>
          <div className="flex gap-8 text-right">
            <div>
              <p className="text-[18px] font-semibold text-core-text">$13,273.08</p>
              <p className="text-[13px] text-core-text-muted">Plan balance</p>
            </div>
            <div>
              <p className="text-[18px] font-semibold text-core-text">$9,899.05</p>
              <p className="text-[13px] text-core-text-muted">Vested balance</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-core-md border border-core-border bg-core-surface p-5 lg:flex-row">
          <div className="w-full shrink-0 lg:w-[220px]">
            <p className="mb-1 text-[13px] font-semibold text-core-text">Selected Investments</p>
            <p className="mb-3 text-[12px] text-core-text-muted">1 Investment(s)</p>
            <div className="rounded-core-sm border border-core-info bg-core-info/5 p-3">
              <p className="text-[14px] font-medium text-core-text">{INVESTMENT.name}</p>
              <p className="text-[12px] text-core-text-muted">
                Available balance & Units
                <br />${INVESTMENT.balance.toLocaleString()} in {INVESTMENT.units} Units
              </p>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[14px] font-semibold text-core-critical">
                Investment to sell — ({INVESTMENT.name})
              </p>
              <div className="flex overflow-hidden rounded-core-sm border border-core-border">
                {(['Units', 'Amount', 'Percentage'] as TransferBy[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTransferBy(t)}
                    className={`px-3 py-1.5 text-[13px] font-medium ${
                      transferBy === t ? 'bg-core-info text-white' : 'bg-core-surface text-core-text-muted'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {SOURCES.map((source) => (
                <div key={source} className="flex items-center justify-between rounded-core-sm border border-core-border p-3">
                  <div>
                    <p className="text-[13px] font-semibold text-core-text">{source}</p>
                    <p className="text-[12px] text-core-text-muted">Holding $526.46 in Units 87.7434</p>
                  </div>
                  <label className="flex items-center gap-1 text-[13px] text-core-text-muted">
                    Sell amount
                    <span className="flex items-center rounded border border-core-border bg-core-bg px-2 py-1">
                      $
                      <input
                        type="number"
                        min={0}
                        value={amounts[source]}
                        onChange={(e) => setAmounts((prev) => ({ ...prev, [source]: Number(e.target.value) }))}
                        className="w-20 bg-transparent px-1 text-right text-core-text outline-none"
                      />
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <p className="mt-4 text-right text-[14px] font-semibold text-core-text">
              Total: ${total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
