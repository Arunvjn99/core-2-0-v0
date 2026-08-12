import { IconChevronRight, IconInfo } from '../icons'

export type Plan = {
  id: string
  name: string
  planId: string
  type: string
  eligible: boolean
  ineligibleReason?: string
}

export function PlanCard({ plan, onEnroll }: { plan: Plan; onEnroll: (plan: Plan) => void }) {
  return (
    <div className="flex w-full flex-col items-start justify-between gap-4 rounded-core-md bg-core-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.34)] sm:flex-row sm:items-center sm:gap-6">
      <div className="flex flex-col items-start gap-2">
        {!plan.eligible && (
          <span className="rounded-full bg-core-critical px-2 py-1 text-[12px] font-semibold text-white">
            INELIGIBLE
          </span>
        )}
        <p className="text-[18px] font-semibold text-core-text">{plan.name}</p>
        <div className="flex items-center gap-2 text-[14px] text-core-text-muted">
          <span>Plan ID {plan.planId}</span>
          <span aria-hidden>•</span>
          <span>Type {plan.type}</span>
        </div>
        {!plan.eligible && (
          <div className="flex items-center gap-1 text-[12px] font-medium text-core-text-subtle">
            <IconInfo className="size-3.5" />
            {plan.ineligibleReason ?? "See what's required to enroll"}
          </div>
        )}
      </div>
      <button
        onClick={() => onEnroll(plan)}
        disabled={!plan.eligible}
        className="flex w-full shrink-0 items-center justify-center gap-2 rounded-core-sm px-3 py-2.5 text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:border disabled:border-core-border-strong disabled:bg-core-surface-sunken disabled:text-core-text-muted sm:w-auto"
        style={
          plan.eligible
            ? { backgroundImage: 'linear-gradient(90deg, var(--core-color-cta-from) 14.6%, var(--core-color-cta-to) 107.38%)' }
            : undefined
        }
      >
        Enroll <IconChevronRight className="size-3.5" />
      </button>
    </div>
  )
}
