import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '../../../ui-kit/patterns/AppShell'
import { Button } from '../../../ui-kit/primitives/Button'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../../lib/supabaseClient'

type RolloverDetails = {
  institution: string
  accountType: string
  accountNumber: string
  amounts: Record<string, number>
  amount: number
}

type Row = {
  status: string
  transaction_ref: string
  created_at: string
  details: RolloverDetails
}

/** Post-submit landing screen for New Rollover Request — same pattern as TransferSummary. */
export default function RolloverSummary() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const ref = params.get('ref') ?? ''
  const [row, setRow] = useState<Row | null | undefined>(undefined)

  useEffect(() => {
    if (!session || !ref) return
    let cancelled = false
    supabase
      .from('transaction_requests')
      .select('status, transaction_ref, created_at, details')
      .eq('participant_id', session.user.id)
      .eq('transaction_ref', ref)
      .maybeSingle()
      .then(({ data }) => !cancelled && setRow(data as Row | null))
    return () => {
      cancelled = true
    }
  }, [session, ref])

  if (row === undefined) {
    return (
      <AppShell>
        <p className="text-core-text-muted">Loading…</p>
      </AppShell>
    )
  }

  if (row === null) {
    return (
      <AppShell>
        <p className="rounded-core-md border border-dashed border-core-border p-8 text-center text-core-text-muted">
          We couldn't find that rollover request.
        </p>
      </AppShell>
    )
  }

  const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-core-success-bg text-3xl">✓</span>
        <div>
          <h1 className="text-[22px] font-semibold text-core-text">Rollover Request Submitted</h1>
          <p className="mt-1 text-[14px] text-core-text-muted">
            We're processing your request — you can track its status here anytime.
          </p>
        </div>

        <div className="w-full rounded-core-md border border-core-border bg-core-surface p-6 text-left">
          <div className="flex items-center justify-between border-b border-core-border pb-4">
            <div>
              <p className="text-[13px] text-core-text-muted">Transaction ID</p>
              <p className="text-[18px] font-semibold text-core-text">#{row.transaction_ref}</p>
            </div>
            <span className="rounded-full bg-core-warning-bg px-3 py-1 text-[12px] font-semibold uppercase text-core-warning">
              {row.status}
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-4 text-[14px]">
            <div className="flex justify-between">
              <span className="text-core-text-muted">Submitted</span>
              <span className="font-medium text-core-text">{new Date(row.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-core-text-muted">Prior institution</span>
              <span className="font-medium text-core-text">{row.details.institution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-core-text-muted">Account type</span>
              <span className="font-medium text-core-text">{row.details.accountType}</span>
            </div>
            {row.details.accountNumber && (
              <div className="flex justify-between">
                <span className="text-core-text-muted">Prior account number</span>
                <span className="font-medium text-core-text">{row.details.accountNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-core-text-muted">Total amount</span>
              <span className="font-medium text-core-text">{money(row.details.amount)}</span>
            </div>
          </div>

          <div className="mt-4 border-t border-core-border pt-4">
            <p className="mb-2 text-[13px] font-semibold text-core-text-muted">By source</p>
            <div className="flex flex-col gap-1 text-[13px]">
              {Object.entries(row.details.amounts)
                .filter(([, v]) => v > 0)
                .map(([source, v]) => (
                  <div key={source} className="flex justify-between">
                    <span className="text-core-text">{source}</span>
                    <span className="font-medium text-core-text">{money(v)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <Button variant="cta" onClick={() => navigate('/transactions')}>
          Back to Transactions
        </Button>
      </div>
    </AppShell>
  )
}
