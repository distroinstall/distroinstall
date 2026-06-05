'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`inline-flex items-center gap-1.5 transition-colors ${className}`}
    >
      {copied
        ? <Check size={14} className="text-green-400" />
        : <Copy size={14} className="text-gray-400 hover:text-white" />
      }
      {copied && <span className="text-green-400 text-xs">Copied!</span>}
    </button>
  )
}

export function CopyBlock({ text, display }: { text: string; display?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      title="Click to copy"
      className="group relative w-full text-left bg-black/50 p-4 rounded-lg cursor-pointer hover:bg-black/70 transition-colors"
    >
      <code className="text-green-400 text-sm break-all">{display ?? text}</code>
      <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {copied
          ? <Check size={14} className="text-green-400" />
          : <Copy size={14} className="text-gray-500" />
        }
      </span>
      {copied && (
        <span className="absolute top-2 right-6 text-green-400 text-xs">Copied!</span>
      )}
    </button>
  )
}
