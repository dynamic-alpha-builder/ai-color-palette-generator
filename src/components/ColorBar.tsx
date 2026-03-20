'use client'

import { useState } from 'react'
import { Color } from '@/lib/types'

interface ColorBarProps {
  color: Color
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function getTextColor(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#ffffff'
  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > 0.179 ? '#111111' : '#ffffff'
}

export default function ColorBar({ color }: ColorBarProps) {
  const [copied, setCopied] = useState(false)

  const textColor = getTextColor(color.hex)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(color.hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea')
      el.value = color.hex
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
      onClick={handleCopy}
      className="w-full rounded-xl transition-all duration-150 hover:brightness-90 active:brightness-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-white/50"
      style={{ backgroundColor: color.hex }}
      aria-label={`Copy hex code ${color.hex} for ${color.name}`}
    >
      <div className="flex flex-col justify-center h-20 px-5 py-3">
        <div className="flex items-center justify-between">
          <span
            className="font-semibold text-base tracking-wide truncate mr-4"
            style={{ color: textColor }}
          >
            {color.name}
          </span>
          <span
            className="font-mono text-sm font-medium shrink-0"
            style={{ color: textColor }}
          >
            {copied ? 'Copied!' : color.hex.toUpperCase()}
          </span>
        </div>
        <p
          className="text-xs mt-1 text-left opacity-80 line-clamp-1"
          style={{ color: textColor }}
        >
          {color.description}
        </p>
      </div>
    </button>
  )
}
