import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ContentBlock } from '@anthropic-ai/sdk/resources/messages/messages'
import { supabase } from '@/lib/supabase'
import { Color } from '@/lib/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are a color palette expert. The user will give you a mood or concept. Respond with ONLY a JSON array of exactly 5 color objects. No markdown, no explanation, no code fences — just the raw JSON array. Each object must have exactly these keys: "name" (a creative color name), "hex" (a valid 6-digit hex code starting with #), "description" (one sentence describing the color's feel). Make the colors harmonious and evocative of the prompt.`

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

function isValidColor(obj: unknown): obj is Color {
  if (typeof obj !== 'object' || obj === null) return false
  const c = obj as Record<string, unknown>
  return (
    typeof c.name === 'string' &&
    typeof c.hex === 'string' &&
    typeof c.description === 'string' &&
    isValidHex(c.hex)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string.' },
        { status: 400 }
      )
    }

    const trimmedPrompt = prompt.trim()
    if (trimmedPrompt.length === 0) {
      return NextResponse.json(
        { error: 'Prompt cannot be empty.' },
        { status: 400 }
      )
    }

    if (trimmedPrompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt must be 500 characters or fewer.' },
        { status: 400 }
      )
    }

    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 16000,
      // @ts-expect-error adaptive thinking not yet in SDK types
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: trimmedPrompt,
        },
      ],
    })

    const message = await stream.finalMessage()

    const textBlock = message.content.find((block: ContentBlock) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'No text response received from AI.' },
        { status: 500 }
      )
    }

    const rawText = textBlock.text.trim()

    let colors: unknown
    try {
      colors = JSON.parse(rawText)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse color palette from AI response.' },
        { status: 500 }
      )
    }

    if (!Array.isArray(colors) || colors.length !== 5) {
      return NextResponse.json(
        { error: 'AI did not return exactly 5 colors.' },
        { status: 500 }
      )
    }

    if (!colors.every(isValidColor)) {
      return NextResponse.json(
        { error: 'One or more colors have invalid structure.' },
        { status: 500 }
      )
    }

    const validatedColors = colors as Color[]

    const { data, error: dbError } = await supabase
      .from('palettes')
      .insert({
        prompt: trimmedPrompt,
        colors: validatedColors,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Supabase insert error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save palette to database.' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Generate route error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
