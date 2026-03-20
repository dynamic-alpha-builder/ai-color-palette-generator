'use client'

import { Palette } from '@/lib/types'

interface HistoryStripProps {
  palette: Palette
  onSelect: (palette: Palette) => void
}

export default function HistoryStrip({ palette, onSelect }: HistoryStripProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(palette)}
      title={palette.prompt}
      aria-label={`Load palette: ${palette.prompt}`}
      className="flex flex-1 rounded-lg overflow-hidden h-8 hover:opacity-80 active:opacity-60 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-zinc-900"
    >
      {palette.colors.map((color, index) => (
        <span
          key={index}
          className="flex-1 h-full"
          style={{ backgroundColor: color.hex }}
          aria-hidden="true"
        />
      ))}
    </button>
  )
}
