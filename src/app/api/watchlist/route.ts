import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { media_id, type, status, title, poster_path } = body

  // Upsert watchlist
  const { data, error } = await supabase
    .from('watchlists')
    .upsert(
      { 
        user_id: user.id, 
        media_id, 
        type, 
        status,
        title,
        poster_path
      },
      { onConflict: 'user_id, media_id, type' }
    )
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
