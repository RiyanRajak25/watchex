'use client'
export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 mt-16">
      <div className="bg-surface-light border border-white/10 p-10 rounded-2xl flex flex-col items-center text-center max-w-lg shadow-2xl glass relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 className="text-3xl font-heading font-bold text-white mb-2">System Error</h2>
        <p className="text-gray-400 font-sans mb-8">We encountered an unexpected anomaly while compiling this cinematic sector.</p>
        <button 
          onClick={() => reset()}
          className="px-8 py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-full transition-colors w-full"
        >
          Re-initialize Module
        </button>
      </div>
    </div>
  )
}
