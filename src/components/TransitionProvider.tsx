'use client';

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import gsap from 'gsap';

interface TransitionContextType {
  navigateTo: (href: string) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType>({
  navigateTo: () => {},
  isTransitioning: false,
});

export const useTransitionOrchestrator = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const curtainRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  // Ref to track if we're waiting for a route change to resolve
  const pendingRouteResolution = useRef<string | null>(null);

  const navigateTo = (href: string) => {
    if (!curtainRef.current || isTransitioning || pathname === href) return;
    setIsTransitioning(true);

    // Initial state: Curtain above the screen
    gsap.set(curtainRef.current, { yPercent: -100, display: 'block' });

    // Step 1: Bring curtain down across screen
    gsap.to(curtainRef.current, {
      yPercent: 0,
      duration: 0.8,
      ease: 'power4.inOut',
      onComplete: () => {
        // Tag that we are waiting for this route
        pendingRouteResolution.current = href;
        // Trigger Next.js native hard push
        router.push(href);
      }
    });
  };

  // Step 2: Listen for the route change to finish mounting
  useEffect(() => {
    if (pendingRouteResolution.current === pathname) {
      pendingRouteResolution.current = null;
      
      // Delay slightly to ensure browser painted the new React DOM graph
      const timer = setTimeout(() => {
        if (!curtainRef.current) return;
        
        // Curtain clears the screen downwards
        gsap.to(curtainRef.current, {
          yPercent: 100,
          duration: 0.8,
          ease: 'power4.inOut',
          onComplete: () => {
            gsap.set(curtainRef.current, { display: 'none' });
            // By flipping state here, any children listening to 'isTransitioning'
            // are cleared to fire their entrance animations flawlessly!
            setIsTransitioning(false);
          }
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ navigateTo, isTransitioning }}>
      {children}
      {/* 
        The solid black global curtain mapping absolute layout. 
        Will absolutely dominate z-index logic mapping over Modals natively. 
      */}
      <div 
        ref={curtainRef} 
        className="fixed top-0 left-0 w-full h-[100vh] bg-[#050505] z-[999999] pointer-events-auto" 
        style={{ display: 'none' }} 
      />
    </TransitionContext.Provider>
  );
}
