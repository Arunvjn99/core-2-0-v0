import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { Select } from '../../ui-kit/primitives/Select'
import { Button } from '../../ui-kit/primitives/Button'
import { fetchClients, fetchTheme, saveTheme, type Client, type ClientTheme } from '../lib/adminApi'
import { useToast } from '../../ui-kit/lib/ToastContext'

const EDITABLE_TOKENS: { key: string; label: string; fallback: string }[] = [
  { key: 'core-color-primary', label: 'Primary brand color', fallback: '#2f5d50' },
  { key: 'core-color-info', label: 'Accent / link color', fallback: '#2563a8' },
  { key: 'core-color-bg', label: 'Page background', fallback: '#f2f4f6' },
  { key: 'core-color-surface', label: 'Card / surface background', fallback: '#ffffff' },
]

export default function ThemeEditor() {
  const [params, setParams] = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState(params.get('client') ?? '')
  const [theme, setTheme] = useState<ClientTheme | null>(null)
  const [tokens, setTokens] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const { show } = useToast()

  useEffect(() => {
    fetchClients().then((list) => {
      setClients(list)
      if (!clientId && list[0]) setClientId(list[0].id)
    })
  }, [])

  useEffect(() => {
    if (!clientId) return
    setParams({ client: clientId })
    fetchTheme(clientId).then((t) => {
      setTheme(t)
      setTokens(t?.tokens ?? {})
    })
  }, [clientId])

  async function handleSave() {
    if (!theme) return
    setSaving(true)
    try {
      await saveTheme(theme.id, tokens)
      show('Theme saved — live for this client now')
    } finally {
      setSaving(false)
    }
  }

  const preview = (key: string) => tokens[key] ?? EDITABLE_TOKENS.find((t) => t.key === key)?.fallback ?? '#000000'

  return (
    <AdminLayout>
      <div className="flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-semibold text-core-text">Theming</h1>
          <p className="text-[15px] text-core-text-muted">
            Colors write directly to the CSS variables the participant portal reads at runtime — no rebuild
            needed.
          </p>
        </div>

        <div className="w-64">
          <Select label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {!theme ? (
          <p className="text-core-text-muted">{clientId ? 'Loading…' : 'Create a client first.'}</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-4 rounded-core-md bg-core-surface p-5 shadow-core-sm">
              {EDITABLE_TOKENS.map((t) => (
                <div key={t.key} className="flex items-center justify-between gap-4">
                  <label className="text-[14px] font-medium text-core-text">{t.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={preview(t.key)}
                      onChange={(e) => setTokens((prev) => ({ ...prev, [t.key]: e.target.value }))}
                      className="size-8 cursor-pointer rounded border border-core-border bg-transparent"
                    />
                    <input
                      type="text"
                      value={preview(t.key)}
                      onChange={(e) => setTokens((prev) => ({ ...prev, [t.key]: e.target.value }))}
                      className="w-24 rounded border border-core-border bg-core-bg px-2 py-1 text-[13px] text-core-text"
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <Button variant="cta" onClick={handleSave} loading={saving}>
                  Save theme
                </Button>
              </div>
            </div>

            {/* Live preview */}
            <div className="rounded-core-md border border-core-border-strong p-4">
              <p className="mb-3 text-[13px] font-semibold text-core-text-muted">Live preview</p>
              <div
                className="flex flex-col gap-3 rounded-[10px] p-4"
                style={{ backgroundColor: preview('core-color-bg') }}
              >
                <div className="rounded-[8px] p-3 shadow-sm" style={{ backgroundColor: preview('core-color-surface') }}>
                  <p className="text-[13px] font-semibold" style={{ color: preview('core-color-primary') }}>
                    Hello, Participant!
                  </p>
                  <p className="text-[12px] text-core-text-muted">How have you been?</p>
                  <button
                    className="mt-3 rounded-[4px] px-3 py-1.5 text-[12px] font-semibold text-white"
                    style={{ backgroundColor: preview('core-color-info') }}
                  >
                    Enroll
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
