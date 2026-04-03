import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/tmdb'

export default async function WatchlistView({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = createClient()
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
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">Your Watchlist</h1>
        <p className="text-gray-400 font-sans">Manage and track your media across 5 custom statuses.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
        {tabs.map((tab) => (
          <Link
            key={tab}
            href={`/watchlists?tab=${tab}`}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm capitalize whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-primary text-white border border-primary/50' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
            }`}
          >
            {tab.replace('_', ' ')}
          </Link>
        ))}
      </div>

      <div className="pt-6">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center text-gray-500 glass rounded-2xl">
            <p>Your {activeTab.replace('_', ' ')} list is currently empty.</p>
            <Link href="/discover" className="text-primary hover:underline mt-2 inline-block">
              Discover something to watch
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="w-full flex flex-col gap-2">
                <Link href={`/${item.type}/${item.media_id}`} className="block relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10">
                  {item.poster_path ? (
                    <Image src={getImageUrl(item.poster_path, 'w342')!} fill alt={item.title} className="object-cover" />
                  ) : <div className="absolute inset-0 bg-surface-light" />}
                </Link>
                <p className="text-sm font-medium text-white truncate">{item.title}</p>
                <p className="text-xs text-gray-400 uppercase">{item.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
