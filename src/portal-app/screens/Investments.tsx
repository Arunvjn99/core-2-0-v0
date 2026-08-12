import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../ui-kit/patterns/AppShell'
import { Button } from '../../ui-kit/primitives/Button'
import { SlideOver } from '../../ui-kit/primitives/SlideOver'
import { Select } from '../../ui-kit/primitives/Select'
import { TextField } from '../../ui-kit/primitives/TextField'
import { useAuth } from '../lib/AuthContext'
import {
  RECOMMENDED_FUNDS,
  saveInvestmentSelection,
  fetchLatestInvestmentSelection,
  type InvestmentMode,
  type Fund,
} from '../lib/investments'

/**
 * Figma: "Investments" (node 2893:64916 Plan Default, 2893:66484 Manual
 * Investments — same shell, different right-panel content per mode).
 *
 * The Manual Investments fund picker is a right-edge slide-in overlay in
 * the actual Figma prototype (confirmed by playing it), not an in-place
 * panel swap — the first pass of this build got that wrong. Fixed below
 * with the SlideOver primitive.
 */
const MODES: { id: InvestmentMode; title: string; body: string }[] = [
  { id: 'advisor', title: 'Manage Investments', body: 'An advisor helps you choose how much to save and where to invest.' },
  { id: 'plan_default', title: 'Plan Default Investments', body: 'We choose Investments based on your age and risk criteria.' },
  { id: 'manual', title: 'Manual Investments', body: 'You choose how much to save and where to invest.' },
]

