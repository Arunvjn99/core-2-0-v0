import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { AppShell } from '../../../ui-kit/patterns/AppShell'
import { RiskGauge } from '../../../ui-kit/patterns/RiskGauge'
import { Button } from '../../../ui-kit/primitives/Button'
import { Modal } from '../../../ui-kit/primitives/Modal'
import { IconSparkles } from '../../../ui-kit/icons'
import { useAuth } from '../../lib/AuthContext'
import { useToast } from '../../../ui-kit/lib/ToastContext'
import {
  CONTRIBUTION_PRESETS,
  submitEnrollment,
  type AutoIncrease,
  type Contribution,
  type ContributionMode,
  type EnrollmentInvestments,
} from '../../lib/enrollment'

/**
 * Figma: "Plan Enrollment" 4-step wizard (nodes 2893:56254 Contribution,
 * 2893:58119 Auto Increase cards + 2893:58477 "Compound your savings"
 * modal, 2893:64916 Investments, 2893:59711/60247 Review) — the real
 * "Enroll" flow triggered from a Dashboard plan card, distinct from the
 * risk-profile Questionnaire at /enrollment.
 */
const STEPS = ['Contribution Election', 'Auto Increase', 'Investment Election', 'Review'] as const
type Step = (typeof STEPS)[number]

const STEP_COPY: Record<Step, string> = {
  'Contribution Election': 'Specify the amount to contribute to the plan',
  'Auto Increase': 'Choose Auto Increase to boost your savings',
  'Investment Election': 'Choose the investments and its allocation percentages',
  Review: 'Review your elections before enrolling into the plan',
}

const DEFAULT_PLAN = { name: '401(K) Company Plan High Returns', id: '124542' }

