import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { media_id, media_type, score } = await req.json()

    if (!media_id || !media_type || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ratings')
      .upsert(
        { 
          user_id: user.id, 
          media_id: Number(media_id), 
          media_type, 
          score: Math.round(score) 
        },
        { onConflict: 'user_id, media_id, media_type' }
      )
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Rating API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ score: 0 })
  }

  const { searchParams } = new URL(req.url)
  const media_id = searchParams.get('media_id')
  const media_type = searchParams.get('media_type')

  if (!media_id || !media_type) {
    return NextResponse.json({ error: 'Missing media_id or media_type' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('ratings')
    .select('score')
    .eq('user_id', user.id)
    .eq('media_id', Number(media_id))
    .eq('media_type', media_type)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is code for no rows found
    console.error('Rating GET error:', error)
  }

  return NextResponse.json({ score: data?.score || 0 })
}
