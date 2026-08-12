import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { Button } from '../../ui-kit/primitives/Button'
import { TextField } from '../../ui-kit/primitives/TextField'
import { fetchClients, createClient, type Client } from '../lib/adminApi'

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  function load() {
    setLoading(true)
    fetchClients()
      .then(setClients)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)
    setError(null)
    try {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      await createClient(name.trim(), slug)
      setName('')
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create client')
    } finally {
      setCreating(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-semibold text-core-text">Clients</h1>
          <p className="text-[15px] text-core-text-muted">
            Each client is a white-label tenant — its own theme and module set, presented through the same
            participant portal.
          </p>
        </div>

        <div className="flex items-end gap-3 rounded-core-md bg-core-surface p-4 shadow-core-sm">
          <TextField label="New client name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp 401k" />
          <Button variant="cta" onClick={handleCreate} loading={creating} disabled={!name.trim()}>
            Create client
          </Button>
        </div>
        {error && <p className="text-[14px] text-core-critical">{error}</p>}

        {loading ? (
          <p className="text-core-text-muted">Loading…</p>
        ) : clients.length === 0 ? (
          <p className="rounded-core-md border border-dashed border-core-border p-6 text-center text-core-text-muted">
            No clients yet — create one above.
          </p>
        ) : (
          <div className="overflow-hidden rounded-core-md border border-core-border">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-core-border bg-core-surface-sunken text-core-text-muted">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-core-border last:border-0">
                    <td className="px-4 py-3 font-medium text-core-text">{c.name}</td>
                    <td className="px-4 py-3 text-core-text-muted">{c.slug}</td>
                    <td className="px-4 py-3 text-core-text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/theme?client=${c.id}`)}
                        className="text-[13px] font-semibold text-core-info"
                      >
                        Configure ›
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
