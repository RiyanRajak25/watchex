'use client';

import React, { createContext, useContext, useState, useRef, useLayoutEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip);
}

// ------------------------------------------------------------------
// 2. The FLIP Poster Expansion (Grid to Hero Interception Routing)
// ------------------------------------------------------------------

interface FlipContextType {
  triggerFlipRouting: (href: string, imageSrc: string, originalElement: HTMLElement) => void;
}

const FlipContext = createContext<FlipContextType | null>(null);

export function useFlipEngine() {
  const ctx = useContext(FlipContext);
  if (!ctx) throw new Error("useFlipEngine must be mapped underneath FlipPosterProvider");
  return ctx;
}

export function FlipPosterProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [activeFlip, setActiveFlip] = useState<{ src: string; originatingRect: DOMRect } | null>(null);
  const cloneRef = useRef<HTMLImageElement>(null);
  
  // Natively intercept client-side routing while keeping fixed state alive across Next.js teardown bounds
  const triggerFlipRouting = (href: string, imageSrc: string, originalElement: HTMLElement) => {
    // 1. Capture exact geometry bypassing standard CSS flow layouts
    const rect = originalElement.getBoundingClientRect();
    
    // 2. Pass local geometry upward into global Provider state instantly mounting fixed overlay
    setActiveFlip({ src: imageSrc, originatingRect: rect });

    // 3. Force layout micro-task alignment ensuring clone mounts before interpolation
    requestAnimationFrame(() => {
      if (!cloneRef.current) return;
      
      // Calculate destination geometry mimicking a standard full-bleed hero page
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // We manually construct the animation timeline so we aren't relying strictly on identical DOM nodes
      gsap.fromTo(cloneRef.current, 
        { 
          // Inject raw origin coordinates
          left: rect.left, 
          top: rect.top, 
          width: rect.width, 
          height: rect.height, 
          borderRadius: '16px',
          opacity: 1
        },
        {
          // Fly out to full screen bleed mimicking the new page state
          left: 0, 
          top: 0, 
          width: vw, 
          height: vh, 
          borderRadius: '0px', 
          duration: 0.9,
          ease: 'power4.inOut',
          onComplete: () => {
             // 4. Resolve the standard Next.js route change completely hidden underneath the fixed expanded layer!
             router.push(href);
             
             // Queue teardown fallback once layout natively resolves
             setTimeout(() => {
                // Rapidly fade out leaving the actual new `<HeroBanner>` instance visible directly underneath
                gsap.to(cloneRef.current, { opacity: 0, duration: 0.3, onComplete: () => setActiveFlip(null) });
             }, 500); 
          }
        }
      );
    });
  };

  return (
    <FlipContext.Provider value={{ triggerFlipRouting }}>
      {children}
      
      {/* Absolute Z-Space intercept clone mapping overlay */}
      {activeFlip && (
        <div className="fixed inset-0 z-[999999] pointer-events-none">
           <img 
              ref={cloneRef} 
              src={activeFlip.src} 
              alt="FLIP Expand" 
              className="absolute object-cover shadow-[0_30px_60px_rgba(0,0,0,0.8)] will-change-transform" 
           />
        </div>
      )}
    </FlipContext.Provider>
  );
}
