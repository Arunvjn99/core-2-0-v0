import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../../ui-kit/patterns/AppShell'
import { supabase } from '../../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'

/**
 * Figma: chip filter bar (All/Loans/Withdrawal/Distribution/Transfer/
 * Rebalance/Rollover/Roth Conversion) + "New Request" button, node cluster
 * around 2893:8093. The prior build only had the Loan summary detail
 * screen with no hub to reach it (or the transfer/rollover flows) from.
 */
const FILTERS = ['All', 'Loans', 'Withdrawal', 'Distribution', 'Transfer', 'Rebalance', 'Rollover', 'Roth Conversion'] as const

const DEMO_LOAN = {
  id: 'loan-1234',
  type: 'Loans',
  title: 'Personal loan',
  amount: '$10,000.00',
  status: 'Active',
  date: '20 Mar 2026',
}

type Req = {
  id: string
  request_type: string
  status: string
  transaction_ref: string
  created_at: string
  details: Record<string, unknown>
}

const TYPE_LABEL: Record<string, string> = {
  transfer: 'Transfer',
  rollover: 'Rollover',
  loan: 'Loans',
  withdrawal: 'Withdrawal',
  distribution: 'Distribution',
  rebalance: 'Rebalance',
  roth_conversion: 'Roth Conversion',
}

export default function TransactionsHub() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [requests, setRequests] = useState<Req[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    supabase
      .from('transaction_requests')
      .select('id, request_type, status, transaction_ref, created_at, details')
      .eq('participant_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRequests(data ?? [])
        setLoading(false)
      })
  }, [session])

  const items = [
    ...(filter === 'All' || filter === 'Loans' ? [DEMO_LOAN] : []),
    ...requests
      .filter((r) => filter === 'All' || TYPE_LABEL[r.request_type] === filter)
      .map((r) => ({
        id: r.id,
        type: TYPE_LABEL[r.request_type] ?? r.request_type,
        title: TYPE_LABEL[r.request_type] ?? r.request_type,
        amount: r.details?.amount ? `$${r.details.amount}` : '—',
        status: r.status,
        date: new Date(r.created_at).toLocaleDateString(),
        ref: r.transaction_ref,
      })),
  ]

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[22px] font-semibold text-core-text">Transactions</h1>
            <p className="text-[15px] text-core-text-muted">Loans, transfers, rollovers, and other plan requests</p>
          </div>
          <button
            onClick={() => navigate('/transactions/new-transfer')}
            className="shrink-0 rounded-core-sm px-4 py-2.5 text-[14px] font-semibold text-white"
            style={{ backgroundImage: 'linear-gradient(90deg, var(--core-color-cta-from) 14.6%, var(--core-color-cta-to) 107.38%)' }}
          >
            + New Request
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-medium ${
                filter === f ? 'border-core-info bg-core-info/10 text-core-info' : 'border-core-border text-core-text-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-core-text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="rounded-core-md border border-dashed border-core-border p-8 text-center text-core-text-muted">
            No {filter.toLowerCase()} requests yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => item.id === 'loan-1234' && navigate('/transactions/loan')}
                className="flex items-center justify-between rounded-core-md border border-core-border bg-core-surface p-4 text-left shadow-core-sm hover:border-core-info"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-core-text">{item.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${
                        item.status.toLowerCase() === 'active' || item.status.toLowerCase() === 'pending'
                          ? 'bg-core-warning-bg text-core-warning'
                          : 'bg-core-success-bg text-core-success'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[13px] text-core-text-muted">
                    {item.type} · {item.date}
                    {'ref' in item && item.ref ? ` · #${item.ref}` : ''}
                  </p>
                </div>
                <p className="text-[15px] font-semibold text-core-text">{item.amount}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
