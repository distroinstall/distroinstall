'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function SettingsForm({
  initialName,
  initialUsername,
}: {
  initialName: string
  initialUsername: string
}) {
  const router = useRouter()
  const { update } = useSession()

  const [name, setName] = useState(initialName)
  const [username, setUsername] = useState(initialUsername)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const dirty = name.trim() !== initialName || username.trim() !== initialUsername

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    setMessage('')

    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), username: username.trim() }),
    })
    const data = await res.json()

    if (res.ok) {
      setStatus('success')
      setMessage('✅ Changes saved')
      // Refresh the JWT so the new name shows in the navbar immediately.
      await update({ name: data.user.name })
      router.refresh()
    } else {
      setStatus('error')
      setMessage(`❌ ${data.error}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
          Display name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={40}
          placeholder="Your name"
          className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-400"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
          Username <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          maxLength={20}
          placeholder="e.g. tux_lover"
          className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-400"
        />
        <p className="text-gray-500 text-xs mt-2">
          3–20 characters: letters, numbers, hyphen or underscore. Leave empty to clear.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'saving' || !dirty}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
        {message && (
          <span className={`text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </span>
        )}
      </div>
    </form>
  )
}
