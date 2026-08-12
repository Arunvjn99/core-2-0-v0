import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { IconClose } from '../icons'

/**
 * Right-edge slide-in panel — matches the Figma prototype's overlay
 * pattern (e.g. the fund picker under Manual Investments), which slides
 * in over the page rather than replacing the panel content in place like
 * the first pass of this build did.
 */
export function SlideOver({
  open,
  title,
  onClose,
  children,
  width = 480,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  width?: number
}) {
  const reduce = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <motion.button
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative flex h-full flex-col bg-core-surface shadow-2xl"
            style={{ width, maxWidth: '100vw' }}
            initial={reduce ? { opacity: 0 } : { x: '100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-core-border px-6 py-4">
              <h2 className="text-[18px] font-semibold text-core-text">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="p-1 text-core-text-muted hover:text-core-text">
                <IconClose className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
