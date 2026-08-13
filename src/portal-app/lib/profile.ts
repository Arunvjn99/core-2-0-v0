import { supabase } from '../../lib/supabaseClient'

export type ParticipantProfile = {
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  gender: string | null
  date_of_birth: string | null
  employee_id: string | null
  employer_name: string | null
  status: string
  payroll_frequency: string | null
  employee_classification: string | null
  // Round 4: fields confirmed against the live demo's Personal Details /
  // Bank Details screens that we didn't have at all before.
  ssn: string | null
  marital_status: string | null
  email: string | null
  phone_primary: string | null
  phone_secondary: string | null
  address_line1: string | null
  address_line2: string | null
  address_line3: string | null
  city: string | null
  country: string | null
  state: string | null
  zip_code: string | null
  has_bank_details: boolean
  bank_name: string | null
  bank_account_number: string | null
  bank_routing_number: string | null
}

const PROFILE_COLUMNS =
  'first_name, middle_name, last_name, gender, date_of_birth, employee_id, employer_name, status, payroll_frequency, employee_classification, ssn, marital_status, email, phone_primary, phone_secondary, address_line1, address_line2, address_line3, city, country, state, zip_code, has_bank_details, bank_name, bank_account_number, bank_routing_number'

export type Beneficiary = {
  id: string
  full_name: string
  relationship: string
  allocation_pct: number
}

export async function fetchProfile(participantId: string): Promise<ParticipantProfile | null> {
  const { data, error } = await supabase
    .from('participants')
    .select(PROFILE_COLUMNS)
    .eq('id', participantId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveProfile(participantId: string, profile: Partial<ParticipantProfile>) {
  const { error } = await supabase
    .from('participants')
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq('id', participantId)
  if (error) throw error
}

export async function fetchBeneficiaries(participantId: string): Promise<Beneficiary[]> {
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('id, full_name, relationship, allocation_pct')
    .eq('participant_id', participantId)
    .order('created_at')
  if (error) throw error
  return data ?? []
}

export async function addBeneficiary(participantId: string, b: Omit<Beneficiary, 'id'>) {
  const { error } = await supabase.from('beneficiaries').insert({ participant_id: participantId, ...b })
  if (error) throw error
}

export async function removeBeneficiary(id: string) {
  const { error } = await supabase.from('beneficiaries').delete().eq('id', id)
  if (error) throw error
}

export function calcAge(dob: string | null): string {
  if (!dob) return '—'
  const birth = new Date(dob)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  return `${years} years ${months} months`
}
