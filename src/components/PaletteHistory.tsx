'use client'

import { Palette } from '@/lib/types'
import HistoryStrip from './HistoryStrip'

interface PaletteHistoryProps {
  history: Palette[]
  onSelect: (palette: Palette) => void
}

export default function PaletteHistory({ history, onSelect }: PaletteHistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="w-full mt-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
        Recent Palettes
      </p>
      <div className="flex flex-col gap-2">
        {history.map((palette) => (
          <HistoryStrip key={palette.id} palette={palette} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
