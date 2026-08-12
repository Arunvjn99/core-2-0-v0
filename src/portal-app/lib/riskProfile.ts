import { supabase } from '../../lib/supabaseClient'
import { RISK_LEVELS, type RiskLevel } from '../../ui-kit/patterns/RiskGauge'

export const LIKERT_OPTIONS = ['Strongly Agree', 'Agree', 'On the fence', 'Disagree', 'Strongly Disagree'] as const
export type LikertAnswer = (typeof LIKERT_OPTIONS)[number]

// Figma: Questionnaire-1..5 (nodes 2893:53746..55894), one Likert item each.
export const RISK_QUESTIONS = [
  'I plan to keep my retirement savings intact and will not use them for big expenses before I retire.',
  "I focus on steady saving and don't worry about studying all the details of investing or economic trends.",
  'I prefer long-term growth of my money to keep up with rising cost(s), even if that means accepting short-term ups and downs in the value of my investments.',
  "I am confident I won't panic and sell, even if my investments go down in value over a year.",
  'I prefer stable, lower-risk investments more than chasing uncertain returns through higher risk.',
] as const

export type FundingDetails = {
  retirementState: string
  retirementAge: number
  monthlySpend: number
  annualSalary: number
  otherSavings: number
}

/**
 * TODO: this scoring is a placeholder ordinal average (1..5 -> risk band),
 * not a validated actuarial risk model. Swap for the real methodology once
 * defined by product/compliance — the shape (0-100 score -> RISK_LEVELS
 * band) is what downstream screens (Dashboard risk widget, Review) depend
 * on, so keep that contract stable when replacing the math.
 */
export function scoreRiskAnswers(answers: LikertAnswer[]): { score: number; level: RiskLevel } {
  const weight: Record<LikertAnswer, number> = {
    'Strongly Agree': 5,
    Agree: 4,
    'On the fence': 3,
    Disagree: 2,
    'Strongly Disagree': 1,
  }
  const avg = answers.reduce((sum, a) => sum + weight[a], 0) / answers.length
  const score = Math.round(((avg - 1) / 4) * 100) // 0..100
  const levelIndex = Math.min(RISK_LEVELS.length - 1, Math.floor((avg - 1) / (4 / (RISK_LEVELS.length - 1))))
  return { score, level: RISK_LEVELS[levelIndex] }
}

export type RiskProfilePlan = {
  type: 'risk_profile'
  answers: LikertAnswer[]
  funding: FundingDetails
  score: number
  level: RiskLevel
  computed_at: string
}

export async function saveRiskProfile(participantId: string, plan: RiskProfilePlan) {
  const { error } = await supabase.from('saved_plans').insert({
    participant_id: participantId,
    plan_data: plan,
  })
  if (error) throw error
}

export async function fetchLatestRiskProfile(participantId: string): Promise<RiskProfilePlan | null> {
  const { data, error } = await supabase
    .from('saved_plans')
    .select('plan_data')
    .eq('participant_id', participantId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  const match = data?.find((row) => (row.plan_data as RiskProfilePlan)?.type === 'risk_profile')
  return (match?.plan_data as RiskProfilePlan) ?? null
}
