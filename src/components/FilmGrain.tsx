'use client';

import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { useLenis } from '@studio-freight/react-lenis';

export default function FilmGrain() {
  const grainRef = useRef<HTMLDivElement>(null);
  
  // Base intensity of the grain
  const baseOpacity = 0.04;
  // Maximum added intensity from scrolling (+15% as requested)
  const maxAddedOpacity = 0.15; 

  const lenis = useLenis();

  useLayoutEffect(() => {
    if (!grainRef.current) return;

    // Use GSAP ticker to smoothly update grain based on velocity
    const updateGrain = () => {
      // Get velocity from Lenis
      const velocity = Math.abs(lenis?.velocity || 0);
      
      // Calculate responsive opacity mapping: 
      // Assuming a max velocity around 50 for normal fast scrolling
      const mappedVelocity = Math.min(velocity / 50, 1);
      const dynamicOpacity = baseOpacity + (maxAddedOpacity * mappedVelocity);

      // We use GSAP quickTo for zero-latency parameter updates if we were 
      // tracking mouse, but for scroll a direct gsap.set on the ticker is performant.
      gsap.set(grainRef.current, {
        opacity: dynamicOpacity
      });
    };

    gsap.ticker.add(updateGrain);

    return () => {
      gsap.ticker.remove(updateGrain);
    };
  }, [lenis]);

  return (
    <div
      ref={grainRef}
      className="pointer-events-none fixed inset-0 z-[9990] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: baseOpacity,
        /* Hardware acceleration enforcement */
        transform: 'translateZ(0)',
        willChange: 'opacity'
      }}
    />
  );
}
