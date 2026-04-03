import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { comment_id } = await req.json()

    if (!comment_id) {
      return NextResponse.json({ error: 'Missing comment_id' }, { status: 400 })
    }

    // Toggle: Check if like exists
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('comment_id', comment_id)
      .single()

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('comment_id', comment_id)

      if (deleteError) throw deleteError
      return NextResponse.json({ liked: false })
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({
          user_id: user.id,
          comment_id: comment_id
        })

      if (insertError) throw insertError
      return NextResponse.json({ liked: true })
    }
  } catch (error: any) {
    console.error('Like API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
