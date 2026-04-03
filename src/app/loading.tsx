export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background fixed inset-0 z-50 pointer-events-none">
      <div className="flex flex-col items-center gap-5">
        <div className="flex gap-3">
          <div className="w-4 h-4 rounded-full bg-primary animate-bounce shadow-[0_0_15px_#e81cff]"></div>
          <div className="w-4 h-4 rounded-full bg-accent animate-bounce shadow-[0_0_15px_#ffb400]" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-4 h-4 rounded-full bg-white animate-bounce shadow-[0_0_15px_white]" style={{ animationDelay: '0.3s' }}></div>
        </div>
        <p className="text-gray-400 font-sans tracking-[0.3em] uppercase text-xs font-bold animate-pulse">Loading Cinematic Content</p>
      </div>
    </div>
  )
}
