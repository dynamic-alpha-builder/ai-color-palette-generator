'use client'

import { Palette } from '@/lib/types'
import ColorBar from './ColorBar'
import CopyAllButton from './CopyAllButton'

interface ColorPaletteProps {
  palette: Palette
}

export default function ColorPalette({ palette }: ColorPaletteProps) {
  return (
    <div className="w-full animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-zinc-400 truncate mr-4">
          <span className="text-zinc-500">Palette for: </span>
          <span className="text-zinc-300 font-medium">{palette.prompt}</span>
        </p>
        <CopyAllButton colors={palette.colors} />
      </div>
      <div className="flex flex-col gap-2">
        {palette.colors.map((color, index) => (
          <ColorBar key={`${palette.id}-${index}`} color={color} />
        ))}
      </div>
    </div>
  )
}
