import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { TextField } from '../../ui-kit/primitives/TextField'
import { Button } from '../../ui-kit/primitives/Button'
import hero from '../../assets/login/hero.png'
import logo from '../../assets/login/logo.svg'
import wordmark from '../../assets/login/wordmark.svg'

/**
 * Figma: node 2893:53629 "Login with password" (canonical — rightmost of 4 variants).
 * Left brand panel (hero image, gradient, logo) is the default demo theme;
 * admin console will let this be swapped per client.
 */
export default function Login() {
  const { signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: signInError } = await signInWithPassword(email, password)
    setLoading(false)
    if (signInError) {
      setError(signInError)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-svh w-full bg-core-surface">
      {/* Brand panel */}
      <div className="hidden w-[638px] shrink-0 items-center justify-center p-[82px] lg:flex">
        <div className="relative flex h-[855px] w-full max-w-[474px] flex-col items-center justify-between overflow-hidden rounded-[17px] px-12 pb-11 pt-14 text-white">
          <img
            src={hero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(154deg, rgba(24,87,173,0.5) 99%, rgba(2,109,167,0.5) 115%), linear-gradient(178deg, rgb(0,78,168) 4%, rgba(59,107,198,0.99) 27%, rgba(45,86,191,0.2) 42%, rgba(33,36,62,0) 70%)',
            }}
            aria-hidden
          />
          <p className="relative z-10 self-start text-[52px] font-light leading-[1.1]">
            Retirement
            <br />
            <span className="font-bold">Simplified!</span>
          </p>
          <div className="relative z-10 flex w-full flex-col items-start gap-2">
            <img src={wordmark} alt="CORE" className="h-7" />
            <p className="text-xs font-medium">© Congruent Solutions, Inc. All Rights Reserved</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 shadow-[0_1px_10px_rgba(0,0,0,0.05),0_4px_5px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.12)] sm:px-16">
        <form onSubmit={handleSubmit} className="flex w-full max-w-[499px] flex-col items-end gap-16">
          <div className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col items-start gap-[124px]">
              <img src={logo} alt="" className="h-[45px]" />
              <h1 className="text-[31px] font-bold text-core-text">Login</h1>
            </div>

            <TextField
              label="Username"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-core-text-muted hover:text-core-text"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              }
            />

            {error && (
              <p role="alert" className="w-full text-[14px] text-core-critical">
                {error}
              </p>
            )}

            <div className="flex h-[19px] w-full items-center justify-between">
              <label className="flex items-center gap-2 text-[14px] font-medium text-core-text/80">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="size-4 appearance-none rounded-[4px] border border-core-border bg-core-surface checked:border-core-info checked:bg-[var(--core-color-info)]"
                />
                Keep me signed in
              </label>
              <a href="#forgot-password" className="text-[16px] font-semibold text-[#01607f]">
                Forgot Password?
              </a>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full !rounded-[4px] !py-[15px]">
            Login
          </Button>
        </form>

        <p className="mt-8 w-full max-w-[499px] text-[14px] text-core-text">
          Any Questions? Visit{' '}
          <a href="#help-center" className="font-semibold text-[#01607f] underline">
            Help Center
          </a>
        </p>
      </div>
    </div>
  )
}

function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 14 14 2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
