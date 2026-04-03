'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface CommentsProps {
  mediaId: number;
  mediaType: string;
}

export default function Comments({ mediaId, mediaType }: CommentsProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user))
    fetchComments()
  }, [])

  const fetchComments = async () => {
    const res = await fetch(`/api/comments?media_id=${mediaId}&media_type=${mediaType}`)
    if (res.ok) {
      const { data } = await res.json()
      setComments(data || [])
    }
    setLoading(false)
  }

  const postComment = async () => {
    if (!newComment.trim()) return
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, media_type: mediaType, content: newComment })
    })
    if (res.ok) {
      setNewComment('')
      fetchComments()
    } else {
      alert("Error posting comment. Ensure you are logged in.")
    }
  }

  if (loading) return <div className="text-gray-500 py-10 w-full max-w-5xl mx-auto">Loading community discussion...</div>

  return (
    <div className="flex flex-col gap-6 bg-surface-light border border-white/5 rounded-2xl p-6 md:p-10 w-full max-w-5xl mx-auto shadow-2xl mt-12 mb-8">
      <h2 className="text-2xl font-heading font-bold text-white mb-2">Community Discussion</h2>
      
      {user ? (
        <div className="flex flex-col gap-2 border-b border-white/10 pb-8">
          <textarea 
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="What are your thoughts on this?"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
            rows={3}
          />
          <button 
            onClick={postComment}
            disabled={!newComment.trim()}
            className="bg-primary hover:bg-primary-hover px-6 py-2 rounded-full text-white font-bold w-max self-end transition-colors disabled:opacity-50 shadow-md"
          >
            Post Comment
          </button>
        </div>
      ) : (
        <div className="py-6 text-center border border-white/10 bg-white/5 rounded-xl text-gray-400">
          <a href="/login" className="text-primary hover:underline font-bold">Sign in</a> to join the conversation.
        </div>
      )}

      <div className="flex flex-col gap-4 pt-2">
        {comments.filter(c => !c.parent_id).map(c => (
           <div key={c.id} className="flex flex-col gap-2 bg-white/5 p-4 rounded-xl border border-white/5 relative hover:border-white/10 transition-colors">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xs text-white">
                 {c.profiles?.username?.[0]?.toUpperCase() || 'U'}
               </div>
               <span className="text-sm font-bold text-white shadow-sm">{c.profiles?.username || 'Anonymous User'}</span>
               <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
             </div>
             <p className="text-sm text-gray-300 ml-11">{c.content}</p>
             <div className="flex gap-4 ml-11 mt-2 text-xs text-gray-500 font-medium">
               <button className="hover:text-primary transition-colors flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  Like
               </button>
               <button className="hover:text-primary transition-colors cursor-not-allowed opacity-50" title="Replies coming soon">Reply</button>
             </div>
           </div>
        ))}
        {comments.length === 0 && <p className="text-center text-gray-500 mb-6">Be the first to share your thoughts!</p>}
      </div>
    </div>
  )
}
