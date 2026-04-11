'use client';

import React, { useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';

export function SplashScreen() {
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Array parameters for the mathematical barcode wipe sequence
  const streaksCount = 30;
  const brandColors = ['#FF007F', '#00E5FF', '#FF5A00', '#FF0033', '#8A2BE2'];

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Isolate nodes specifically to this instance without risking global class overlaps
    const ctx = gsap.context(() => {
      const streaks = gsap.utils.toArray('.streak') as HTMLElement[];
      const logoText = document.querySelector('.logo-text');

      const tl = gsap.timeline({
        onComplete: () => setIsComplete(true) // Immediately triggers React unmount phase freeing DOM
      });

      // ----------------------------------------------------------------------
      // PHASE 1: The Barcode Wipe (High-Velocity Boot Sequence)
      // ----------------------------------------------------------------------
      
      // Preparation initialization
      gsap.set(streaks, { scaleY: 0, transformOrigin: 'top center', opacity: 1 });
      
      tl.to(streaks, {
        scaleY: 1,
        duration: 0.3,
        stagger: {
          each: 0.02,
          from: 'random' // Rapid pseudo-random transmission firing vector
        },
        ease: 'power3.inOut',
        force3D: true
      })
      // The Fade-out resolution forcing the grid structure into form natively
      .to(streaks, {
        backgroundColor: '#003344', // Dark cyan architectural grid overlay
        scaleX: 0.05, 
        opacity: 0.2,
        duration: 0.8,
        ease: 'power3.out',
        force3D: true
      }, "+=0.1");

      // ----------------------------------------------------------------------
      // PHASE 2: Geometric Logo Tracing & Bloom Event
      // ----------------------------------------------------------------------
      
      tl.to(logoText, {
        strokeDashoffset: 0,
        duration: 1.6,
        ease: 'power2.inOut'
      }, "-=0.6") // Overlap tracing heavily into grid resolution
      
      // Massive native solid fill + shadow boom
      .to(logoText, {
        fill: '#00E5FF',
        duration: 0.4,
        ease: 'expo.out',
        force3D: true
      });

      // ----------------------------------------------------------------------
      // PHASE 3: Z-Space UI Pull-Through (The Transition)
      // ----------------------------------------------------------------------
      
      tl.to(containerRef.current, {
        scale: 5,                  // Blow up the entire screen massively mimicking a fly-through
        opacity: 0,
        duration: 1.2,
        ease: 'power4.in',
        force3D: true
      }, "+=0.8"); // Hold on the final blooming logo for 800ms mathematically

    }, containerRef); // Scopes the GSAP context securely 

    return () => ctx.revert();
  }, []);

  if (isComplete) return null;

  return (
    <>
      {/* 
        Inject raw critical styles avoiding overarching stylesheet dependencies 
        Maps perfect stroke path length arrays.
      */}
      <style>{`
        .logo-text {
          fill: transparent;
          stroke: #00E5FF;
          stroke-width: 2px;
          /* Explicit path logic allowing drawing mechanisms to function properly without DrawSVG plugin */
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          will-change: stroke-dashoffset, fill;
        }
      `}</style>
      
      <div 
        ref={containerRef}
        className="fixed inset-0 z-[9999999] pointer-events-auto bg-[#050505] flex items-center justify-center overflow-hidden"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Phase 1 Background Grid Generator */}
        <div className="absolute inset-0 flex pointer-events-none z-10 w-full h-full">
          {Array.from({ length: streaksCount }).map((_, i) => {
             // Assign a pseudo-random intense starting color mapping to each line
             const randomRGB = brandColors[Math.floor(Math.random() * brandColors.length)];
             return (
               <div 
                 key={i} 
                 className="streak" 
                 style={{ 
                    // Mathematically span identical widths flawlessly without calc
                    width: `${200 / streaksCount}%`, 
                    height: '100%',
                    backgroundColor: randomRGB,
                 }}
               />
             );
          })}
        </div>

        {/* Phase 2 Geometric Traced Logo Rendering */}
        <div className="relative z-50 pointer-events-none w-full mix-blend-screen px-4">
          <svg viewBox="0 0 1000 200" className="w-full max-w-6xl mx-auto drop-shadow-2xl h-auto">
            <text 
              x="50%" 
              y="55%" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              className="logo-text font-black text-7xl md:text-8xl lg:text-[140px] uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Inter', 'Monument Extended', 'Syncopate', sans-serif" }}
            >
              WATCHEX
            </text>
          </svg>
        </div>
      </div>
    </>
  );
}
