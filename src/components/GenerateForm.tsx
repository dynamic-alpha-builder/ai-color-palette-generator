'use client'

import { useState, FormEvent } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface GenerateFormProps {
  onGenerate: (prompt: string) => Promise<void>
  isLoading: boolean
}

export default function GenerateForm({ onGenerate, isLoading }: GenerateFormProps) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return
    await onGenerate(prompt.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
      <div className="relative">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a mood, theme, or concept…"
          maxLength={500}
          disabled={isLoading}
          aria-label="Color palette prompt"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {prompt.length > 400 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
            {prompt.length}/500
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:ring-offset-2 focus:ring-offset-zinc-950 shadow-lg shadow-violet-900/30"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span>Generating…</span>
          </>
        ) : (
          <span>Generate Palette</span>
        )}
      </button>
    </form>
  )
}
