import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('palettes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Supabase select error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch palettes.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ palettes: data ?? [] }, { status: 200 })
  } catch (err) {
    console.error('Palettes route error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
