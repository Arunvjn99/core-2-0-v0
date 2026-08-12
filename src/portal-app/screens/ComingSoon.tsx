import { AppShell } from '../../ui-kit/patterns/AppShell'

/** Placeholder for flows not yet built out — see task list for build order. */
export default function ComingSoon({ title }: { title: string }) {
  return (
    <AppShell>
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-core-text">{title}</p>
        <p className="text-core-text-muted">This screen is next up in the build queue.</p>
      </div>
    </AppShell>
  )
}
