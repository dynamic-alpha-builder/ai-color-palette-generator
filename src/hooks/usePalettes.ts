'use client'

import { useState, useCallback } from 'react'
import axios from 'axios'
import { Palette } from '@/lib/types'

interface UsePalettesReturn {
  currentPalette: Palette | null
  history: Palette[]
  isLoading: boolean
  error: string | null
  generate: (prompt: string) => Promise<void>
  selectFromHistory: (palette: Palette) => void
  fetchHistory: () => Promise<void>
}

export function usePalettes(): UsePalettesReturn {
  const [currentPalette, setCurrentPalette] = useState<Palette | null>(null)
  const [history, setHistory] = useState<Palette[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get<{ palettes: Palette[] }>('/api/palettes')
      setHistory(response.data.palettes)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Failed to fetch history:', err.response?.data?.error ?? err.message)
      } else {
        console.error('Failed to fetch history:', err)
      }
    }
  }, [])

  const generate = useCallback(
    async (prompt: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.post<Palette>('/api/generate', { prompt })
        setCurrentPalette(response.data)
        await fetchHistory()
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message =
            err.response?.data?.error ??
            err.message ??
            'Failed to generate palette. Please try again.'
          setError(message)
        } else {
          setError('An unexpected error occurred. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [fetchHistory]
  )

  const selectFromHistory = useCallback((palette: Palette) => {
    setCurrentPalette(palette)
    setError(null)
  }, [])

  return {
    currentPalette,
    history,
    isLoading,
    error,
    generate,
    selectFromHistory,
    fetchHistory,
  }
}
