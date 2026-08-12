// Font Awesome Free icon set — matches the Figma spec (Font Awesome 6 Pro
// Solid) as closely as the free tier allows. A couple of Pro-only glyphs
// (grid-2, usd-square, address-book) are swapped for the nearest free
// equivalent (table-cells, sack-dollar, id-card) — swap back if a Pro
// license gets added later.
import { FontAwesomeIcon, type FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import {
  faTableCells,
  faIdCard,
  faUser,
  faRightLeft,
  faFileLines,
  faSackDollar,
  faBell,
  faGear,
  faChevronRight,
  faWandMagicSparkles,
  faCircleInfo,
  faEye,
  faEyeSlash,
  faSun,
  faMoon,
  faDesktop,
  faBars,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

type IconProps = { className?: string }
const wrap = (icon: FontAwesomeIconProps['icon']) => {
  function Icon({ className }: IconProps) {
    return <FontAwesomeIcon icon={icon} className={className} />
  }
  return Icon
}

export const IconGrid = wrap(faTableCells)
export const IconEnrollment = wrap(faFileLines)
export const IconProfile = wrap(faUser)
export const IconTransaction = wrap(faRightLeft)
export const IconStatements = wrap(faIdCard)
export const IconInvestment = wrap(faSackDollar)
export const IconBell = wrap(faBell)
export const IconGear = wrap(faGear)
export const IconChevronRight = wrap(faChevronRight)
export const IconSparkles = wrap(faWandMagicSparkles)
export const IconInfo = wrap(faCircleInfo)
export const IconEye = wrap(faEye)
export const IconEyeOff = wrap(faEyeSlash)
export const IconSun = wrap(faSun)
export const IconMoon = wrap(faMoon)
export const IconDesktop = wrap(faDesktop)
export const IconMenu = wrap(faBars)
export const IconClose = wrap(faXmark)
