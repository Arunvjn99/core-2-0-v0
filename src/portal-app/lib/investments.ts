import { supabase } from '../../lib/supabaseClient'

export type InvestmentMode = 'advisor' | 'plan_default' | 'manual'

export type Fund = {
  name: string
  type: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Bond'
  allocation: number
}

// TODO: replace with a real fund catalogue table once the plan-sponsor
// integration exists — these are the funds shown in the Figma reference.
export const RECOMMENDED_FUNDS: Fund[] = [
  { name: 'Franklin managed income fund', type: 'Large Cap', allocation: 20 },
  { name: 'The Columbia mid cap index fund', type: 'Large Cap', allocation: 20 },
  { name: 'The Fidelity mid cap index fund', type: 'Large Cap', allocation: 20 },
  { name: 'BNY mellon mid cap index shares', type: 'Mid Cap', allocation: 20 },
  { name: 'The Fidelity PES Wellington Fund', type: 'Mid Cap', allocation: 20 },
]

export type InvestmentSelectionPlan = {
  type: 'investment_selection'
  mode: InvestmentMode
  autoRebalance: boolean
  funds: Fund[]
  saved_at: string
}

export async function saveInvestmentSelection(participantId: string, plan: InvestmentSelectionPlan) {
  const { error } = await supabase.from('saved_plans').insert({
    participant_id: participantId,
    plan_data: plan,
  })
  if (error) throw error
}

export async function fetchLatestInvestmentSelection(
  participantId: string,
): Promise<InvestmentSelectionPlan | null> {
  const { data, error } = await supabase
    .from('saved_plans')
    .select('plan_data')
    .eq('participant_id', participantId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  const match = data?.find((row) => (row.plan_data as InvestmentSelectionPlan)?.type === 'investment_selection')
  return (match?.plan_data as InvestmentSelectionPlan) ?? null
}
