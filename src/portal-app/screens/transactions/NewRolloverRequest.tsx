import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../../ui-kit/patterns/AppShell'
import { Button } from '../../../ui-kit/primitives/Button'
import { Select } from '../../../ui-kit/primitives/Select'
import { TextField } from '../../../ui-kit/primitives/TextField'
import { useAuth } from '../../lib/AuthContext'
import { useToast } from '../../../ui-kit/lib/ToastContext'
import { supabase } from '../../../lib/supabaseClient'

/**
 * New Rollover Request — the flow deliberately deferred since round 2 in
 * favor of building New Transfer Request as the template first (see
 * ANALYSIS.md). No live-demo or Figma screenshot was available for this
 * exact screen, so it follows the same structural pattern as
 * NewTransferRequest (source breakdown, real Supabase write, dedicated
 * summary screen) with the fields a rollover genuinely needs: incoming
 * account details rather than an outgoing investment to sell.
 */
const ACCOUNT_TYPES = ['Traditional 401(k)', 'Roth 401(k)', 'Traditional IRA', 'Roth IRA', '403(b)']
const SOURCES = ['PRETAX', 'ROTH', 'AFTERTAX'] as const

export default function NewRolloverRequest() {
  const { session } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const [institution, setInstitution] = useState('')
  const [accountType, setAccountType] = useState(ACCOUNT_TYPES[0])
  const [accountNumber, setAccountNumber] = useState('')
  const [amounts, setAmounts] = useState<Record<string, number>>({ PRETAX: 0, ROTH: 0, AFTERTAX: 0 })
  const [submitting, setSubmitting] = useState(false)

  const total = Object.values(amounts).reduce((a, b) => a + b, 0)
  const canSubmit = institution.trim() && total > 0

  async function handleSubmit() {
    if (!session || !canSubmit) return
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('transaction_requests')
        .insert({
          participant_id: session.user.id,
          request_type: 'rollover',
          status: 'pending',
          details: {
            institution: institution.trim(),
            accountType,
            accountNumber: accountNumber.trim(),
            amounts,
            amount: total,
          },
        })
        .select('transaction_ref')
        .single()
      if (error) throw error
      show(`Rollover request submitted — track it with #${data.transaction_ref}`)
      navigate(`/transactions/rollover-summary?ref=${encodeURIComponent(data.transaction_ref)}`)
    } catch (e) {
      show(e instanceof Error ? e.message : 'Could not submit request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-core-text">New Rollover Request</h1>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/transactions')}>
              Cancel
            </Button>
            <Button variant="cta" loading={submitting} disabled={!canSubmit} onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>

        <div className="rounded-core-md border border-core-border bg-core-surface p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-core-text">Prior Account Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Prior institution / employer"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Fidelity, Prior Employer 401(k)"
            />
            <Select label="Account type" value={accountType} onChange={(e) => setAccountType(e.target.value)}>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
            <TextField
              label="Prior account number (optional)"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-core-md border border-core-border bg-core-surface p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-core-text">Rollover Amount by Source</h3>
          <div className="flex flex-col gap-3">
            {SOURCES.map((source) => (
              <div key={source} className="flex items-center justify-between rounded-core-sm border border-core-border p-3">
                <p className="text-[13px] font-semibold text-core-text">{source}</p>
                <label className="flex items-center gap-1 text-[13px] text-core-text-muted">
                  Amount
                  <span className="flex items-center rounded border border-core-border bg-core-bg px-2 py-1">
                    $
                    <input
                      type="number"
                      min={0}
                      value={amounts[source]}
                      onChange={(e) => setAmounts((prev) => ({ ...prev, [source]: Number(e.target.value) }))}
                      className="w-24 bg-transparent px-1 text-right text-core-text outline-none"
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
    </AppShell>
  )
}