export default function Investments() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<InvestmentMode>('plan_default')
  const [autoRebalance, setAutoRebalance] = useState(false)
  const [selectedFunds, setSelectedFunds] = useState<Fund[]>(RECOMMENDED_FUNDS)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    if (!session) return
    fetchLatestInvestmentSelection(session.user.id).then((selection) => {
      if (selection) {
        setMode(selection.mode)
        setAutoRebalance(selection.autoRebalance)
        setSelectedFunds(selection.funds)
      }
      setLoaded(true)
    })
  }, [session])

  function toggleFund(fund: Fund) {
    setSelectedFunds((prev) =>
      prev.some((f) => f.name === fund.name) ? prev.filter((f) => f.name !== fund.name) : [...prev, fund],
    )
  }

  async function handleNext() {
    if (!session) return
    setSaving(true)
    try {
      await saveInvestmentSelection(session.user.id, {
        type: 'investment_selection',
        mode,
        autoRebalance,
        funds: mode === 'manual' ? selectedFunds : RECOMMENDED_FUNDS,
        saved_at: new Date().toISOString(),
      })
      navigate('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-0 overflow-hidden rounded-core-md border border-core-border-strong bg-core-surface">
        <div className="border-b border-core-border-strong px-6 py-4">
          <h1 className="text-[24px] font-semibold text-core-text">Investments</h1>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Mode selector */}
          <div className="flex shrink-0 flex-col gap-4 border-b border-core-border-strong p-6 lg:w-[360px] lg:border-b-0 lg:border-r">
            {MODES.map((m) => {
              const active = mode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col rounded-core-md border text-left transition-colors ${
                    active ? 'border-core-info bg-core-info/10' : 'border-core-border-strong bg-core-surface'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-inherit px-4 py-4">
                    <p className="text-[18px] font-semibold text-core-text-subtle">{m.title}</p>
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border ${
                        active ? 'border-core-info bg-core-info' : 'border-core-border-strong bg-core-surface'
                      }`}
                    >
                      {active && (
                        <svg viewBox="0 0 10 8" className="size-2.5 fill-none stroke-white stroke-[1.6]">
                          <path d="M1 4 3.5 6.5 9 1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <p className="px-4 py-4 text-[14px] leading-[20px] text-core-text-muted">{m.body}</p>
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {!loaded ? (
              <p className="text-core-text-muted">Loading…</p>
            ) : mode === 'advisor' ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <p className="text-[16px] font-semibold text-core-text">Talk to an advisor</p>
                <p className="max-w-sm text-[14px] text-core-text-muted">
                  Advisor scheduling isn't wired up yet — this is where a booking flow would live.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[16px] font-semibold text-core-text">
                    {mode === 'plan_default' ? 'Recommended Investments' : 'Choose Investments'}
                  </h2>
                  {mode === 'manual' && (
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-core-info/10 px-2.5 py-1 text-[12px] font-semibold text-core-info">
                        {selectedFunds.length} Selected
                      </span>
                      <Button variant="cta" onClick={() => setPickerOpen(true)}>
                        Manage Investment
                      </Button>
                    </div>
                  )}
                </div>
                <label className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-core-text-subtle">
                  Auto Rebalance
                  <button
                    role="switch"
                    aria-checked={autoRebalance}
                    onClick={() => setAutoRebalance((v) => !v)}
                    className={`relative h-[18px] w-[34px] rounded-full transition-colors ${
                      autoRebalance ? 'bg-core-info' : 'bg-core-border-strong'
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] size-[14px] rounded-full bg-white transition-all ${
                        autoRebalance ? 'left-[18px]' : 'left-[2px]'
                      }`}
                    />
                  </button>
                </label>

                <div className="overflow-hidden rounded-core-md border border-core-border-strong">
                  <table className="w-full text-left text-[14px]">
                    <thead>
                      <tr className="border-b border-core-border bg-core-surface-sunken text-core-text-muted">
                        <th className="px-4 py-3 font-semibold">Investment names</th>
                        <th className="px-4 py-3 font-semibold">Fund Type</th>
                        <th className="px-4 py-3 text-right font-semibold">Allocation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(mode === 'manual' ? selectedFunds : RECOMMENDED_FUNDS).map((fund) => (
                        <tr key={fund.name} className="border-b border-core-border last:border-0">
                          <td className="px-4 py-3">
                            <a href="#fund-detail" className="font-medium text-core-info underline">
                              {fund.name}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-core-text-muted">{fund.type}</td>
                          <td className="px-4 py-3 text-right text-core-text-subtle">{fund.allocation}%</td>
                        </tr>
                      ))}
                      {mode === 'manual' && selectedFunds.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-core-text-muted">
                            No investments selected — click "Manage Investment" to add some.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-core-border-strong px-6 py-4">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button variant="cta" loading={saving} onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>

      <FundPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedFunds={selectedFunds}
        onToggle={toggleFund}
      />
    </AppShell>
  )
}

function FundPicker({
  open,
  onClose,
  selectedFunds,
  onToggle,
}: {
  open: boolean
  onClose: () => void
  selectedFunds: Fund[]
  onToggle: (fund: Fund) => void
}) {
  const [search, setSearch] = useState('')
  const [fundType, setFundType] = useState('')

  const filtered = useMemo(
    () =>
      RECOMMENDED_FUNDS.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) && (fundType === '' || f.type === fundType),
      ),
    [search, fundType],
  )

  return (
    <SlideOver open={open} title="Investments" onClose={onClose} width={520}>
      <div className="flex flex-col gap-4">
        <p className="text-[13px] font-semibold text-core-info">{selectedFunds.length} Fund types Selected</p>
        <div className="flex gap-3">
          <TextField label="Search" placeholder="Search investment name, CUSIP" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="w-40 shrink-0">
            <Select label="Fund Type" value={fundType} onChange={(e) => setFundType(e.target.value)}>
              <option value="">All</option>
              <option value="Large Cap">Large Cap</option>
              <option value="Mid Cap">Mid Cap</option>
              <option value="Small Cap">Small Cap</option>
              <option value="Bond">Bond</option>
            </Select>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-core-border rounded-core-md border border-core-border">
          {filtered.map((fund) => {
            const checked = selectedFunds.some((f) => f.name === fund.name)
            return (
              <label key={fund.name} className="flex cursor-pointer items-center gap-3 p-4">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(fund)}
                  className="size-4 shrink-0 accent-[var(--core-color-info)]"
                />
                <div>
                  <p className="text-[14px] font-medium text-core-text">{fund.name}</p>
                  <p className="text-[12px] text-core-text-muted">{fund.type} · CUSIP 12345</p>
                </div>
              </label>
            )
          })}
          {filtered.length === 0 && (
            <p className="p-6 text-center text-[13px] text-core-text-muted">No funds match your search.</p>
          )}
        </div>

        <Button variant="cta" onClick={onClose} className="w-fit self-end">
          Done
        </Button>
      </div>
    </SlideOver>
  )
}
