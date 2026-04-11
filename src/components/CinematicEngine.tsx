'use client';

import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';

gsap.registerPlugin(ScrollTrigger);

// -------------------------------------------------------------
// Antigravity Motion Core Provider
// -------------------------------------------------------------
export function AntigravityProvider({ children }: { children: React.ReactNode }) {
  // Heavy, premium momentum feel
  const [lenisOptions] = useState({
    lerp: 0.08,
    duration: 1.5,
    smoothTouch: true,
    smoothWheel: true,
  });

  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  );
}

// -------------------------------------------------------------
// The "Curtain" Shader Reveal (Hero Wrapper)
// -------------------------------------------------------------
// Scales down slightly, blurs, and dims the Hero as we scroll down to
// reveal the content below acting as a physical overlapping curtain.
export function CinematicCurtain({ children }: { children: React.ReactNode }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!heroRef.current || !curtainRef.current) return;

    // We tie the effect directly to the scroll using ScrollTrigger
    const st = ScrollTrigger.create({
      trigger: curtainRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true, // Smooth velocity-tied scrubbing
      animation: gsap.to(heroRef.current, {
        scale: 0.9,
        filter: 'blur(15px) brightness(0.2)',
        yPercent: 30, // Moves down slightly for parallax depth
        ease: 'none'
      })
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div ref={curtainRef} className="relative w-full h-[100vh] overflow-hidden cinematic-curtain-container">
      <div 
        ref={heroRef} 
        className="w-full h-full transform-gpu will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Slide-and-Depth Content Wrapper
// -------------------------------------------------------------
// Casts a massive high-density shadow back onto the "Curtain" hero to simulate
// real physical depth overlapping the video background, using parallax.
export function ContentDepthLayer({ children }: { children: React.ReactNode }) {
  const layerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!layerRef.current) return;

    // Slide-and-Depth effect triggered via GSAP
    const st = ScrollTrigger.create({
      trigger: layerRef.current,
      start: 'top bottom', // Start when the top of content hits bottom of viewport
      end: 'top top',
      scrub: 0.5, // The 0.5 parallax factor equivalent
      animation: gsap.from(layerRef.current, {
        y: 100,
        boxShadow: '0 -20px 40px rgba(0,0,0,0)',
        ease: 'none'
      })
    });
    
    return () => {
      st.kill();
    };
  }, []);

  return (
    <div 
      ref={layerRef} 
      className="relative z-20 w-full min-h-screen bg-transparent pointer-events-auto shadow-[0_-50px_100px_rgba(0,0,0,0.95)]"
    >
      <div className="bg-[#050505] w-full h-full rounded-t-[40px] pt-10">
         {children}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Antigravity Motion Staggered Grid (Trending Section Wrapper)
// -------------------------------------------------------------
export function DynamicStaggeredGrid({ children }: { children: React.ReactNode[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  // We connect to Lenis to get realtime velocity
  const lenis = useLenis();

  useLayoutEffect(() => {
    if (!gridRef.current || !elementsRef.current.length) return;

    const items = elementsRef.current.filter(Boolean);

    // Initial setup
    gsap.set(items, { y: 150, opacity: 0 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Determine scroll velocity from Lenis if available
            const velocity = lenis?.velocity ? Math.abs(lenis.velocity) : 0;
            
            // Adjust stagger and duration based on velocity
            // The faster you scroll, the more aggressive (faster) the entry
            const isAggressive = velocity > 15;
            const staggerAmount = isAggressive ? 0.05 : 0.15;
            const duration = isAggressive ? 0.4 : 0.8;

            gsap.to(items, {
              y: 0,
              opacity: 1,
              stagger: staggerAmount,
              duration: duration,
              ease: isAggressive ? 'power4.out' : 'back.out(1.2)',
              overwrite: 'auto'
            });

            // Once triggered we unobserve
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(gridRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lenis]);

  return (
    <div ref={gridRef} className="w-full flex overflow-x-auto gap-6 px-6 md:px-12 pb-14 pt-8 scrollbar-hide snap-x">
      {React.Children.map(children, (child, idx) => (
        <div
          ref={(el) => {
            elementsRef.current[idx] = el;
          }}
          className="snap-start cinematic-stagger-item will-change-transform opacity-0"
        >
          {child}
        </div>
      ))}
    </div>
  );
}
