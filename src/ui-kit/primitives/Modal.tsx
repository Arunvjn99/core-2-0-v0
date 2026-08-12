import type { ReactNode } from 'react'
import { IconClose } from '../icons'

export function Modal({
  title,
  onClose,
  children,
  width = 400,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  width?: number
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex w-full flex-col gap-5 rounded-core-md bg-core-surface p-6 shadow-2xl"
        style={{ maxWidth: width }}
      >
        <div className="flex items-center justify-between border-b border-core-border pb-4">
          <h2 className="text-[18px] font-semibold text-core-text">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 text-core-text-muted hover:text-core-text">
            <IconClose className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
