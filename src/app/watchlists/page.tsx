import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/tmdb-utils'
import * as Tabs from '@radix-ui/react-tabs'

export const dynamic = 'force-dynamic';

export default async function WatchlistView({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const activeTab = searchParams.tab || 'watching'
  const tabs = ['watching', 'planning', 'completed', 'on_hold', 'dropped']

  // Fetch the watchlists for this user
  const { data: listData } = await supabase
    .from('watchlists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const filteredItems = (listData || []).filter(item => item.status === activeTab)

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white uppercase tracking-tighter italic">Your Watchlist</h1>
        <p className="text-gray-400 font-sans text-sm">Manage and track your media across custom statuses.</p>
      </div>

      <Tabs.Root value={activeTab} className="flex flex-col gap-8">
        <Tabs.List className="flex gap-3 overflow-x-auto scrollbar-hide py-2 border-b border-white/5">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              asChild
            >
              <Link
                href={`/watchlists?tab=${tab}`}
                className={`px-6 py-2.5 rounded-full font-bold transition-all text-xs uppercase tracking-widest whitespace-nowrap border ${
                  activeTab === tab 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border-white/5 hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </Link>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value={activeTab} className="outline-none animate-in fade-in duration-500">
          {filteredItems.length === 0 ? (
            <div className="py-24 text-center glass rounded-2xl flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 text-gray-600"><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"/></svg>
              </div>
              <div>
                <p className="text-gray-400 font-medium capitalize">Your {activeTab.replace('_', ' ')} list is empty.</p>
                <Link href="/discover" className="text-primary hover:underline mt-2 inline-block text-sm font-bold uppercase tracking-widest">
                  Discover something to watch →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredItems.map(item => (
                <div key={item.id} className="w-full flex flex-col gap-3 group">
                  <Link href={`/${item.type}/${item.media_id}`} className="block relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:border-primary/50 transition-all">
                    {item.poster_path ? (
                      <Image src={getImageUrl(item.poster_path, 'w342')!} fill alt={item.title} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : <div className="absolute inset-0 bg-surface-light" />}
                    
                    {/* Status Badge overlay */}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase text-primary">
                      {item.type}
                    </div>
                  </Link>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </main>
  )
}
