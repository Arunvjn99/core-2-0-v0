import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ErrorBoundary } from './ErrorBoundary.tsx'

const root = createRoot(document.getElementById('root')!)

// Check config BEFORE importing App — App transitively imports the Supabase
// client, which throws at module-load time if these are missing. That used
// to crash the whole render with nothing on screen (a blank white page,
// error only visible in devtools). Checking here means a misconfigured
// deploy (e.g. env vars not set on the host) shows an actual explanation
// instead.
const missing = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter((key) => !import.meta.env[key])

if (missing.length > 0) {
  root.render(
    <StrictMode>
      <ConfigError missing={missing} />
    </StrictMode>,
  )
} else {
  import('./App.tsx').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    )
  })
}

function ConfigError({ missing }: { missing: string[] }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100svh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: '-apple-system, system-ui, sans-serif',
        background: '#131417',
        color: '#f2f2f4',
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#e0a55c', margin: '0 0 8px' }}>
          CONFIGURATION ERROR
        </p>
        <h1 style={{ fontSize: 22, margin: '0 0 12px' }}>Missing environment variable{missing.length > 1 ? 's' : ''}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: '#c7c8cf', margin: '0 0 16px' }}>
          This deploy is missing{' '}
          {missing.map((key, i) => (
            <span key={key}>
              <code>{key}</code>
              {i < missing.length - 1 ? ' and ' : ''}
            </span>
          ))}
          . The app can't start without them — they're never committed to the repo (see{' '}
          <code>.env.example</code>), so every host needs them set explicitly.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: '#c7c8cf', margin: 0 }}>
          On Netlify: Site configuration → Environment variables → add both, then trigger a new deploy (a deploy
          started before the variables were added won't pick them up).
        </p>
      </div>
    </div>
  )
}
