'use client'

import { useState, useRef, useEffect } from 'react'
import * as Popover from '@radix-ui/react-popover'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import Markdown from 'react-markdown'

type Message = { role: 'user' | 'bot'; text: string }

export default function WatchBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '👋 Welcome to **WatchEX**! I\'m **WatchBot**, powered by Gemini.\n\nWhat are you in the mood to watch tonight?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    if (!input.trim() || loading) return
    const userText = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userText }])
    setLoading(true)

    try {
      const historyPayload = messages.slice(1).map(m => ({
        role: m.role === 'bot' ? 'model' : 'user',
        text: m.text
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: historyPayload })
      })

      const data = await res.json()
      if (res.ok && data.text) {
        setMessages(prev => [...prev, { role: 'bot', text: data.text }])
      } else {
        throw new Error(data.error || 'WatchBot error.')
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'bot', text: `Sorry, something went wrong. Please try again!` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          aria-label="Open WatchBot"
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full shadow-[0_0_24px_rgba(232,28,255,0.5)] flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-transform"
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-white"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          align="end"
          sideOffset={12}
          className="z-50 w-[350px] md:w-[400px] h-[520px] bg-[#0d0d0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary/20 to-accent/10 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-black">WB</span>
            </div>
            <div>
              <p className="font-bold text-white leading-tight">WatchBot</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Powered by Gemini</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea.Root className="flex-1 overflow-hidden">
            <ScrollArea.Viewport className="h-full p-4">
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow ${
                      m.role === 'user'
                        ? 'bg-primary/20 border border-primary/30 text-white self-end'
                        : 'bg-white/8 border border-white/8 text-gray-200 self-start'
                    }`}
                  >
                    <div className="prose prose-invert prose-sm prose-p:my-0.5 prose-ul:my-1 max-w-none">
                      <Markdown>{m.text}</Markdown>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="self-start px-4 py-3 rounded-2xl bg-white/5 border border-white/5 flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:75ms]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" className="flex w-1.5 touch-none select-none p-0.5">
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-white/20" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-black/20 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask for recommendations..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-primary hover:bg-primary/80 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-colors shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
            </button>
          </div>

          <Popover.Arrow className="fill-white/10" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
