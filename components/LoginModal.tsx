'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, Eye, EyeOff } from 'lucide-react'
import { Logo } from './Logo'

type Mode = 'login' | 'register' | 'check_email'

export function LoginModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'register') {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) { setError(data.error); return }
      setMode('check_email')
      return
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)
    if (result?.error === 'email_not_verified') {
      setError('Please verify your email before signing in. Check your inbox.')
    } else if (result?.error) {
      setError('Incorrect email or password')
    } else {
      onClose()
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-white/20 rounded-2xl p-8 w-full max-w-sm relative shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {mode === 'check_email' && (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-xl font-bold text-white mb-2">Revisa tu email</h2>
            <p className="text-gray-400 text-sm mb-2">
              Te hemos enviado un enlace de verificación a
            </p>
            <p className="text-purple-300 font-mono text-sm mb-6">{email}</p>
            <p className="text-gray-500 text-xs">
              El enlace expira en 24 horas. Una vez verificado, vuelve aquí para entrar.
            </p>
            <button
              onClick={() => setMode('login')}
              className="mt-6 text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              Volver al login →
            </button>
          </div>
        )}

        {mode !== 'check_email' && <>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <Logo size={36} />
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-2 mb-5">
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-gray-800 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors border border-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-500 text-xs">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-400"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          {mode === 'login' && (
            <p className="text-center">
              <Link
                href="/forgot-password"
                onClick={onClose}
                className="text-gray-400 hover:text-purple-300 text-xs transition-colors"
              >
                Forgot your password?
              </Link>
            </p>
          )}
        </form>

        <p className="text-center text-gray-500 text-xs mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
        </>}
      </div>
    </div>
  )
}
