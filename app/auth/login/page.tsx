'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail
} from 'firebase/auth'
import { Button }   from '@/components/ui/Button'
import { Input }    from '@/components/ui/Input'

type Mode = 'magic-link' | 'password'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode]         = useState<Mode>('password') // default to password for easier local testing
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage]   = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function clearMessage() { setMessage(null) }

  async function handleMagicLink() {
    startTransition(async () => {
      clearMessage()
      if (!email.trim()) {
        setMessage({ type: 'error', text: 'Enter your email address.' })
        return
      }

      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/auth/callback`,
          handleCodeInApp: true,
        }
        await sendSignInLinkToEmail(auth, email.trim(), actionCodeSettings)
        window.localStorage.setItem('emailForSignIn', email.trim())
        setMessage({ type: 'success', text: `Check ${email} for a sign-in link.` })
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Failed to send sign-in link' })
      }
    })
  }

  async function handlePassword() {
    startTransition(async () => {
      clearMessage()
      if (!email.trim() || !password) {
        setMessage({ type: 'error', text: 'Enter your email and password.' })
        return
      }
      try {
        if (isSignUp) {
          await createUserWithEmailAndPassword(auth, email.trim(), password)
          setMessage({ type: 'success', text: 'Account created successfully. Redirecting...' })
          setTimeout(() => {
            router.push('/')
            router.refresh()
          }, 1500)
        } else {
          await signInWithEmailAndPassword(auth, email.trim(), password)
          router.push('/')
          router.refresh()
        }
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Authentication failed' })
      }
    })
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border border-gold-border bg-gold-subtle text-gold font-heading font-bold text-lg mb-4">
            DJ
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink-primary">
            Decision <span className="font-serif italic font-normal text-gold">Journal</span>
          </h1>
          <p className="text-sm text-ink-muted mt-2">
            Track what you predicted. Learn from what happened.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-app-surface border border-border rounded-2xl p-6 flex flex-col gap-5">

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-border p-1 gap-1">
            {([['magic-link', 'Email link'], ['password', 'Password']] as [Mode, string][]).map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); clearMessage() }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === m
                    ? 'bg-gold-subtle text-gold border border-gold-border'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />

          {mode === 'password' && (
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          )}

          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'bg-signal-green/10 border border-signal-green/30 text-signal-green'
                  : 'bg-signal-red/10 border border-signal-red/30 text-signal-red'
              }`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <Button
            onClick={mode === 'magic-link' ? handleMagicLink : handlePassword}
            loading={isPending}
            className="w-full"
            size="lg"
          >
            {mode === 'magic-link'
              ? 'Send sign-in link'
              : isSignUp
                ? 'Create account'
                : 'Sign in'
            }
          </Button>

          {mode === 'password' && (
            <button
              onClick={() => { setIsSignUp(s => !s); clearMessage() }}
              className="text-xs text-ink-muted hover:text-ink-primary transition-colors text-center cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-ink-muted mt-6 leading-relaxed">
          Your decisions are private and only visible to you.
        </p>
      </div>
    </div>
  )
}
