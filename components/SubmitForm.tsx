'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Info } from 'lucide-react'

const USAGE_OPTIONS = [
  { value: 'desktop', label: 'Desktop / Personal' },
  { value: 'programming', label: 'Programming / Development' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'server', label: 'Server' },
  { value: 'other', label: 'Other' },
]

const inputCls =
  'w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-400'

type Result = {
  token: string
  linked_to_account: boolean
  unchanged?: boolean
}

export function SubmitForm({
  initialToken = '',
  accountName = '',
}: {
  initialToken?: string
  accountName?: string
}) {
  const [form, setForm] = useState({
    distro_name: '',
    distro_version: '',
    kernel: '',
    desktop_environment: '',
    cpu: '',
    cpu_cores: '',
    cpu_threads: '',
    ram_gb: '',
    gpu: '',
  })
  const [isVirtual, setIsVirtual] = useState(false)
  const [usageType, setUsageType] = useState('desktop')
  const [token, setToken] = useState(initialToken)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.distro_name.trim()) return
    setStatus('submitting')
    setError('')

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_info: {
            distro_name: form.distro_name,
            distro_version: form.distro_version,
            kernel: form.kernel,
            desktop_environment: form.desktop_environment,
            cpu: form.cpu,
            cpu_cores: form.cpu_cores ? Number(form.cpu_cores) : 0,
            cpu_threads: form.cpu_threads ? Number(form.cpu_threads) : 0,
            ram_gb: form.ram_gb ? Number(form.ram_gb) : 0,
            gpu: form.gpu,
          },
          is_virtual: isVirtual,
          usage_type: usageType,
          token: token.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus('success')
        setResult({
          token: data.token,
          linked_to_account: data.linked_to_account,
          unchanged: data.unchanged,
        })
      } else {
        setStatus('error')
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setError('Network error. Please try again.')
    }
  }

  if (status === 'success' && result) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 text-green-400 mb-4">
          <CheckCircle size={28} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {result.unchanged ? 'Already up to date' : 'Submitted!'}
        </h2>
        {result.unchanged && (
          <p className="text-gray-400 text-sm mb-4">
            This matches your last submission, so we just refreshed its timestamp instead of
            adding a duplicate.
          </p>
        )}

        {result.linked_to_account ? (
          <>
            <p className="text-gray-300 mb-6">
              Your setup was added and linked to your account.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors"
            >
              Go to your dashboard
            </Link>
          </>
        ) : (
          <>
            <p className="text-gray-300 mb-4">Thanks for contributing! Here is your public profile:</p>
            <Link
              href={`/u/${result.token}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors mb-6"
            >
              View your profile
            </Link>
            <div className="bg-black/30 border border-white/10 rounded-lg p-4 text-left max-w-md mx-auto">
              <p className="text-gray-400 text-xs mb-1">Your token (save it to keep a history):</p>
              <code className="text-green-400 text-sm break-all">{result.token}</code>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {accountName && (
        <div className="flex items-start gap-2.5 bg-purple-500/10 border border-purple-400/30 rounded-lg p-3 text-sm text-purple-200">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span>Submitting as <strong>{accountName}</strong> — this will link to your account.</span>
        </div>
      )}

      <div>
        <label htmlFor="distro_name" className="block text-sm font-medium text-gray-300 mb-2">
          Distribution <span className="text-red-400">*</span>
        </label>
        <input
          id="distro_name"
          type="text"
          required
          value={form.distro_name}
          onChange={set('distro_name')}
          maxLength={60}
          placeholder="e.g. Ubuntu, Arch Linux, Fedora Linux"
          className={inputCls}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="distro_version" className="block text-sm font-medium text-gray-300 mb-2">
            Version
          </label>
          <input id="distro_version" type="text" value={form.distro_version} onChange={set('distro_version')} maxLength={40} placeholder="e.g. 24.04, rolling" className={inputCls} />
        </div>
        <div>
          <label htmlFor="kernel" className="block text-sm font-medium text-gray-300 mb-2">
            Kernel
          </label>
          <input id="kernel" type="text" value={form.kernel} onChange={set('kernel')} maxLength={60} placeholder="uname -r, e.g. 6.8.0-51-generic" className={inputCls} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="desktop_environment" className="block text-sm font-medium text-gray-300 mb-2">
            Desktop environment
          </label>
          <input id="desktop_environment" type="text" value={form.desktop_environment} onChange={set('desktop_environment')} maxLength={40} placeholder="e.g. GNOME, KDE Plasma" className={inputCls} />
        </div>
        <div>
          <label htmlFor="gpu" className="block text-sm font-medium text-gray-300 mb-2">
            GPU
          </label>
          <input id="gpu" type="text" value={form.gpu} onChange={set('gpu')} maxLength={120} placeholder="e.g. Radeon RX 7800 XT" className={inputCls} />
        </div>
      </div>

      <div>
        <label htmlFor="cpu" className="block text-sm font-medium text-gray-300 mb-2">
          CPU
        </label>
        <input id="cpu" type="text" value={form.cpu} onChange={set('cpu')} maxLength={120} placeholder="e.g. AMD Ryzen 7 7700X" className={inputCls} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="cpu_cores" className="block text-sm font-medium text-gray-300 mb-2">
            Cores
          </label>
          <input id="cpu_cores" type="number" min={0} max={1024} value={form.cpu_cores} onChange={set('cpu_cores')} placeholder="8" className={inputCls} />
        </div>
        <div>
          <label htmlFor="cpu_threads" className="block text-sm font-medium text-gray-300 mb-2">
            Threads
          </label>
          <input id="cpu_threads" type="number" min={0} max={4096} value={form.cpu_threads} onChange={set('cpu_threads')} placeholder="16" className={inputCls} />
        </div>
        <div>
          <label htmlFor="ram_gb" className="block text-sm font-medium text-gray-300 mb-2">
            RAM (GB)
          </label>
          <input id="ram_gb" type="number" min={0} max={8192} step="0.1" value={form.ram_gb} onChange={set('ram_gb')} placeholder="32" className={inputCls} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="usage_type" className="block text-sm font-medium text-gray-300 mb-2">
            Usage type
          </label>
          <select id="usage_type" value={usageType} onChange={e => setUsageType(e.target.value)} className={inputCls}>
            {USAGE_OPTIONS.map(o => (
              <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-3 cursor-pointer py-2.5">
          <input type="checkbox" checked={isVirtual} onChange={e => setIsVirtual(e.target.checked)} className="w-4 h-4 accent-purple-500" />
          <span className="text-sm text-gray-300">This is a virtual machine</span>
        </label>
      </div>

      {!accountName && (
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
            Token <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input id="token" type="text" value={token} onChange={e => setToken(e.target.value)} maxLength={80} placeholder="Paste a token to keep a history, or leave empty for anonymous" className={inputCls} />
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={status === 'submitting' || !form.distro_name.trim()}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit my setup'}
        </button>
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </form>
  )
}
