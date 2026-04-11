'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface StickyPlayerProps {
  trailerKey: string | null;
  movieTitle: string;
}

export function StickyPlayer({ trailerKey, movieTitle }: StickyPlayerProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Only applicable when sticky

  useEffect(() => {
    if (!trailerKey || isDismissed) return;

    const handleScroll = () => {
      // If we scroll down more than ~600px from top (past the hero area), trigger sticky mode
      if (window.scrollY > 600) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
        setIsExpanded(false); // Reset expanded state if we scroll back up
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [trailerKey, isDismissed]);

  if (!trailerKey || isDismissed) return null;

  return (
    <>
      {/* Anchor Point (Non-sticky state rendered directly in the DOM flow usually, 
          but for our specific article page layout, the layout doesn't naturally have a player container.
          So, we will ONLY render it stickily when scrolling down, or as a floating card.
          Let's make it a pure PiP player that appears after the user starts actually scrolling.)
      */}
      
      <AnimatePresence>
        {isSticky && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isExpanded ? '400px' : '280px',
              height: isExpanded ? '225px' : '158px',
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-50 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black backdrop-blur-xl group hover:shadow-accent/20 transition-shadow duration-500`}
            style={{ isolation: 'isolate' }}
          >
            {/* Header / Controls */}
            <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-semibold text-white/80 line-clamp-1 max-w-[200px] drop-shadow-md">
                Trailer: {movieTitle}
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 rounded-md bg-black/60 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
                  aria-label="Toggle player size"
                >
                  {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button 
                  onClick={() => setIsDismissed(true)}
                  className="p-1 rounded-md bg-black/60 hover:bg-red-500/80 text-white transition-colors backdrop-blur-md"
                  aria-label="Dismiss player"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* YouTube Embed */}
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=1&modestbranding=1`}
              title={`${movieTitle} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full object-cover pointer-events-auto"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
