import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/tmdb'

export default async function HistoryView() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: listData } = await supabase
    .from('histories')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">Watch History</h1>
        <p className="text-gray-400 font-sans">Everything you've ever started streaming on WatchEX.</p>
      </div>

      <div className="pt-6">
        {!listData || listData.length === 0 ? (
          <div className="py-20 text-center text-gray-500 glass rounded-2xl">
            <p>Your history is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {listData.map(item => (
              <div key={item.id} className="w-full flex flex-col gap-2">
                <Link href={`/${item.type}/${item.media_id}`} className="block relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10">
                  {item.poster_path ? (
                    <Image src={getImageUrl(item.poster_path, 'w342')!} fill alt={item.title} className="object-cover" />
                  ) : <div className="absolute inset-0 bg-surface-light" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-80" />
                  <div className="absolute bottom-2 left-2 right-2 text-xs font-semibold text-primary">
                    {item.type === 'tv' && `S${item.season} E${item.episode}`}
                  </div>
                </Link>
                <p className="text-sm font-medium text-white truncate">{item.title}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{new Date(item.updated_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
