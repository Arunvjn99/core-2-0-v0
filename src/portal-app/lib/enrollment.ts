import { supabase } from '../../lib/supabaseClient'

export type ContributionMode = 'plan_default' | 'maximum' | 'manual'
export type Contribution = { mode: ContributionMode; pretax: number; roth: number; afterTax: number }

export type AutoIncrease = { enabled: boolean; pretaxRate: number; afterTaxRate: number; limit: number }

export type EnrollmentInvestments = { mode: 'plan_default' | 'manual'; autoRebalance: boolean }

export type EnrollmentDraft = {
  planName: string
  planId: string
  contribution: Contribution
  autoIncrease: AutoIncrease
  investments: EnrollmentInvestments
}

export const CONTRIBUTION_PRESETS: Record<'plan_default' | 'maximum', Omit<Contribution, 'mode'>> = {
  plan_default: { pretax: 5, roth: 5, afterTax: 5 },
  maximum: { pretax: 10, roth: 10, afterTax: 10 },
}

export async function submitEnrollment(participantId: string, draft: EnrollmentDraft) {
  const { error } = await supabase.from('enrollments').insert({
    participant_id: participantId,
    plan_name: draft.planName,
    plan_id: draft.planId,
    contribution: draft.contribution,
    auto_increase: draft.autoIncrease,
    investments: draft.investments,
    status: 'enrolled',
  })
  if (error) throw error
}
