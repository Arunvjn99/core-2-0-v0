import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../../ui-kit/patterns/AppShell'
import { IconChevronDown, IconDownload } from '../../../ui-kit/icons'

/**
 * Figma: node 2893:27994 (part of the "Dashboard-not-enrolled" duplicate
 * cluster, but is actually a loan/transaction detail screen — "Transaction"
 * is highlighted in its sidebar). Demo installment data below; real values
 * come from a loan-servicing backend that doesn't exist yet.
 */
const INSTALLMENTS = [
  { n: 1, date: '01/01/2025', repayment: 1000, principal: 990, interest: 10, outstanding: 5000, method: 'Payroll deduction' },
  { n: 2, date: '03/01/2025', repayment: 1000, principal: 990, interest: 10, outstanding: 4000, method: 'Payroll deduction' },
  { n: 3, date: '03/01/2025', repayment: 1000, principal: 990, interest: 10, outstanding: 3000, method: 'Payroll deduction' },
  { n: 4, date: '04/01/2025', repayment: 1000, principal: 990, interest: 10, outstanding: 2000, method: 'Payroll deduction' },
  { n: 5, date: '05/01/2025', repayment: 1000, principal: 990, interest: 10, outstanding: 1000, method: 'Payroll deduction' },
]

const TABS = ['Repayment Schedule', 'Amortization Schedule', 'Payment details', 'Documents'] as const

const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

export default function LoanSummary() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof TABS)[number]>('Repayment Schedule')
  const paid = 5000
  const total = 6000

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => navigate('/transactions')} className="text-[14px] font-semibold text-core-info">
              ‹ Back
            </button>
            <h1 className="text-[22px] font-semibold text-core-text">Loan summary</h1>
          </div>
          <button className="flex items-center gap-2 rounded-[4px] border border-core-info px-4 py-2 text-[14px] font-semibold text-core-info">
            Actions <IconChevronDown className="size-3" />
          </button>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-core-md bg-core-surface p-5 shadow-core-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-[13px] text-core-text-muted">Plan details</p>
            <p className="text-[18px] font-semibold text-core-text">401(K) Mindblock Simple</p>
            <p className="text-[13px] text-core-text-muted">Plan ID 124542 · Type 401(K)</p>
          </div>
          <div className="flex gap-8 text-right">
            <div>
              <p className="text-[18px] font-semibold text-core-text">$30,000.00</p>
              <p className="text-[13px] text-core-text-muted">Plan balance</p>
            </div>
            <div>
              <p className="text-[18px] font-semibold text-core-text">$25,000.00</p>
              <p className="text-[13px] text-core-text-muted">Vested balance</p>
            </div>
          </div>
        </div>

        <div className="rounded-core-md border border-core-border bg-core-surface">
          <div className="flex flex-col gap-4 border-b border-core-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[16px] font-semibold text-core-text">$10,000.00</p>
                  <span className="rounded-full bg-core-success-bg px-2 py-0.5 text-[11px] font-semibold uppercase text-core-success">
                    Active
                  </span>
                </div>
                <p className="text-[13px] text-core-text-muted">Personal loan</p>
              </div>
              <Stat label="Loan ID" value="1234" />
              <Stat label="Requested by" value="Admin" />
              <Stat label="Next repayment date" value="20 March, 2026" />
              <Stat label="Outstanding Balance" value="$2,000.00" />
            </div>
            <div className="flex flex-col gap-1 sm:w-48">
              <p className="text-right text-[12px] text-core-text-muted">
                Paid – {money(paid)} / {money(total)}
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-core-surface-sunken">
                <div
                  className="h-full rounded-full bg-core-success"
                  style={{ width: `${(paid / total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-core-border px-5">
            <div className="flex gap-6 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`shrink-0 border-b-2 py-3 text-[14px] font-medium whitespace-nowrap ${
                    tab === t ? 'border-core-info text-core-info font-semibold' : 'border-transparent text-core-text-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="hidden shrink-0 items-center gap-2 text-[14px] font-semibold text-core-info sm:flex">
              <IconDownload className="size-3.5" />
              Download
            </button>
          </div>

          {tab === 'Repayment Schedule' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-core-border text-core-text-muted">
                    <th className="px-5 py-3 font-medium">Installment</th>
                    <th className="px-5 py-3 font-medium">Repayment details</th>
                    <th className="px-5 py-3 font-medium">Principal paid</th>
                    <th className="px-5 py-3 font-medium">Interest paid</th>
                    <th className="px-5 py-3 font-medium">Outstanding principal</th>
                    <th className="px-5 py-3 font-medium">Repayment method</th>
                  </tr>
                </thead>
                <tbody>
                  {INSTALLMENTS.map((row) => (
                    <tr key={row.n} className="border-b border-core-border last:border-0">
                      <td className="px-5 py-3 text-core-text">{row.n}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-core-text">{money(row.repayment)}</p>
                        <p className="text-[12px] text-core-text-muted">{row.date}</p>
                      </td>
                      <td className="px-5 py-3 text-core-text-muted">{money(row.principal)}</td>
                      <td className="px-5 py-3 text-core-text-muted">{money(row.interest)}</td>
                      <td className="px-5 py-3 text-core-text-muted">{money(row.outstanding)}</td>
                      <td className="px-5 py-3 text-core-text-muted">{row.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-8 text-center text-[14px] text-core-text-muted">
              {tab} isn't wired up yet — next in the build queue.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[14px] font-medium text-core-text">{value}</p>
      <p className="text-[12px] text-core-text-muted">{label}</p>
    </div>
  )
}
