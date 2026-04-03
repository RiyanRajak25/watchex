import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const media_id = searchParams.get('media_id')
  const media_type = searchParams.get('media_type')

  if (!media_id || !media_type) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(username, avatar_url), comment_likes(user_id)')
    .eq('media_id', Number(media_id))
    .eq('media_type', media_type)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { media_id, media_type, content, parent_id } = body

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      media_id: Number(media_id),
      media_type,
      content,
      parent_id: parent_id || null
    })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data: data[0] })
}
