import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { Select } from '../../ui-kit/primitives/Select'
import { fetchClients, fetchModuleConfig, setModuleEnabled, MODULES, type Client, type ModuleConfigRow } from '../lib/adminApi'

export default function ModuleToggles() {
  const [params, setParams] = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState(params.get('client') ?? '')
  const [rows, setRows] = useState<ModuleConfigRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients().then((list) => {
      setClients(list)
      if (!clientId && list[0]) setClientId(list[0].id)
    })
  }, [])

  useEffect(() => {
    if (!clientId) return
    setParams({ client: clientId })
    setLoading(true)
    fetchModuleConfig(clientId)
      .then(setRows)
      .finally(() => setLoading(false))
  }, [clientId])

  async function toggle(row: ModuleConfigRow) {
    const next = !row.enabled
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, enabled: next } : r)))
    await setModuleEnabled(row.id, next)
  }

  return (
    <AdminLayout>
      <div className="flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-semibold text-core-text">Modules</h1>
          <p className="text-[15px] text-core-text-muted">
            Turn portal sections off for clients that don't offer them — hidden modules disappear from the
            sidebar immediately, no rebuild.
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

        {loading ? (
          <p className="text-core-text-muted">Loading…</p>
        ) : (
          <div className="flex flex-col divide-y divide-core-border rounded-core-md border border-core-border bg-core-surface">
            {MODULES.map((m) => {
              const row = rows.find((r) => r.module_key === m.key)
              const enabled = row?.enabled ?? true
              return (
                <div key={m.key} className="flex items-center justify-between p-4">
                  <p className="text-[15px] font-medium text-core-text">{m.label}</p>
                  <button
                    role="switch"
                    aria-checked={enabled}
                    disabled={!row}
                    onClick={() => row && toggle(row)}
                    className={`relative h-[24px] w-[44px] rounded-full transition-colors disabled:opacity-40 ${
                      enabled ? 'bg-core-info' : 'bg-core-border-strong'
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] size-[18px] rounded-full bg-white transition-all ${
                        enabled ? 'left-[23px]' : 'left-[3px]'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
