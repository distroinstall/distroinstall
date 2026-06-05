'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Logo } from '@/components/Logo'

function ResetContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setStatus('error')
      setMessage('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setStatus('error')
      setMessage('Passwords do not match.')
      return
    }

    setStatus('loading')
    setMessage('')
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()

    if (res.ok) {
      setStatus('success')
      setTimeout(() => router.push('/login'), 2000)
    } else {
      setStatus('error')
      setMessage(data.error ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20 w-full max-w-sm">
        <div className="flex justify-center mb-3">
          <Logo size={44} />
        </div>

        {!token ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Invalid link</h2>
            <p className="text-gray-400 text-sm mb-8">
              This password reset link is missing its token. Request a new one.
            </p>
            <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
              Request a new link
            </Link>
          </div>
        ) : status === 'success' ? (
          <div className="text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">Password updated</h2>
            <p className="text-gray-400 text-sm mb-8">
              You can now sign in with your new password. Redirecting…
            </p>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Set a new password</h2>
            <p className="text-gray-400 text-sm mb-8 text-center">
              Choose a password you don&apos;t use anywhere else.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  required
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 pr-10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <input
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {status === 'loading' ? 'Updating…' : 'Update password'}
              </button>
              {message && <p className="text-red-400 text-sm text-center">{message}</p>}
            </form>
          </>
        )}
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetContent />
    </Suspense>
  )
}
