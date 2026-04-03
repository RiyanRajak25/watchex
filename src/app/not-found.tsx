import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 mt-16">
      <div className="flex flex-col items-center text-center gap-6">
        <div className="relative">
          <h1 className="text-[150px] leading-none font-heading font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-accent opacity-90 drop-shadow-[0_0_40px_rgba(232,28,255,0.3)]">404</h1>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        </div>
        <div className="-mt-16 z-20">
          <h2 className="text-3xl md:text-4xl text-white font-bold font-heading mb-3">Lost in the Cinematic Void</h2>
          <p className="text-gray-400 max-w-md mx-auto">The protocol could not locate the requested transmission. This frequency is either dead or has moved.</p>
        </div>
        <Link href="/" className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-full font-bold transition-colors shadow-lg mt-2 z-20">
          Return to Hub
        </Link>
      </div>
    </div>
  )
}
