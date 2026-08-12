import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { ThemeToggle } from '../../../ui-kit/primitives/ThemeToggle'
import {
  LIKERT_OPTIONS,
  RISK_QUESTIONS,
  scoreRiskAnswers,
  saveRiskProfile,
  type FundingDetails,
  type LikertAnswer,
} from '../../lib/riskProfile'

/**
 * Figma: Questionnaire-1..6 (nodes 2893:53746 – 2893:56131, canonical =
 * rightmost/last variant per step). Steps 1-5 are a single Likert question
 * each; step 6 is a short funding-details form; submitting scores the
 * answers into a risk level and writes it to core2.saved_plans.
 */
const TOTAL_STEPS = 6

const US_STATES = ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Other']

const emptyFunding: FundingDetails = {
  retirementState: 'California',
  retirementAge: 67,
  monthlySpend: 0,
  annualSalary: 0,
  otherSavings: 0,
}

export default function Questionnaire() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<(LikertAnswer | null)[]>(Array(5).fill(null))
  const [funding, setFunding] = useState<FundingDetails>(emptyFunding)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const firstName = useMemo(() => {
    const meta = session?.user.user_metadata as { first_name?: string } | undefined
    return meta?.first_name ?? 'there'
  }, [session])

  const canAdvance = step <= 5 ? answers[step - 1] !== null : true

  async function handleSubmit() {
    if (!session) return
    setSaving(true)
    setError(null)
    try {
      const finalAnswers = answers as LikertAnswer[]
      const { score, level } = scoreRiskAnswers(finalAnswers)
      await saveRiskProfile(session.user.id, {
        type: 'risk_profile',
        answers: finalAnswers,
        funding,
        score,
        level,
        computed_at: new Date().toISOString(),
      })
      navigate('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your answers — try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative flex min-h-svh w-full flex-col bg-core-surface lg:flex-row">
      <ThemeToggle className="fixed right-4 top-4 z-10 bg-core-surface shadow-core-sm" />
      <aside
        className="hidden w-[592px] shrink-0 items-center justify-center p-[65px] lg:flex"
        style={{
          backgroundImage:
            'radial-gradient(circle at 90% 0%, #4adfff 0%, #27b7de 22%, #15a4cd 33%, #0490bd 45%, #025c9e 82%)',
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center gap-16 rounded-2xl border border-white/20 bg-white/10 p-10 backdrop-blur-2xl">
          <div className="flex flex-col items-start gap-4 text-white">
            <span className="text-2xl" aria-hidden>✨</span>
            <div className="flex flex-col gap-2">
              <p className="text-[32px] font-bold leading-tight">
                Quick Setup
                <br />
                Smarter Insights
              </p>
              <p className="text-[18px] text-white/90">See how ready you are for retirement</p>
            </div>
          </div>
          <div className="flex w-full max-w-[296px] flex-col gap-4">
            <div className="flex items-center gap-3 rounded-[4px] bg-core-surface p-4 shadow-lg -rotate-[2.7deg]">
              <StatBadge value="100%" label="EXCELLENT" />
              <p className="text-[12px] font-medium text-core-text">Retirement Readiness Score</p>
            </div>
            <div className="flex items-center gap-4 rounded-[5px] bg-white p-4 shadow-xl rotate-[1.2deg]">
              <StatBadge value="" label="LOW RISK" />
              <p className="text-[12px] font-medium text-[#30313b]">Risk aligned with retirement</p>
            </div>
            <div className="flex items-center gap-3 rounded-[4px] bg-core-surface p-4 shadow-lg -rotate-[4.3deg]">
              <StatBadge value="" label="LOW" />
              <p className="text-[12px] font-medium text-core-text">Your Retirement Funding Gap</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col items-end px-8 pb-12 pt-16 shadow-[0_1px_10px_rgba(0,0,0,0.05),0_4px_5px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.12)] sm:px-16">
        <div className="flex w-full max-w-[640px] flex-col gap-8">
          <h1 className="text-[32px] font-bold text-core-text">Hey {firstName}!</h1>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <p className="text-[20px] font-medium text-core-text-muted">
                Take a quick questionnaire to understand your investment style and get insights, tailored
                for your future.
              </p>
              <div className="flex gap-2">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full"
                    style={
                      i < step
                        ? { backgroundImage: 'linear-gradient(90deg, var(--core-color-cta-from) 14.6%, var(--core-color-cta-to) 107.38%)' }
                        : { backgroundColor: 'var(--core-color-border-strong)' }
                    }
                  />
                ))}
              </div>
            </div>

            {step <= 5 ? (
              <LikertStep
                step={step}
                question={RISK_QUESTIONS[step - 1]}
                value={answers[step - 1]}
                onChange={(v) => setAnswers((prev) => prev.map((a, i) => (i === step - 1 ? v : a)))}
              />
            ) : (
              <FundingStep funding={funding} onChange={setFunding} />
            )}

            {error && <p className="text-[14px] text-core-critical">{error}</p>}

            <div className="flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="text-[16px] font-semibold text-core-info"
                >
                  ‹ Previous
                </button>
              ) : (
                <span />
              )}
              {step < TOTAL_STEPS ? (
                <button
                  disabled={!canAdvance}
                  onClick={() => setStep((s) => s + 1)}
                  className="rounded-core-sm px-5 py-2.5 text-[16px] font-semibold text-white disabled:opacity-40"
                  style={{ backgroundImage: 'linear-gradient(90deg, var(--core-color-cta-from) 14.6%, var(--core-color-cta-to) 107.38%)' }}
                >
                  Next
                </button>
              ) : (
                <button
                  disabled={saving}
                  onClick={handleSubmit}
                  className="rounded-core-sm px-5 py-2.5 text-[16px] font-semibold text-white disabled:opacity-60"
                  style={{ backgroundImage: 'linear-gradient(90deg, var(--core-color-cta-from) 14.6%, var(--core-color-cta-to) 107.38%)' }}
                >
                  {saving ? 'Saving…' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      {value && <p className="text-[18px] font-bold text-core-text">{value}</p>}
      <p className="rounded-full bg-[#e7f6ea] px-1.5 py-0.5 text-[9px] font-bold text-[#105f27]">{label}</p>
    </div>
  )
}

function LikertStep({
  step,
  question,
  value,
  onChange,
}: {
  step: number
  question: string
  value: LikertAnswer | null
  onChange: (v: LikertAnswer) => void
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-2 flex flex-col gap-2">
        <span className="text-[14px] text-core-text-muted">{String(step).padStart(2, '0')} /06</span>
        <span className="text-[20px] font-semibold text-core-text/90">{question}</span>
      </legend>
      <div className="flex flex-col gap-3">
        {LIKERT_OPTIONS.map((opt) => (
          <label
            key={opt}
            className={`flex cursor-pointer items-center gap-3 rounded-[5px] border px-3 py-4 transition-colors ${
              value === opt ? 'border-core-info bg-core-info/5' : 'border-core-border bg-core-surface'
            }`}
          >
            <input
              type="radio"
              name={`question-${step}`}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="size-[18px] shrink-0 appearance-none rounded-full border-2 border-core-border-strong bg-core-surface bg-clip-content p-[3px] checked:border-[var(--core-color-info)] checked:bg-[var(--core-color-info)]"
            />
            <span className="text-[14px] font-medium text-core-text">{opt}</span>
          </label>
        ))}
      </div>
      <p className="rounded-b-lg bg-core-info/10 px-6 py-4 text-[14px] font-semibold text-core-info">
        This question directly influences how we set up your investment style.
      </p>
    </fieldset>
  )
}

function FundingStep({
  funding,
  onChange,
}: {
  funding: FundingDetails
  onChange: (f: FundingDetails) => void
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-1 text-[14px] text-core-text-muted">06 /06</legend>
      <FundingRow icon="📍" label="Where do you intend to spend your retirement years?">
        <select
          value={funding.retirementState}
          onChange={(e) => onChange({ ...funding, retirementState: e.target.value })}
          className="w-full rounded-[6px] border border-core-border bg-core-bg px-3 py-2 text-[15px]"
        >
          {US_STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </FundingRow>
      <FundingRow icon="🏖️" label="At what age do you plan to retire?">
        <input
          type="number"
          value={funding.retirementAge}
          onChange={(e) => onChange({ ...funding, retirementAge: Number(e.target.value) })}
          className="w-full rounded-[6px] border border-core-border bg-core-bg px-3 py-2 text-[15px]"
        />
      </FundingRow>
      <FundingRow icon="📅" label="On an average how much do you spend each month?">
        <CurrencyInput
          value={funding.monthlySpend}
          onChange={(v) => onChange({ ...funding, monthlySpend: v })}
        />
      </FundingRow>
      <FundingRow icon="💰" label="What is your annual salary?">
        <CurrencyInput value={funding.annualSalary} onChange={(v) => onChange({ ...funding, annualSalary: v })} />
      </FundingRow>
      <FundingRow
        icon="💵"
        label="What are your other savings outside of your 401(k), including IRAs, Certificate of Deposit, annuities or other personal investments?"
      >
        <CurrencyInput value={funding.otherSavings} onChange={(v) => onChange({ ...funding, otherSavings: v })} />
      </FundingRow>
    </fieldset>
  )
}

function FundingRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[8px] bg-core-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-core-info/10 text-lg">
        {icon}
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-[15px] font-semibold text-core-text">{label}</p>
        {children}
      </div>
    </div>
  )
}

function CurrencyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-[6px] border border-core-border bg-core-bg px-3 py-2">
      <span className="text-core-text-muted">$</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent text-[15px] outline-none"
      />
    </div>
  )
}
