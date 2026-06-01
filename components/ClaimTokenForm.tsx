'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ClaimTokenForm() {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return

    setStatus('loading')
    const res = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim() }),
    })
    const data = await res.json()

    if (res.ok) {
      setStatus('success')
      setMessage(`✅ ${data.claimed} submission${data.claimed !== 1 ? 's' : ''} linked to your account.`)
      setToken('')
      router.refresh()
    } else {
      setStatus('error')
      setMessage(`❌ ${data.error}`)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-2">🔗 Claim anonymous submissions</h2>
      <p className="text-gray-400 text-sm mb-6">
        If you ran the script before creating an account, enter your token to link those submissions here.
        Your token is saved in <code className="text-green-400">~/.distroinstall_token</code>.
      </p>
      <form onSubmit={handleClaim} className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="anon_1234567890_abc123..."
          className="flex-1 min-w-0 bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-400"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !token.trim()}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {status === 'loading' ? 'Claiming...' : 'Claim'}
        </button>
      </form>
      {message && (
        <p className={`mt-3 text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
