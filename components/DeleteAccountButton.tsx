'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Trash2 } from 'lucide-react'

export function DeleteAccountButton() {
  const [step, setStep] = useState<'idle' | 'confirm' | 'loading'>('idle')
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  async function handleDelete() {
    if (input !== 'DELETE') {
      setError('Type DELETE in capital letters to confirm')
      return
    }
    setStep('loading')
    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    if (res.ok) {
      await signOut({ callbackUrl: '/' })
    } else {
      setStep('confirm')
      setError('Something went wrong. Try again.')
    }
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('confirm')}
        className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
      >
        <Trash2 size={15} />
        Delete my account
      </button>
    )
  }

  return (
    <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-5 space-y-3">
      <p className="text-red-300 font-semibold text-sm">Delete account permanently?</p>
      <p className="text-gray-400 text-xs">
        This will delete your account and all your submissions. This cannot be undone.
      </p>
      <input
        type="text"
        placeholder='Type "DELETE" to confirm'
        value={input}
        onChange={e => { setInput(e.target.value); setError('') }}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-400 font-mono"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={step === 'loading'}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {step === 'loading' ? 'Deleting…' : 'Delete permanently'}
        </button>
        <button
          onClick={() => { setStep('idle'); setInput(''); setError('') }}
          className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
