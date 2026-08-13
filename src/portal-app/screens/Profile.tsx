import { useEffect, useState } from 'react'
import { AppShell } from '../../ui-kit/patterns/AppShell'
import { TextField } from '../../ui-kit/primitives/TextField'
import { Select } from '../../ui-kit/primitives/Select'
import { Button } from '../../ui-kit/primitives/Button'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../../ui-kit/lib/ToastContext'
import { IconEye, IconEyeOff } from '../../ui-kit/icons'
import {
  fetchProfile,
  saveProfile,
  fetchBeneficiaries,
  addBeneficiary,
  removeBeneficiary,
  calcAge,
  type ParticipantProfile,
  type Beneficiary,
} from '../lib/profile'

/**
 * Figma: mobile-first Profile flow — Personal Details (2893:12648), Edit
 * Personal Details (2893:12743), Employment details (2893:12559),
 * Beneficiary details (2893:13321). Rebuilt as tabs on one responsive
 * screen rather than separate mobile pages, since the desktop app doesn't
 * need a phone-only navigation pattern — same sections, same fields.
 */
const TABS = ['Personal Details', 'Bank Details', 'Employment', 'Beneficiaries'] as const
type Tab = (typeof TABS)[number]

export default function Profile() {
  const [tab, setTab] = useState<Tab>('Personal Details')

  return (
    <AppShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-core-text">Profile</h1>
          <p className="text-[15px] text-core-text-muted">Your personal, employment, and beneficiary details</p>
        </div>

        <div className="flex gap-1 border-b border-core-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-4 py-3 text-[14px] font-medium ${
                tab === t ? 'border-core-info text-core-info' : 'border-transparent text-core-text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Personal Details' && <PersonalDetailsTab />}
        {tab === 'Bank Details' && <BankDetailsTab />}
        {tab === 'Employment' && <EmploymentTab />}
        {tab === 'Beneficiaries' && <BeneficiariesTab />}
      </div>
    </AppShell>
  )
}

