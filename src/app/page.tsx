'use client'

import { useEffect } from 'react'
import { usePalettes } from '@/hooks/usePalettes'
import GenerateForm from '@/components/GenerateForm'
import ColorPalette from '@/components/ColorPalette'
import PaletteHistory from '@/components/PaletteHistory'

export default function Home() {
  const {
    currentPalette,
    history,
    isLoading,
    error,
    generate,
    selectFromHistory,
    fetchHistory,
  } = usePalettes()

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return (
    <main className="min-h-screen bg-zinc-950 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            AI Color Palette Generator
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
            Describe a mood, theme, or concept and get a harmonious 5-color palette crafted by AI.
          </p>
        </div>

        {/* Generate Form */}
        <GenerateForm onGenerate={generate} isLoading={isLoading} />

        {/* Error Display */}
        {error && (
          <div
            role="alert"
            className="mt-4 px-4 py-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-sm"
          >
            {error}
          </div>
        )}

        {/* Current Palette */}
        {currentPalette && (
          <div className="mt-8">
            <ColorPalette palette={currentPalette} />
          </div>
        )}

        {/* Palette History */}
        <PaletteHistory history={history} onSelect={selectFromHistory} />
      </div>
    </main>
  )
}