export default function PlanEnrollment() {
  const { session } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Enroll cards on the Dashboard / Enrollment hub pass ?planId=&planName=
  // for the plan that was actually clicked — falls back to the demo
  // default only when landed on directly (e.g. a bookmarked /enroll link).
  const PLAN = {
    id: searchParams.get('planId') ?? DEFAULT_PLAN.id,
    name: searchParams.get('planName') ?? DEFAULT_PLAN.name,
  }
  const reduceMotion = useReducedMotion()
  const [stepIndex, setStepIndex] = useState(0)
  // direction (forward/back) is tracked for a possible future re-add of a
  // directional transition — see the note above the step content render.
  const [, setDirection] = useState(1)
  const [contribution, setContribution] = useState<Contribution>({ mode: 'plan_default', ...CONTRIBUTION_PRESETS.plan_default })
  const [autoIncrease, setAutoIncrease] = useState<AutoIncrease>({ enabled: false, pretaxRate: 5, afterTaxRate: 5, limit: 15 })
  const [investments, setInvestments] = useState<EnrollmentInvestments>({ mode: 'plan_default', autoRebalance: true })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const step = STEPS[stepIndex]

  async function handleEnroll() {
    if (!session) return
    setSubmitting(true)
    setError(null)
    try {
      await submitEnrollment(session.user.id, { planName: PLAN.name, planId: PLAN.id, contribution, autoIncrease, investments })
      show(`Enrolled in ${PLAN.name} 🎉`)
      navigate('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your enrollment — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <a href="#back" onClick={(e) => { e.preventDefault(); navigate('/dashboard') }} className="text-[14px] font-semibold text-core-info">
          ‹ Back
        </a>
        <div className="flex flex-col overflow-hidden rounded-core-md border border-core-border-strong bg-core-surface lg:flex-row">
          {/* Step tracker */}
          <div className="flex shrink-0 flex-col gap-1 border-b border-core-border-strong p-6 lg:w-[280px] lg:border-b-0 lg:border-r">
            <h2 className="mb-4 text-[18px] font-semibold text-core-text">Plan Enrollment</h2>
            {STEPS.map((s, i) => {
              const done = i < stepIndex
              const active = i === stepIndex
              return (
                <button
                  key={s}
                  onClick={() => {
                    if (i > stepIndex) return
                    setDirection(-1)
                    setStepIndex(i)
                  }}
                  disabled={i > stepIndex}
                  className="flex items-start gap-3 py-3 text-left disabled:cursor-not-allowed"
                >
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                      done
                        ? 'bg-core-success text-white'
                        : active
                          ? 'border-2 border-core-info text-core-info'
                          : 'border border-core-border-strong text-core-text-muted'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <div>
                    <p className={`text-[15px] font-semibold ${active ? 'text-core-text' : done ? 'text-core-text' : 'text-core-text-muted'}`}>
                      {s}
                    </p>
                    <p className="text-[13px] text-core-text-muted">{STEP_COPY[s]}</p>
                    {done && <p className="text-[12px] font-semibold text-core-success">✓ COMPLETED</p>}
                    {active && <p className="text-[12px] font-semibold text-core-info">↻ IN-PROGRESS</p>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Step content */}
          <div className={`flex-1 overflow-hidden ${step === 'Review' ? '' : 'p-6'}`}>
            {/* Enrollment plan header — present on steps 1-3 in Figma; Review has its own layout */}
            {step !== 'Review' && (
              <div className="mb-6 flex flex-col items-start justify-between gap-3 border-b border-core-border pb-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[13px] text-core-text-muted">Enrolment Plan Details</p>
                  <p className="text-[18px] font-semibold text-core-text">{PLAN.name}</p>
                  <p className="text-[13px] text-core-text-muted">
                    Plan ID <span className="font-medium text-core-text">{PLAN.id}</span> · Regular Plan
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="mb-1 rounded-full bg-core-warning-bg px-2 py-0.5 text-[12px] font-semibold text-core-warning">
                    Moderate Investor
                  </span>
                  <RiskGauge level="Moderate" />
                </div>
              </div>
            )}

            {/*
              NOTE: this used to be wrapped in framer-motion's AnimatePresence
              (mode="wait", keyed by step) for a slide transition between
              steps. In testing, that wrapper reliably got stuck after the
              first transition — the exit animation never resolved, so the
              old step's content stayed on screen forever even though the
              tracker sidebar correctly advanced. Confirmed via direct DOM
              inspection, not just visually, and reproduced across full
              dev-server + fresh-tab restarts, so it's a real incompatibility
              (framer-motion 13.x in this React 19 setup), not test flakiness.
              Simple keyed remount below has the same "swap on step change"
              effect without the animation library in the way; a CSS-only
              fade can be reintroduced later if desired.
            */}
            <div key={step} className={reduceMotion ? undefined : 'core2-step-fade'}>
              {step === 'Contribution Election' && (
                <ContributionStep value={contribution} onChange={setContribution} />
              )}
              {step === 'Auto Increase' && <AutoIncreaseStep value={autoIncrease} onChange={setAutoIncrease} />}
              {step === 'Investment Election' && (
                <InvestmentStep value={investments} onChange={setInvestments} />
              )}
              {step === 'Review' && (
                <ReviewStep plan={PLAN} contribution={contribution} autoIncrease={autoIncrease} investments={investments} />
              )}
            </div>

            {error && <p className="mt-4 text-[14px] text-core-critical">{error}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          {stepIndex < STEPS.length - 1 ? (
            <Button
              variant="cta"
              onClick={() => {
                setDirection(1)
                setStepIndex((i) => i + 1)
              }}
            >
              Next
            </Button>
          ) : (
            <Button variant="cta" loading={submitting} onClick={handleEnroll}>
              Enroll
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function ModeCard({
  title,
  description,
  icon,
  selected,
  onSelect,
  children,
}: {
  title: string
  description: string
  icon: string
  selected: boolean
  onSelect: () => void
  children?: React.ReactNode
}) {
  return (
    <div className={`flex flex-col rounded-core-md border p-4 ${selected ? 'border-core-info bg-core-info/5' : 'border-core-border-strong'}`}>
      <div className="mb-3 flex items-center gap-2 text-[16px] font-semibold text-core-info">
        <span className="text-xl">{icon}</span> {title}
      </div>
      <p className="mb-4 text-[13px] text-core-text-muted">{description}</p>
      {children}
      <Button variant={selected ? 'cta' : 'secondary'} onClick={onSelect} className="mt-4 w-full justify-center">
        {selected ? 'Selected' : `Select ${title}`}
      </Button>
    </div>
  )
}

function ContributionStep({ value, onChange }: { value: Contribution; onChange: (c: Contribution) => void }) {
  function selectMode(mode: ContributionMode) {
    if (mode === 'manual') {
      onChange({ mode, pretax: value.pretax, roth: value.roth, afterTax: value.afterTax })
    } else {
      onChange({ mode, ...CONTRIBUTION_PRESETS[mode] })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[16px] font-semibold text-core-text">What does Contribution mean?</h2>
        <p className="text-[14px] text-core-text-muted">
          Contribution is the money you put into your retirement savings from your paycheck.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <ModeCard
          title="Plan Default"
          icon="📋"
          description="A simple, low-effort way to begin saving"
          selected={value.mode === 'plan_default'}
          onSelect={() => selectMode('plan_default')}
        >
          <RateRows rates={CONTRIBUTION_PRESETS.plan_default} />
        </ModeCard>
        <ModeCard
          title="Maximum"
          icon="📈"
          description="Contribute the most allowed to reduce shortfall"
          selected={value.mode === 'maximum'}
          onSelect={() => selectMode('maximum')}
        >
          <RateRows rates={CONTRIBUTION_PRESETS.maximum} />
        </ModeCard>
        <ModeCard
          title="Manual"
          icon="🖊️"
          description="Choose how much to save and where to invest"
          selected={value.mode === 'manual'}
          onSelect={() => selectMode('manual')}
        >
          <div className="flex flex-col gap-2">
            {(['pretax', 'roth', 'afterTax'] as const).map((key) => (
              <label key={key} className="flex items-center justify-between text-[13px] text-core-text-muted">
                <span className="capitalize">{key === 'afterTax' ? 'After Tax' : key}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={value.mode === 'manual' ? value[key] : ''}
                  onFocus={() => value.mode !== 'manual' && selectMode('manual')}
                  onChange={(e) => onChange({ ...value, mode: 'manual', [key]: Number(e.target.value) })}
                  className="w-16 rounded border border-core-border bg-core-bg px-2 py-1 text-right text-core-text"
                />
              </label>
            ))}
          </div>
        </ModeCard>
      </div>
    </div>
  )
}

function RateRows({ rates }: { rates: Omit<Contribution, 'mode'> }) {
  return (
    <div className="flex flex-col gap-1 text-[13px]">
      <div className="flex justify-between"><span className="text-core-text-muted">Pre Tax</span><span className="font-semibold text-core-text">{rates.pretax}%</span></div>
      <div className="flex justify-between"><span className="text-core-text-muted">Roth</span><span className="font-semibold text-core-text">{rates.roth}%</span></div>
      <div className="flex justify-between"><span className="text-core-text-muted">After Tax</span><span className="font-semibold text-core-text">{rates.afterTax}%</span></div>
    </div>
  )
}

/**
 * Figma 2893:58119 — three illustrated option cards (No / Plan Default /
 * Manual Auto Increase), each opening the "Compound your savings" modal
 * (2893:58477) to configure the increment cycle and per-source rates.
 */
const INCREASE_MODES = [
  {
    id: 'none' as const,
    title: 'No Auto Increase',
    icon: '📄',
    blurb: 'Make the same contribution each year.',
    heading: 'Disable Automatic Contribution Increases',
    body: 'Turn off automatic yearly increases in your plan contributions. This means your contribution amount will remain the same each year.',
    cta: 'Disable Auto Increase',
  },
  {
    id: 'plan_default' as const,
    title: 'Plan Default Auto Increase',
    icon: '📈',
    blurb: 'We will increase your savings each year automatically.',
    heading: 'Boost your savings by enabling auto increase',
    body: "To call out each source's auto deferral increase percentage %, set up in the plan.",
    cta: 'Enable Auto Increase',
  },
  {
    id: 'manual' as const,
    title: 'Manual Auto Increase',
    icon: '🖊️',
    blurb: 'You choose how much to increase your savings, each year.',
    heading: 'I will customise by myself',
    body: '',
    cta: 'Setup Auto Increase',
  },
]

function AutoIncreaseStep({ value, onChange }: { value: AutoIncrease; onChange: (v: AutoIncrease) => void }) {
  const [modalOpen, setModalOpen] = useState(false)
  const activeMode = !value.enabled ? 'none' : 'plan_default'

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[16px] font-semibold text-core-text">What is Auto Increase?</h2>
        <p className="text-[14px] text-core-text-muted">
          Automatically increases your contributions (savings) each year to help you grow your retirement funds,
          faster.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {INCREASE_MODES.map((mode) => (
          <div
            key={mode.id}
            className={`flex flex-col rounded-core-md border p-4 ${
              activeMode === mode.id ? 'border-core-info bg-core-info/5' : 'border-core-border-strong'
            }`}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <p className="text-[15px] font-semibold text-core-info">{mode.title}</p>
              <span className="text-2xl leading-none">{mode.icon}</span>
            </div>
            <p className="mb-4 text-[13px] text-core-text-muted">{mode.blurb}</p>
            <p className="mb-1 text-[14px] font-semibold text-core-text">{mode.heading}</p>
            {mode.body && <p className="mb-4 flex-1 text-[13px] leading-relaxed text-core-text-muted">{mode.body}</p>}
            <Button
              variant={activeMode === mode.id ? 'cta' : 'secondary'}
              className="mt-auto w-full justify-center"
              onClick={() => {
                if (mode.id === 'none') {
                  onChange({ ...value, enabled: false })
                } else {
                  setModalOpen(true)
                }
              }}
            >
              {mode.cta}
            </Button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <CompoundSavingsModal value={value} onChange={onChange} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}

function CompoundSavingsModal({
  value,
  onChange,
  onClose,
}: {
  value: AutoIncrease
  onChange: (v: AutoIncrease) => void
  onClose: () => void
}) {
  const [cycle, setCycle] = useState<'calendar' | 'participant' | 'plan_year'>('calendar')
  const [draft, setDraft] = useState(value)

  function apply() {
    onChange({ ...draft, enabled: true })
    onClose()
  }

  return (
    <Modal title="Compound your savings" onClose={onClose} width={720}>
      <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
        <div className="flex flex-col gap-2">
          {[
            { id: 'none', label: 'No Auto Increase', sub: 'Make the same contribution each year.' },
            { id: 'auto', label: 'Auto Increase', sub: 'We will increase your savings each year automatically.' },
            { id: 'manual', label: 'Manual Auto Increase', sub: 'You choose how much to increase your savings, each year.' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => opt.id === 'none' && onChange({ ...draft, enabled: false }) && onClose()}
              className={`rounded-core-sm border p-3 text-left ${
                opt.id === 'auto' ? 'border-core-info bg-core-info/5' : 'border-core-border'
              }`}
            >
              <p className="text-[14px] font-semibold text-core-text">{opt.label}</p>
              <p className="text-[12px] text-core-text-muted">{opt.sub}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-[14px] font-semibold text-core-text">Increment Cycle</p>
            <div className="flex flex-col gap-2">
              {[
                { id: 'calendar' as const, label: 'Calendar Year (Every Jan 1st)', next: 'Next increase on Jan 1, 2027' },
                { id: 'participant' as const, label: "Plan participant date (Every year on your plan enrollment date)", next: 'Next increase on Aug 15, 2026' },
                { id: 'plan_year' as const, label: 'Plan Year (Every April 1)', next: 'Next increase on Apr 1, 2027' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-start gap-2 text-[13px]">
                  <input
                    type="radio"
                    name="increment-cycle"
                    checked={cycle === opt.id}
                    onChange={() => setCycle(opt.id)}
                    className="mt-0.5 accent-[var(--core-color-info)]"
                  />
                  <span>
                    <span className="font-medium text-core-text">{opt.label}</span>
                    <br />
                    <span className="text-core-text-muted">{opt.next}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {(['Pre tax', 'Roth', 'After tax'] as const).map((label, i) => {
            const key = i === 0 ? 'pretaxRate' : i === 1 ? 'afterTaxRate' : 'afterTaxRate'
            return (
              <div key={label} className="border-t border-core-border pt-4">
                <p className="mb-2 text-[14px] font-semibold text-core-text">{label}</p>
                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    label="Increment — how much to increase each cycle"
                    value={draft[key as 'pretaxRate' | 'afterTaxRate']}
                    onChange={(n) => setDraft((d) => ({ ...d, [key]: n }))}
                  />
                  <NumberField label="Max Limit — highest you want to reach" value={draft.limit} onChange={(n) => setDraft((d) => ({ ...d, limit: n }))} />
                </div>
              </div>
            )
          })}

          <Button variant="cta" onClick={apply} className="w-fit self-end">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-[12px] font-medium text-core-text-muted">
      {label}
      <div className="flex items-center rounded border border-core-border bg-core-bg px-2 py-1.5">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent text-[14px] text-core-text outline-none"
        />
        <span className="text-core-text-muted">%</span>
      </div>
    </label>
  )
}

function InvestmentStep({ value, onChange }: { value: EnrollmentInvestments; onChange: (v: EnrollmentInvestments) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[16px] font-semibold text-core-text">Choose your investments</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => onChange({ ...value, mode: 'plan_default' })}
          className={`rounded-core-md border p-4 text-left ${value.mode === 'plan_default' ? 'border-core-info bg-core-info/5' : 'border-core-border-strong'}`}
        >
          <p className="font-semibold text-core-text">Plan Default Investments</p>
          <p className="text-[13px] text-core-text-muted">We choose investments based on your age and risk criteria.</p>
        </button>
        <button
          onClick={() => onChange({ ...value, mode: 'manual' })}
          className={`rounded-core-md border p-4 text-left ${value.mode === 'manual' ? 'border-core-info bg-core-info/5' : 'border-core-border-strong'}`}
        >
          <p className="font-semibold text-core-text">Manual Investments</p>
          <p className="text-[13px] text-core-text-muted">You choose how much to save and where to invest.</p>
        </button>
      </div>
      <label className="flex items-center gap-2 text-[14px] font-medium text-core-text">
        <input
          type="checkbox"
          checked={value.autoRebalance}
          onChange={(e) => onChange({ ...value, autoRebalance: e.target.checked })}
          className="size-4 accent-[var(--core-color-info)]"
        />
        Enable Auto Rebalance
      </label>
    </div>
  )
}

/**
 * Figma 2893:59711 — Review is NOT a simple summary list. It's a 3-column
 * layout: step tracker (rendered by the parent) | Retirement Goal
 * Simulator (donut + funding shortfall report) | Summary (risk pill +
 * every election made). Rebuilt to match after the first pass missed this
 * entirely and just listed the elections.
 */
function ReviewStep({
  plan,
  contribution,
  autoIncrease,
  investments,
}: {
  plan: { id: string; name: string }
  contribution: Contribution
  autoIncrease: AutoIncrease
  investments: EnrollmentInvestments
}) {
  // TODO: this is a demo projection, not a real retirement calculator —
  // wire up to actual salary/contribution/years-to-retirement inputs once
  // that data model exists.
  const goalPct = 50
  const expected = 20000
  const allIncome = 10000
  const shortfall = 10000

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Simulator */}
      <div className="flex-1 border-b border-core-border bg-[#fdf6ec] p-6 lg:border-b-0 lg:border-r">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xl" aria-hidden>🏖️</span>
          <h2 className="text-[16px] font-semibold text-core-text">Your Retirement Goal Simulator</h2>
        </div>

        <div className="flex flex-col items-center gap-1 py-4">
          <div
            className="flex size-[150px] items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#2dd4bf 0% 25%, #ef4444 25% 45%, #facc15 45% 70%, #7c3aed 70% 100%)`,
            }}
          >
            <div className="flex size-[110px] flex-col items-center justify-center rounded-full bg-[#fdf6ec]">
              <p className="text-[22px] font-bold text-core-text">{goalPct}%</p>
              <p className="text-[12px] text-core-text-muted">Reached</p>
            </div>
          </div>
          <p className="mt-2 text-[28px] font-bold text-core-warning">{goalPct}%</p>
          <p className="text-[14px] text-core-text-muted">of your retirement goal is achieved.</p>
          <button className="mt-3 flex items-center gap-2 rounded-core-sm bg-core-info px-4 py-2 text-[13px] font-semibold text-white">
            <IconSparkles className="size-3.5" />
            Optimize your score
          </button>
        </div>

        <div className="rounded-core-md bg-core-surface p-4 shadow-core-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-core-text">Your Funding Plan Report</p>
            <a href="#details" className="text-[13px] font-semibold text-core-info">
              View Details ›
            </a>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[13px]">
            <div>
              <p className="text-core-text-muted">Expected</p>
              <p className="font-semibold text-core-text">${expected.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-core-text-muted">● All income</p>
              <p className="font-semibold text-core-text">${allIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-core-critical">● Shortfall</p>
              <p className="font-semibold text-core-critical">${shortfall.toLocaleString()}</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] italic text-core-text-muted">
            *Not guaranteed results. It's just a simulation. For more details <span className="underline">Read more</span>
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="w-full shrink-0 p-6 lg:w-[340px]">
        <h2 className="mb-4 text-[16px] font-semibold text-core-text">Summary</h2>

        <div className="mb-5 flex items-center gap-3 rounded-core-md bg-core-warning-bg p-3">
          <span className="text-lg">📊</span>
          <div>
            <p className="text-[12px] text-core-text-muted">You are a</p>
            <p className="text-[14px] font-semibold text-core-warning">Moderate Investor</p>
          </div>
        </div>

        <p className="text-[12px] text-core-text-muted">Plan Details</p>
        <p className="mb-1 text-[15px] font-semibold text-core-text">{plan.name}</p>
        <p className="mb-4 text-[12px] text-core-text-muted">
          Plan ID {plan.id} · Type 401(K)
        </p>

        <div className="mb-4 border-t border-core-border pt-4">
          <p className="mb-2 text-[13px] font-semibold text-core-text">Contribution Election</p>
          <SummaryRow label="Pretax" value={`${contribution.pretax}%`} />
          <SummaryRow label="AfterTax" value={`${contribution.afterTax}%`} />
          <SummaryRow label="Roth" value={`${contribution.roth}%`} />
        </div>

        <div className="mb-4 border-t border-core-border pt-4">
          <p className="mb-2 text-[13px] font-semibold text-core-text">Auto increase for your selected sources</p>
          {autoIncrease.enabled ? (
            <>
              <SummaryRow label="Period of increase" value="Calendar year" />
              <SummaryRow label="Pre Tax" value={`${autoIncrease.pretaxRate}% (Limit upto ${autoIncrease.limit}%)`} />
              <SummaryRow label="After Tax" value={`${autoIncrease.afterTaxRate}% (Limit upto ${autoIncrease.limit}%)`} />
            </>
          ) : (
            <p className="text-[13px] text-core-text-muted">Not enabled</p>
          )}
        </div>

        <div className="border-t border-core-border pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-core-text">Investments</p>
            <a href="#breakdown" className="text-[12px] font-semibold text-core-info">
              Breakdown
            </a>
          </div>
          <SummaryRow
            label="Auto Rebalance"
            value={investments.autoRebalance ? 'Enabled' : 'Disabled'}
            highlight={investments.autoRebalance}
          />
          <SummaryRow label="Pre-tax" value="100%" />
          <SummaryRow label="After tax" value="100%" />
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-[13px]">
      <span className="text-core-text-muted">{label}</span>
      <span className={`font-medium ${highlight ? 'text-core-success' : 'text-core-text'}`}>{value}</span>
    </div>
  )
}
