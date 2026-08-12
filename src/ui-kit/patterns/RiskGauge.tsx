import { motion, useReducedMotion } from 'framer-motion'

/**
 * Semi-circle risk gauge. Figma used an SVG arc + rotated needle group;
 * reproduced here with conic-gradient + a rotated needle div so it stays
 * themeable (no baked colors) and scales cleanly. Needle sweeps in from
 * zero on mount rather than snapping straight to its value.
 */
const LEVELS = ['Conservative', 'Moderate Conservative', 'Moderate', 'Moderate Aggressive', 'Aggressive'] as const
export type RiskLevel = (typeof LEVELS)[number]

export function RiskGauge({ level }: { level: RiskLevel }) {
  const reduce = useReducedMotion()
  const index = LEVELS.indexOf(level)
  const angle = -90 + (index / (LEVELS.length - 1)) * 180 // -90deg..+90deg across the semicircle

  return (
    <div className="relative flex h-[75px] w-[150px] items-end justify-center overflow-hidden">
      <div
        className="absolute inset-0 rounded-t-full"
        style={{
          background:
            'conic-gradient(from 270deg at 50% 100%, #2f7a4d 0deg, #7fbf5a 45deg, #e8c547 90deg, #e0a55c 135deg, #b3261e 180deg)',
          WebkitMaskImage:
            'radial-gradient(circle at 50% 100%, transparent 55%, black 56%, black 100%, transparent 100%)',
          maskImage:
            'radial-gradient(circle at 50% 100%, transparent 55%, black 56%, black 100%, transparent 100%)',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-[62px] w-[3px] origin-bottom rounded-full bg-core-text"
        style={{ x: '-50%' }}
        initial={reduce ? { rotate: angle } : { rotate: -90 }}
        animate={{ rotate: angle }}
        transition={{ type: 'spring', stiffness: 90, damping: 12, delay: 0.1 }}
      />
      <div className="absolute bottom-[-4px] left-1/2 size-3 -translate-x-1/2 rounded-full bg-core-text" />
    </div>
  )
}

export const RISK_LEVELS = LEVELS
