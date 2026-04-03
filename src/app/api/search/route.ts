import { searchMedia } from '@/lib/tmdb'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    const data = await searchMedia(query)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
