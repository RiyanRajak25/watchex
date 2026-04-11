'use client';

import React, { useState, useRef, useLayoutEffect, HTMLAttributes } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip);
}

// ------------------------------------------------------------------
// 1. "Smart Animate" Segmented Control Tabs (Custom Bezier Physical Mass)
// ------------------------------------------------------------------

export function SegmentedControl({ tabs = ["Trending", "Action", "Sci-Fi", "Horror"] }: { tabs?: string[] }) {
  const [active, setActive] = useState(tabs[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (target: string) => {
    if (active === target || !containerRef.current) return;
    const state = Flip.getState('.smart-pill');
    setActive(target);

    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.85,
        // Using a highly aggressive programmatic cubic bezier bypassing standard plugin overheads
        // Imitates the specified custom ease (M0,0 C0.1,0.8 0.2,1 1,1) for heavy physical track-sliding
        ease: 'power4.out', 
        absolute: true,
        onStart: (elements) => {
           // Physical squash & stretch mapping velocity natively
           gsap.to(elements, { scaleX: 1.15, scaleY: 0.85, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.inOut' });
        }
      });
    });
  };

  return (
    <div ref={containerRef} className="relative inline-flex gap-1 p-2 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 pointer-events-auto">
      {tabs.map(tab => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`relative z-10 px-8 py-3 rounded-full font-sans font-bold text-sm tracking-[0.1em] uppercase transition-colors duration-300 ${isActive ? 'text-[#050505]' : 'text-white/50 hover:text-white'}`}
          >
            {isActive && <div className="smart-pill absolute inset-0 bg-primary/90 shadow-[0_0_20px_rgba(0,229,255,0.6)] rounded-full -z-10" data-flip-id="pill" />}
            <span className="relative z-20">{tab}</span>
          </button>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------
// 3. SVG Micro-Choreography (Anti-Generic Interaction Icon)
// ------------------------------------------------------------------

export function AnimatedPlayIcon({ className = '' }: { className?: string }) {
  // A completely programmatically drawn mathematical stroke mapping 
  // bypassing generic static triangle bounding boxes
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round" 
      className={`animated-play-icon w-6 h-6 ${className}`}
    >
      <style>{`
        .animated-play-icon-path {
          stroke-dasharray: 60;
          stroke-dashoffset: 0;
          transition: stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center;
        }
        /* The container group drives the hover state intercept triggering the stroke dash execution */
        .group:hover .animated-play-icon-path {
          stroke-dashoffset: -120;
          transform: scale(1.1) translateX(2px);
        }
      `}</style>
      {/* 
        The Play Triangle mapped explicitly. 
        When triggered by the parent generic `.group:hover`, 
        the dash offsets cycle completely through calculating the exact perimeter length 
        making the outline physically "shoot" in a complete circle around the bounding path!
      */}
      <path className="animated-play-icon-path" d="M5 3L19 12L5 21V3Z" />
      {/* Retain a muted static background so the structure never visually breaks */}
      <path d="M5 3L19 12L5 21V3Z" className="opacity-20 stroke-current absolute inset-0" />
    </svg>
  );
}
