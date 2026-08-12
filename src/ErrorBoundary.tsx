import { Component, type ReactNode } from 'react'

type State = { error: Error | null }

/**
 * Last-resort catch-all: without this, any uncaught error during render
 * anywhere in the tree unmounts React entirely and leaves a blank white
 * page (this is exactly what happened on the Netlify deploy — a
 * module-load-time throw from a misconfigured Supabase client). This won't
 * catch that specific case (see main.tsx's pre-check for why), but it
 * catches everything else the same way: a screen with text on it, not a
 * blank one.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Uncaught render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-svh items-center justify-center bg-core-bg p-6">
          <div className="max-w-md text-center">
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-core-critical">
              Something went wrong
            </p>
            <p className="mb-4 text-[15px] text-core-text-muted">{this.state.error.message}</p>
            <button
              onClick={() => location.reload()}
              className="rounded-core-sm border border-core-border px-4 py-2 text-[14px] font-medium text-core-text"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
