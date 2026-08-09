'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function confirmSignIn() {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn')
        if (!email) {
          email = window.prompt('Please enter your email for confirmation:')
        }
        if (!email) {
          setError('Email is required to confirm sign in.')
          return
        }

        try {
          await signInWithEmailLink(auth, email, window.location.href)
          window.localStorage.removeItem('emailForSignIn')
          router.push('/')
          router.refresh()
        } catch (err: any) {
          console.error('Firebase sign in link error:', err)
          setError(err.message || 'Failed to complete sign in link authentication.')
        }
      } else {
        router.push('/auth/login')
      }
    }

    confirmSignIn()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-xs text-signal-red uppercase tracking-widest font-semibold mb-3">Error</p>
          <h1 className="font-heading text-lg font-bold text-ink-primary mb-2">
            Sign-in failed
          </h1>
          <p className="text-sm text-ink-muted mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-sm text-gold hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <div className="text-center">
        <span className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin inline-block mb-4" />
        <p className="text-sm text-ink-secondary">Completing secure sign-in...</p>
      </div>
    </div>
  )
}
