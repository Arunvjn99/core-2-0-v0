// Minimal inline icon set (stand-in for Font Awesome used in Figma).
// Swap for a licensed icon set before ship; kept as simple stroke SVGs so
// they inherit currentColor and need no external font/CDN.
type IconProps = { className?: string }

export const IconGrid = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
    <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
  </svg>
)
export const IconEnrollment = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
    <rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5 5.5h6M5 8h6M5 10.5h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)
export const IconProfile = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
    <circle cx="8" cy="5.2" r="2.7" stroke="currentColor" strokeWidth="1.3" />
    <path d="M2.5 14c.9-3 3-4.4 5.5-4.4S13.1 11 14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)
export const IconTransaction = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
    <path d="M2 6h10.5L10 3.5M14 10H3.5L6 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconStatements = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
    <path d="M4 1.5h6l2.5 2.5V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5.5 7.5h5M5.5 10h5M5.5 5h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)
export const IconInvestment = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 4.5v7M6 6.3c0-.9.9-1.5 2-1.5s2 .6 2 1.4c0 2-4 1.1-4 3 0 .9.9 1.5 2 1.5s2-.6 2-1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)
export const IconBell = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
    <path d="M4 11.5V7a4 4 0 0 1 8 0v4.5l1 1.5H3l1-1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M6.5 14a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
export const IconGear = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
    <circle cx="8" cy="8" r="2.3" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M8 1.5v1.4M8 13.1v1.4M14.5 8h-1.4M2.9 8H1.5M12.4 3.6l-1 1M4.6 11.4l-1 1M12.4 12.4l-1-1M4.6 4.6l-1-1"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
)
export const IconChevronRight = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
    <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const IconSparkles = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
    <path d="M4 1.5 4.9 4 7.5 4.8 4.9 5.7 4 8.2 3.2 5.7.5 4.8 3.2 4 4 1.5ZM11.5 6 12.6 9.2 15.8 10.3 12.6 11.4 11.5 14.6 10.4 11.4 7.3 10.3 10.4 9.2 11.5 6Z" />
  </svg>
)
export const IconInfo = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
    <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 7.2v4M8 5.2v.02" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)
