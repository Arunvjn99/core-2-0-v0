import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AppShell } from '../../../ui-kit/patterns/AppShell'
import { RiskGauge } from '../../../ui-kit/patterns/RiskGauge'
import { Button } from '../../../ui-kit/primitives/Button'
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
 * 2893:58119/58477 Auto Increment, 2893:64916 Investments, 2893:59711/
 * 60247 Review) — the real "Enroll" flow triggered from a Dashboard plan
 * card, distinct from the risk-profile Questionnaire at /enrollment.
 */
const STEPS = ['Contribution Election', 'Auto Increase', 'Investment Election', 'Review'] as const
type Step = (typeof STEPS)[number]

const STEP_COPY: Record<Step, string> = {
  'Contribution Election': 'Specify the amount to contribute to the plan',
  'Auto Increase': 'Choose Auto Increase to boost your savings',
  'Investment Election': 'Choose the investments and its allocation percentages',
  Review: 'Review your elections before enrolling into the plan',
}

const PLAN = { name: '401(K) Company Plan High Returns', id: '124542' }

export default function PlanEnrollment() {
  const { session } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState(1)
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
                    setDirection(i > stepIndex ? 1 : -1)
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
          <div className="flex-1 overflow-hidden p-6">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={step}
                custom={direction}
                initial={reduceMotion ? undefined : { opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                {step === 'Contribution Election' && (
                  <ContributionStep value={contribution} onChange={setContribution} />
                )}
                {step === 'Auto Increase' && <AutoIncreaseStep value={autoIncrease} onChange={setAutoIncrease} />}
                {step === 'Investment Election' && (
                  <InvestmentStep value={investments} onChange={setInvestments} />
                )}
                {step === 'Review' && (
                  <ReviewStep contribution={contribution} autoIncrease={autoIncrease} investments={investments} />
                )}
              </motion.div>
            </AnimatePresence>

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

function AutoIncreaseStep({ value, onChange }: { value: AutoIncrease; onChange: (v: AutoIncrease) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-core-text">Auto Increase</h2>
          <p className="text-[14px] text-core-text-muted">Automatically raise your contribution rate each year.</p>
        </div>
        <button
          role="switch"
          aria-checked={value.enabled}
          onClick={() => onChange({ ...value, enabled: !value.enabled })}
          className={`relative h-[22px] w-[42px] rounded-full transition-colors ${value.enabled ? 'bg-core-info' : 'bg-core-border-strong'}`}
        >
          <span className={`absolute top-[3px] size-4 rounded-full bg-white transition-all ${value.enabled ? 'left-[21px]' : 'left-[3px]'}`} />
        </button>
      </div>

      {value.enabled && (
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField label="Pre-tax increase % / yr" value={value.pretaxRate} onChange={(n) => onChange({ ...value, pretaxRate: n })} />
          <NumberField label="After-tax increase % / yr" value={value.afterTaxRate} onChange={(n) => onChange({ ...value, afterTaxRate: n })} />
          <NumberField label="Limit %" value={value.limit} onChange={(n) => onChange({ ...value, limit: n })} />
        </div>
      )}
    </div>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-medium text-core-text-muted">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border border-core-border bg-core-bg px-3 py-2 text-[15px] text-core-text"
      />
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

function ReviewStep({
  contribution,
  autoIncrease,
  investments,
}: {
  contribution: Contribution
  autoIncrease: AutoIncrease
  investments: EnrollmentInvestments
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-core-md bg-core-warning-bg p-4">
        <div>
          <p className="text-[13px] text-core-text-muted">You are a</p>
          <p className="text-[16px] font-semibold text-core-warning">Moderate Investor</p>
        </div>
        <RiskGauge level="Moderate" />
      </div>

      <div>
        <p className="text-[13px] text-core-text-muted">Plan Details</p>
        <p className="text-[16px] font-semibold text-core-text">{PLAN.name}</p>
        <p className="text-[13px] text-core-text-muted">Plan ID {PLAN.id} · Type 401(K)</p>
      </div>

      <div>
        <h3 className="mb-2 text-[14px] font-semibold text-core-text">Contribution Election</h3>
        <RateRows rates={contribution} />
      </div>

      <div>
        <h3 className="mb-2 text-[14px] font-semibold text-core-text">Auto Increase</h3>
        {autoIncrease.enabled ? (
          <RateRows rates={{ pretax: autoIncrease.pretaxRate, roth: 0, afterTax: autoIncrease.afterTaxRate }} />
        ) : (
          <p className="text-[13px] text-core-text-muted">Not enabled</p>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-[14px] font-semibold text-core-text">Investments</h3>
        <p className="text-[13px] text-core-text-muted">
          {investments.mode === 'plan_default' ? 'Plan Default Investments' : 'Manual Investments'} ·{' '}
          Auto Rebalance {investments.autoRebalance ? 'Enabled' : 'Disabled'}
        </p>
      </div>
    </div>
  )
}
