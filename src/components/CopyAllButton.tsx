'use client'

import { useState } from 'react'
import { Color } from '@/lib/types'

interface CopyAllButtonProps {
  colors: Color[]
}

export default function CopyAllButton({ colors }: CopyAllButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyAll = async () => {
    const hexCodes = colors.map((c) => c.hex.toUpperCase()).join('\n')
    try {
      await navigator.clipboard.writeText(hexCodes)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = hexCodes
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopyAll}
      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors duration-150 border border-zinc-700 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/30"
      aria-label="Copy all hex codes"
    >
      {copied ? 'Copied!' : 'Copy All'}
    </button>
  )
}
