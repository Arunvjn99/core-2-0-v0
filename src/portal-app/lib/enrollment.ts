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

export type Enrollment = {
  id: string
  plan_name: string
  plan_id: string
  contribution: Contribution
  auto_increase: AutoIncrease
  investments: EnrollmentInvestments
  status: string
  created_at: string
}

/**
 * Drives the pre-/post-enrollment Dashboard split: a participant with any
 * row here has "enrolled" state and sees the My Plans dashboard instead of
 * the plan picker. No hardcoded enrolled/not-enrolled flag anywhere else —
 * this table is the single source of truth.
 */
export async function fetchEnrollments(participantId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('participant_id', participantId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
