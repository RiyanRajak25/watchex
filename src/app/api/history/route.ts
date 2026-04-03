import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { media_id, type, season, episode, title, poster_path } = body

  // Upsert history
  const { data, error } = await supabase
    .from('histories')
    .upsert(
      { 
        user_id: user.id, 
        media_id, 
        type, 
        season: season || 0,
        episode: episode || 0,
        title,
        poster_path
      },
      { onConflict: 'user_id, media_id, type, season, episode' }
    )
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
