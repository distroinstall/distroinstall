'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setMessage('')

    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })
    const data = await res.json()

    if (res.ok) {
      setStatus('sent')
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

        {status === 'sent' ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-300 mb-3">
              <Mail size={26} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-gray-400 text-sm mb-8">
              If an account exists for <span className="text-gray-300">{email.trim()}</span>, you&apos;ll
              get a reset link shortly. It expires in 1 hour.
            </p>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Forgot password?</h2>
            <p className="text-gray-400 text-sm mb-8 text-center">
              Enter your email and we&apos;ll send you a link to reset it.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="w-full px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {status === 'loading' ? 'Sending…' : 'Send reset link'}
              </button>
              {message && <p className="text-red-400 text-sm text-center">{message}</p>}
            </form>

            <p className="text-center mt-6">
              <Link href="/login" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                ← Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