function PersonalDetailsTab() {
  const { session } = useAuth()
  const { show } = useToast()
  const [profile, setProfile] = useState<ParticipantProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Partial<ParticipantProfile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ssnVisible, setSsnVisible] = useState(false)

  useEffect(() => {
    if (!session) return
    fetchProfile(session.user.id).then((p) => {
      setProfile(p)
      setDraft(p ?? {})
      setLoading(false)
    })
  }, [session])

  async function handleSave() {
    if (!session) return
    setSaving(true)
    try {
      await saveProfile(session.user.id, draft)
      setProfile((prev) => ({ ...(prev as ParticipantProfile), ...draft }))
      setEditing(false)
      show('Personal details saved')
    } catch (e) {
      show(e instanceof Error ? e.message : 'Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-core-text-muted">Loading…</p>

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || session?.user.email

  if (!editing) {
    return (
      <div className="flex flex-col gap-6 rounded-core-md bg-core-surface p-6 shadow-core-sm">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-core-primary/15 text-[22px] font-semibold text-core-primary">
            {fullName?.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-semibold text-core-text">{fullName}</p>
              <span className="rounded-full bg-core-success-bg px-2 py-0.5 text-[11px] font-semibold uppercase text-core-success">
                {profile?.status ?? 'active'}
              </span>
            </div>
            <p className="text-[13px] text-core-text-muted">{profile?.employer_name ?? '—'}</p>
            <p className="text-[13px] text-core-text-muted">Employee ID {profile?.employee_id ?? '—'}</p>
          </div>
        </div>

        <div className="border-t border-core-border pt-5">
          <h3 className="mb-3 text-[14px] font-semibold text-core-text">Basic details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadField label="First name" value={profile?.first_name} />
            <ReadField label="Middle name" value={profile?.middle_name ?? '-'} />
            <ReadField label="Last name" value={profile?.last_name} />
            <ReadField label="Gender" value={profile?.gender ?? '—'} />
            <ReadField
              label="Date of birth"
              value={profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : '—'}
              hint={profile?.date_of_birth ? calcAge(profile.date_of_birth) : undefined}
            />
            <ReadField label="Marital status" value={profile?.marital_status ?? '—'} />
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-core-text-muted">SSN</p>
              <div className="flex items-center justify-between rounded-[6px] bg-core-surface-sunken px-3 py-2.5 text-[14px] text-core-text">
                <span>{maskSsn(profile?.ssn, ssnVisible)}</span>
                {profile?.ssn && (
                  <button
                    type="button"
                    onClick={() => setSsnVisible((v) => !v)}
                    className="text-core-text-muted hover:text-core-text"
                    aria-label={ssnVisible ? 'Hide SSN' : 'Show SSN'}
                  >
                    {ssnVisible ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-core-border pt-5">
          <h3 className="mb-3 text-[14px] font-semibold text-core-text">Contact details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadField label="Email" value={profile?.email} />
            <ReadField label="Primary phone number" value={profile?.phone_primary} />
            <ReadField label="Secondary phone number" value={profile?.phone_secondary} />
            <ReadField label="Address line 1" value={profile?.address_line1} />
            <ReadField label="Address line 2" value={profile?.address_line2} />
            <ReadField label="Address line 3" value={profile?.address_line3} />
            <ReadField label="City" value={profile?.city} />
            <ReadField label="State" value={profile?.state} />
            <ReadField label="Country" value={profile?.country} />
            <ReadField label="Zip code" value={profile?.zip_code} />
          </div>
        </div>

        <div>
          <Button variant="cta" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 rounded-core-md bg-core-surface p-6 shadow-core-sm">
      <h3 className="text-[16px] font-semibold text-core-text">Edit Personal Details</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" value={draft.first_name ?? ''} onChange={(e) => setDraft({ ...draft, first_name: e.target.value })} />
        <TextField label="Middle name" value={draft.middle_name ?? ''} onChange={(e) => setDraft({ ...draft, middle_name: e.target.value })} />
        <TextField label="Last name" value={draft.last_name ?? ''} onChange={(e) => setDraft({ ...draft, last_name: e.target.value })} />
        <Select label="Gender" value={draft.gender ?? ''} onChange={(e) => setDraft({ ...draft, gender: e.target.value })}>
          <option>Female</option>
          <option>Male</option>
          <option>Prefer not to say</option>
        </Select>
        <TextField
          label="Date of birth"
          type="date"
          value={draft.date_of_birth ?? ''}
          onChange={(e) => setDraft({ ...draft, date_of_birth: e.target.value })}
        />
        <Select label="Marital status" value={draft.marital_status ?? ''} onChange={(e) => setDraft({ ...draft, marital_status: e.target.value })}>
          <option value="">Select an option</option>
          <option>Single</option>
          <option>Married</option>
          <option>Divorced</option>
          <option>Widower</option>
        </Select>
        <TextField label="SSN" value={draft.ssn ?? ''} onChange={(e) => setDraft({ ...draft, ssn: e.target.value })} />
      </div>

      <h3 className="text-[16px] font-semibold text-core-text">Contact Details</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Email" type="email" value={draft.email ?? ''} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
        <TextField label="Primary phone number" value={draft.phone_primary ?? ''} onChange={(e) => setDraft({ ...draft, phone_primary: e.target.value })} />
        <TextField label="Secondary phone number" value={draft.phone_secondary ?? ''} onChange={(e) => setDraft({ ...draft, phone_secondary: e.target.value })} />
        <TextField label="Address line 1" value={draft.address_line1 ?? ''} onChange={(e) => setDraft({ ...draft, address_line1: e.target.value })} />
        <TextField label="Address line 2" value={draft.address_line2 ?? ''} onChange={(e) => setDraft({ ...draft, address_line2: e.target.value })} />
        <TextField label="Address line 3" value={draft.address_line3 ?? ''} onChange={(e) => setDraft({ ...draft, address_line3: e.target.value })} />
        <TextField label="City" value={draft.city ?? ''} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
        <TextField label="State" value={draft.state ?? ''} onChange={(e) => setDraft({ ...draft, state: e.target.value })} />
        <TextField label="Country" value={draft.country ?? ''} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
        <TextField label="Zip code" value={draft.zip_code ?? ''} onChange={(e) => setDraft({ ...draft, zip_code: e.target.value })} />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => { setDraft(profile ?? {}); setEditing(false) }}>
          Cancel
        </Button>
        <Button variant="cta" loading={saving} onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  )
}

function maskSsn(ssn: string | null | undefined, visible: boolean): string {
  if (!ssn) return '—'
  if (visible) return ssn
  const last4 = ssn.replace(/\D/g, '').slice(-4) || '????'
  return `XXX-XX-${last4}`
}

function ReadField({ label, value, hint }: { label: string; value?: string | null; hint?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-core-text-muted">{label}</p>
      <div className="rounded-[6px] bg-core-surface-sunken px-3 py-2.5 text-[14px] text-core-text">{value || '—'}</div>
      {hint && <p className="mt-1 text-[12px] text-core-text-muted">{hint}</p>}
    </div>
  )
}

/**
 * Confirmed live (round 4): a "Set bank information" Yes/No toggle that
 * reveals account fields when Yes — we had nothing here before.
 */
function BankDetailsTab() {
  const { session } = useAuth()
  const { show } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasBank, setHasBank] = useState(false)
  const [draft, setDraft] = useState<Partial<ParticipantProfile>>({})

  useEffect(() => {
    if (!session) return
    fetchProfile(session.user.id).then((p) => {
      setHasBank(p?.has_bank_details ?? false)
      setDraft(p ?? {})
      setLoading(false)
    })
  }, [session])

  async function handleSave() {
    if (!session) return
    setSaving(true)
    try {
      await saveProfile(session.user.id, { ...draft, has_bank_details: hasBank })
      show('Bank details saved')
    } catch (e) {
      show(e instanceof Error ? e.message : 'Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-core-text-muted">Loading…</p>

  return (
    <div className="flex flex-col gap-5 rounded-core-md bg-core-surface p-6 shadow-core-sm">
      <h3 className="text-[16px] font-semibold text-core-text">Bank Details</h3>
      <div>
        <p className="mb-2 text-[14px] font-medium text-core-text">Set bank information</p>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2 text-[14px] text-core-text">
              <input
                type="radio"
                name="has-bank"
                checked={hasBank === opt.value}
                onChange={() => setHasBank(opt.value)}
                className="size-4 accent-[var(--core-color-info)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {hasBank && (
        <div className="grid gap-4 border-t border-core-border pt-4 sm:grid-cols-2">
          <TextField label="Bank name" value={draft.bank_name ?? ''} onChange={(e) => setDraft({ ...draft, bank_name: e.target.value })} />
          <TextField
            label="Account number"
            value={draft.bank_account_number ?? ''}
            onChange={(e) => setDraft({ ...draft, bank_account_number: e.target.value })}
          />
          <TextField
            label="Routing number"
            value={draft.bank_routing_number ?? ''}
            onChange={(e) => setDraft({ ...draft, bank_routing_number: e.target.value })}
          />
        </div>
      )}

      <div>
        <Button variant="cta" loading={saving} onClick={handleSave}>
          Edit
        </Button>
      </div>
    </div>
  )
}

function EmploymentTab() {
  const { session } = useAuth()
  const [profile, setProfile] = useState<ParticipantProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    fetchProfile(session.user.id).then((p) => {
      setProfile(p)
      setLoading(false)
    })
  }, [session])

  if (loading) return <p className="text-core-text-muted">Loading…</p>

  return (
    <div className="flex flex-col gap-5 rounded-core-md bg-core-surface p-6 shadow-core-sm">
      <h3 className="text-[16px] font-semibold text-core-text">Employment details</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <ReadField label="Payroll Frequency" value={profile?.payroll_frequency ?? 'Monthly'} />
        <ReadField label="Employee Classification" value={profile?.employee_classification ?? 'Permanent'} />
        <ReadField label="Employer" value={profile?.employer_name} />
        <ReadField label="Employee ID" value={profile?.employee_id} />
      </div>
    </div>
  )
}

const RELATIONSHIPS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other']

function BeneficiariesTab() {
  const { session } = useAuth()
  const { show } = useToast()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0])
  const [pct, setPct] = useState(100)
  const [saving, setSaving] = useState(false)

  function load() {
    if (!session) return
    setLoading(true)
    fetchBeneficiaries(session.user.id)
      .then(setBeneficiaries)
      .finally(() => setLoading(false))
  }

  useEffect(load, [session])

  async function handleAdd() {
    if (!session || !name.trim()) return
    setSaving(true)
    try {
      await addBeneficiary(session.user.id, { full_name: name.trim(), relationship, allocation_pct: pct })
      show('Beneficiary added')
      setName('')
      setPct(100)
      setAdding(false)
      load()
    } catch (e) {
      show(e instanceof Error ? e.message : 'Could not add beneficiary', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id: string) {
    await removeBeneficiary(id)
    show('Beneficiary removed')
    load()
  }

  if (loading) return <p className="text-core-text-muted">Loading…</p>

  return (
    <div className="rounded-core-md bg-core-surface p-6 shadow-core-sm">
      <h3 className="mb-4 text-[16px] font-semibold text-core-text">Beneficiary details</h3>

      {beneficiaries.length === 0 && !adding ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="text-4xl" aria-hidden>👪</span>
          <p className="text-[16px] font-semibold text-core-text">You haven't added any beneficiary</p>
          <p className="text-[13px] text-core-text-muted">Add beneficiary and complete your profile</p>
          <Button variant="cta" onClick={() => setAdding(true)} className="mt-2">
            Add Beneficiary
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {beneficiaries.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-core-sm border border-core-border p-3">
              <div>
                <p className="text-[14px] font-medium text-core-text">{b.full_name}</p>
                <p className="text-[12px] text-core-text-muted">{b.relationship} · {b.allocation_pct}%</p>
              </div>
              <button onClick={() => handleRemove(b.id)} className="text-[13px] font-semibold text-core-critical">
                Remove
              </button>
            </div>
          ))}
          {!adding && (
            <Button variant="secondary" onClick={() => setAdding(true)} className="w-fit">
              + Add another
            </Button>
          )}
        </div>
      )}

      {adding && (
        <div className="mt-4 flex flex-col gap-4 border-t border-core-border pt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Select label="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
              {RELATIONSHIPS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
            <TextField
              label="Allocation %"
              type="number"
              min={0}
              max={100}
              value={pct}
              onChange={(e) => setPct(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button variant="cta" loading={saving} disabled={!name.trim()} onClick={handleAdd}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
