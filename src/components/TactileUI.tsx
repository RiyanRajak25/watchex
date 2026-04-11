'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip);
}

// ------------------------------------------------------------------
// Elastic Segmented Control (Category Tabs)
// ------------------------------------------------------------------

export function CategoryTabs({ tabs = ["Trending", "New Releases", "Classics"] }: { tabs?: string[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (targetTab: string) => {
    if (activeTab === targetTab || !containerRef.current) return;

    // 1. Capture the exact geometric state of the background pill before React unmounts it
    const state = Flip.getState('.category-pill');

    // 2. Mutate React State instantly determining new location of the DOM node
    setActiveTab(targetTab);

    // 3. Immediately hook rendering interpolations across the delta metrics
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.8,
        ease: 'expo.out',
        absolute: true, // Forces absolute positioning interpolation preventing surrounding flow breakage
        // Provide a minor squash string mapping scale to stretch it along the movement trajectory
        onStart: (elements) => {
          gsap.to(elements, {
             scaleX: 1.1,
             scaleY: 0.9,
             duration: 0.2,
             ease: 'power1.out',
             yoyo: true, // Auto snaps back to uniform 1.0 flawlessly seamlessly
             repeat: 1
          });
        }
      });
    });
  };

  return (
    <div 
      ref={containerRef}
      className="inline-flex gap-2 relative bg-white/5 p-2 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl pointer-events-auto"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`relative z-10 px-6 py-3 rounded-full font-bold text-sm md:text-base tracking-wider uppercase transition-colors duration-300 ${isActive ? 'text-[#050505]' : 'text-white/60 hover:text-white'}`}
          >
            {/* Conditional physical rendering of the active pill */}
            {isActive && (
              <div 
                className="category-pill absolute inset-0 bg-primary shadow-[0_0_20px_rgba(0,229,255,0.4)] rounded-full -z-10" 
                data-flip-id="pill"
              />
            )}
            <span className="relative z-20">{tab}</span>
          </button>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------
// Robust Micro-Interactive Buttons
// ------------------------------------------------------------------

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function PrimaryButton({ children, className = '', ...props }: PrimaryButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = () => {
    if (!btnRef.current) return;
    // Compress inward heavily simulating physical mechanical resistance
    gsap.to(btnRef.current, { scale: 0.93, duration: 0.1, ease: 'power2.out', overwrite: 'auto' });
  };

  const handleMouseUp = () => {
    if (!btnRef.current) return;
    // Release pressure shooting back utilizing deep native spring physics over-scoping slightly
    gsap.to(btnRef.current, { scale: 1, duration: 0.8, ease: 'elastic.out(1.2, 0.4)', overwrite: 'auto' });
  };

  return (
    <button
      ref={btnRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Ensures stuck states reset gracefully
      className={`relative group overflow-hidden pointer-events-auto bg-gradient-to-r from-primary to-accent text-[#050505] font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full shadow-[0_10px_30px_rgba(0,229,255,0.3)] transition-shadow hover:shadow-[0_15px_40px_rgba(0,229,255,0.6)] ${className}`}
      {...props}
    >
      {/* 
        Diagonal Glossy Reflection Flare mapping isolated CSS architecture.
        Starts absolutely crushed off the left grid and shoots over to the right on group hover
      */}
      <div 
        className="flare absolute inset-0 z-10 w-1/2 h-[200%] top-[-50%] transform -translate-x-[250%] skew-x-[-25deg] pointer-events-none bg-gradient-to-r from-transparent via-white/80 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[350%]"
      />
      <span className="relative z-20">{children}</span>
    </button>
  );
}
