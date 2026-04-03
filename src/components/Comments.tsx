'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface CommentsProps {
  mediaId: number
  mediaType: string
}

// Separate component for stability (prevents focus loss and text reversal)
const CommentItem = ({ 
  comment, 
  user, 
  allComments, 
  handleLike, 
  replyingTo, 
  setReplyingTo, 
  replyContent, 
  setReplyContent, 
  postComment,
  isReply = false 
}: any) => {
  const likeCount = comment.comment_likes?.length || 0
  const isLiked = comment.comment_likes?.some((l: any) => l.user_id === user?.id)
  const replies = allComments.filter((c: any) => c.parent_id === comment.id)

  return (
    <div className={`flex flex-col gap-3 group/comment ${isReply ? 'ml-8 mt-2 p-3 bg-white/[0.02] border-l-2 border-primary/20' : 'bg-white/5 p-5 border border-white/5'} rounded-xl transition-all hover:border-white/10`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xs text-white shadow-lg ${isReply ? 'scale-90' : ''}`}>
            {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white shadow-sm flex items-center gap-2">
              {comment.profiles?.username || 'Anonymous'}
              {comment.user_id === user?.id && <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded-full border border-primary/30 uppercase tracking-tighter">You</span>}
            </span>
            <span className="text-[10px] text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
      
      <div className="flex gap-5 mt-2 text-xs font-bold uppercase tracking-tight">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleLike(comment.id);
          }}
          className={`flex items-center gap-1.5 transition-all hover:scale-105 active:scale-90 ${isLiked ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
        >
           <svg viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
           {likeCount > 0 && <span className="mr-0.5">{likeCount}</span>}
           {isLiked ? 'Liked' : 'Like'}
        </button>
        
        {!isReply && user && (
          <button 
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-gray-500 hover:text-primary transition-colors hover:scale-105"
          >
            Reply
          </button>
        )}
      </div>

      {/* Reply Input */}
      {replyingTo === comment.id && (
        <div className="mt-4 flex flex-col gap-2 animate-fade-in">
          <textarea 
            autoFocus
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder={`Replying to ${comment.profiles?.username}...`}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 rounded-full text-[10px] text-gray-500 hover:text-white uppercase transition-colors">Cancel</button>
            <button 
              onClick={() => postComment(comment.id)}
              disabled={!replyContent.trim()}
              className="bg-primary hover:bg-primary/80 px-4 py-1.5 rounded-full text-[10px] text-white font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg"
            >
              Post Reply
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="flex flex-col gap-1">
          {replies.map((reply: any) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              user={user} 
              allComments={allComments}
              handleLike={handleLike}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              postComment={postComment}
              isReply 
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Comments({ mediaId, mediaType }: CommentsProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user))
  }, [])

  useEffect(() => {
    fetchComments()
  }, [mediaId, mediaType])

  const fetchComments = async () => {
    const res = await fetch(`/api/comments?media_id=${mediaId}&media_type=${mediaType}`, {
      credentials: 'include'
    })
    if (res.ok) {
      const { data } = await res.json()
      setComments(data || [])
    }
    setLoading(false)
  }

  const postComment = async (parentId: number | null = null) => {
    const content = parentId ? replyContent : newComment
    if (!content.trim()) return

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        media_id: mediaId, 
        media_type: mediaType, 
        content,
        parent_id: parentId 
      })
    })

    if (res.ok) {
      if (parentId) {
        setReplyContent('')
        setReplyingTo(null)
      } else {
        setNewComment('')
      }
      fetchComments()
    } else {
      const data = await res.json().catch(() => ({}))
      alert(`Error: ${data.error || 'Server error'}. Ensure you are logged in.`)
    }
  }

  const handleLike = async (commentId: number) => {
    if (!user) {
      alert('Please sign in to like comments.')
      return
    }

    // Optimistic update
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const alreadyLiked = c.comment_likes?.some((l: any) => l.user_id === user.id)
        if (alreadyLiked) {
          return { ...c, comment_likes: c.comment_likes.filter((l: any) => l.user_id !== user.id) }
        } else {
          return { ...c, comment_likes: [...(c.comment_likes || []), { user_id: user.id }] }
        }
      }
      return c
    }))

    try {
      const res = await fetch('/api/comments/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment_id: commentId })
      })
      if (!res.ok) throw new Error('Failed to toggle like')
    } catch (error) {
       fetchComments()
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 w-full max-w-5xl mx-auto">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  const mainComments = comments.filter(c => !c.parent_id)

  return (
    <div className="flex flex-col gap-6 bg-surface-light border border-white/5 rounded-2xl p-6 md:p-10 w-full max-w-5xl mx-auto shadow-2xl mt-12 mb-8 glass overflow-hidden">
      <div className="flex items-center gap-4 mb-2">
        <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-tighter italic">Community</h2>
        <div className="h-0.5 flex-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
      </div>
      
      {user ? (
        <div className="flex flex-col gap-3 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 ml-1 mb-1">
             <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             </div>
             <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Signed in as {user.user_metadata?.full_name || user.email}</span>
          </div>
          <textarea 
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Share your thoughts with the community..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none resize-none transition-all shadow-inner"
            rows={3}
          />
          <button 
            onClick={() => postComment()}
            disabled={!newComment.trim()}
            className="group bg-primary hover:bg-primary-hover px-10 py-3 rounded-full text-white font-black uppercase tracking-widest text-xs self-end transition-all disabled:opacity-50 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            Post Comment
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      ) : (
        <div className="py-8 text-center border border-white/10 bg-white/5 rounded-2xl text-gray-400">
          <a href="/login" className="text-primary hover:underline font-bold uppercase tracking-widest inline-block skew-x-[-10deg]">Sign in</a> to join the conversation.
        </div>
      )}

      <div className="flex flex-col gap-6 pt-2">
        {mainComments.map(c => (
           <CommentItem 
             key={c.id} 
             comment={c} 
             user={user} 
             allComments={comments}
             handleLike={handleLike}
             replyingTo={replyingTo}
             setReplyingTo={setReplyingTo}
             replyContent={replyContent}
             setReplyContent={setReplyContent}
             postComment={postComment}
           />
        ))}
        {mainComments.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-4 opacity-50">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 text-gray-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
             <p className="text-gray-500 text-sm font-subheading italic">The discussion is quiet... start the conversation!</p>
          </div>
        )}
      </div>
    </div>
  )
}
