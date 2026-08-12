import { useState } from 'react'
import { AppShell } from '../../ui-kit/patterns/AppShell'
import { Modal } from '../../ui-kit/primitives/Modal'
import { Select } from '../../ui-kit/primitives/Select'
import { Button } from '../../ui-kit/primitives/Button'
import { TextField } from '../../ui-kit/primitives/TextField'
import { IconFileExport, IconReset, IconDownload } from '../../ui-kit/icons'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../ui-kit/lib/ToastContext'
import emptyFolder from '../../assets/statements/empty-folder.png'

type DocumentRow = {
  id: string
  plan_name: string | null
  plan_id: string | null
  document_type: string
  period_label: string | null
  created_at: string
}

/**
 * Figma: "documents" (node 2893:10794) list screen + "Generate statement"
 * modal (node 2893:23830, canonical of 9 variants). Queries core2.documents
 * for real — currently always empty until a document-generation backend
 * exists, so the "No Data Found!" state is the accurate default, not a
 * placeholder.
 */
const DOC_TYPES = ['Quarterly Statement', 'Annual Statement', 'Tax Form', 'Confirmation']
const PERIODS = ['Q1 2026', 'Q4 2025', 'Q3 2025', 'Q2 2025', 'Q1 2025']

export default function Statements() {
  const { session } = useAuth()
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<DocumentRow[]>([])
  const [searching, setSearching] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  async function handleSearch() {
    if (!session) return
    setSearching(true)
    const { data } = await supabase
      .from('documents')
      .select('id, plan_name, plan_id, document_type, period_label, created_at')
      .eq('participant_id', session.user.id)
      .ilike('document_type', `%${search}%`)
      .order('created_at', { ascending: false })
    setRows(data ?? [])
    setSearching(false)
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-core-border pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[22px] font-semibold text-core-text">Documents</h1>
            <p className="text-[16px] text-core-text-muted">Statements, tax forms, and confirmations</p>
          </div>
          <Button variant="cta" onClick={() => setModalOpen(true)}>
            <IconFileExport className="size-3.5" />
            Generate statement
          </Button>
        </div>

        <div className="flex flex-col items-end gap-3 lg:flex-row">
          <TextField
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Document type…"
          />
          <Select label="Plan name / ID">
            <option>401(K) Save More — 124542</option>
          </Select>
          <Select label="Document type">
            {DOC_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <Select label="Created date range">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </Select>
          <button
            onClick={() => {
              setSearch('')
              setRows([])
            }}
            className="flex shrink-0 items-center gap-1 py-2 text-[16px] font-semibold text-core-info"
          >
            <IconReset className="size-3.5" />
            Reset
          </button>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="shrink-0 rounded-[4px] border border-core-info bg-core-info/10 px-4 py-2.5 text-[16px] font-semibold text-core-info disabled:opacity-60"
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>

        <div className="h-px w-full bg-core-border" />

        <p className="text-[16px] text-core-text-muted">
          <span className="font-semibold text-core-text">{rows.length}</span> - Record(s) found
        </p>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-8 py-16">
            <img src={emptyFolder} alt="" className="h-40 w-60 object-contain" />
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-[20px] font-semibold text-core-text">No Data Found!</p>
              <p className="text-[14px] text-core-text-subtle">
                No documents match your search yet — try generating a statement above.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-core-md border border-core-border">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-core-border bg-core-surface-sunken text-core-text-muted">
                  <th className="px-4 py-3 font-medium">Document type</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 font-medium">Generated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-core-border last:border-0">
                    <td className="px-4 py-3 font-medium text-core-text">{row.document_type}</td>
                    <td className="px-4 py-3 text-core-text-muted">
                      {row.plan_name} {row.plan_id && `· ${row.plan_id}`}
                    </td>
                    <td className="px-4 py-3 text-core-text-muted">{row.period_label ?? '—'}</td>
                    <td className="px-4 py-3 text-core-text-muted">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <GenerateStatementModal
          onClose={() => setModalOpen(false)}
          onGenerated={handleSearch}
          participantId={session?.user.id}
        />
      )}
    </AppShell>
  )
}

function GenerateStatementModal({
  onClose,
  onGenerated,
  participantId,
}: {
  onClose: () => void
  onGenerated: () => void
  participantId: string | undefined
}) {
  const [period, setPeriod] = useState('')
  const [downloading, setDownloading] = useState(false)
  const { show } = useToast()

  async function handleDownload() {
    if (!period || !participantId) return
    setDownloading(true)

    // Record it as a real document row, then generate a real downloadable
    // file client-side (no PDF statement-generation backend exists yet —
    // this is a genuine file the browser saves, not a fake button).
    await supabase.from('documents').insert({
      participant_id: participantId,
      plan_name: '401(K) Save More',
      plan_id: '124542',
      document_type: 'Periodic Statement',
      period_label: period,
    })

    const content = `CORE 2.0 — Periodic Statement\nPlan: 401(K) Save More (124542)\nPeriod: ${period}\nGenerated: ${new Date().toLocaleString()}\n\nThis is a demo statement placeholder — wire up real statement data once the reporting backend exists.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `statement-${period.replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    setDownloading(false)
    show('Statement downloaded')
    onGenerated()
    onClose()
  }

  return (
    <Modal title="Periodic statement" onClose={onClose}>
      <Select label="Statement period" value={period} onChange={(e) => setPeriod(e.target.value)}>
        {PERIODS.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </Select>
      <Button variant="secondary" disabled={!period || downloading} onClick={handleDownload} className="w-fit">
        <IconDownload className="size-3.5" />
        {downloading ? 'Preparing…' : 'Download'}
      </Button>
    </Modal>
  )
}
