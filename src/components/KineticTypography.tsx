'use client';

import React, { useRef, useLayoutEffect, HTMLAttributes } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ------------------------------------------------------------------
// 1. Kinetic Text Reveals (Velocity/Scroll Linked Clipping)
// ------------------------------------------------------------------

interface RevealHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  text: string;
  element?: 'h1' | 'h2' | 'h3' | 'p';
}

export function KineticReveal({ text, element: Element = 'h1', className = '', ...props }: RevealHeadingProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    // Find all internally split words
    const words = gsap.utils.toArray('.kinetic-word', containerRef.current) as HTMLElement[];

    const ctx = gsap.context(() => {
      // Setup default geometric states hiding everything natively behind the clip-path limits
      gsap.set(words, { yPercent: 120, rotation: 3 });

      // Orchestrate standard trigger bound natively to scroll velocity proxy
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(words, {
            yPercent: 0,
            rotation: 0,
            duration: 1.2,
            stagger: 0.04,
            ease: 'expo.out',
            overwrite: 'auto'
          });
        },
        // Physical re-armament mimicking premium editorial rewinds
        onLeaveBack: () => {
          gsap.to(words, { yPercent: 120, rotation: 3, duration: 0.6, ease: 'power3.in', stagger: 0.02 });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Split string manually bypassing heavy regex overheads while trapping them inside absolute bounds
  const splitWords = text.split(' ').map((word, index) => (
    <span 
      key={index} 
      className="inline-flex relative overflow-hidden" 
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 120%, 0 120%)' }} // Aggressive programmatic masking
    >
      <span className="kinetic-word inline-block origin-bottom-left will-change-transform pr-[0.2em]">
        {word}
      </span>
    </span>
  ));

  return (
    <Element ref={containerRef} className={`tracking-tight ${className}`} {...props}>
      {splitWords}
    </Element>
  );
}

// ------------------------------------------------------------------
// 2. Velocity-Reactive Magnetic Physics Core
// ------------------------------------------------------------------

export function MagneticWrapper({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    
    // Utilize massive underlying GSAP spring parameters mapping to QuickTo for 0 lag latency
    // Mass: 1, Tension: 180, Friction: 12 translates roughly to native power spring eases
    const xTo = gsap.quickTo(el, "x", { duration: 1, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, "y", { duration: 1, ease: 'elastic.out(1, 0.4)' });
    
    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      // Scalar pulling intensity mapping
      xTo(x * 0.45);
      yTo(y * 0.45);
    };
    
    const onMouseLeave = () => {
      xTo(0);
      yTo(0);
    };
    
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // Micro-scaling interactions utilizing raw physical GSAP bounds
  const handleMouseDown = () => {
    gsap.to(ref.current, { scale: 0.95, duration: 0.1, ease: 'power2.out', overwrite: 'auto' });
  };
  const handleMouseUp = () => {
    gsap.to(ref.current, { scale: 1, duration: 0.9, ease: 'elastic.out(1.2, 0.3)', overwrite: 'auto' });
  };

  return (
    <div 
      ref={ref} 
      onMouseDown={handleMouseDown} 
      onMouseUp={handleMouseUp} 
      onMouseLeave={handleMouseUp} 
      className={`inline-block cursor-auto will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

// ------------------------------------------------------------------
// 3. Programmatic Velocity Gloss Interaction Button
// ------------------------------------------------------------------

export function CodedInteractionButton({ children, className = '', ...props }: HTMLAttributes<HTMLButtonElement>) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const flareRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!btnRef.current || !flareRef.current) return;
    const btn = btnRef.current;
    
    // QuickSet overrides tracking mouse deltas directly mapped into flare opacities
    const opTo = gsap.quickTo(flareRef.current, "opacity", { duration: 0.4, ease: "power2.out" });
    const xTo = gsap.quickTo(flareRef.current, "x", { duration: 0.6, ease: "power3.out" });

    // Internal tracker simulating raw proxy velocity matrix
    let lastTime = 0;
    let lastX = 0;

    const onMouseMove = (e: MouseEvent) => {
      const { clientX } = e;
      const { left, width } = btn.getBoundingClientRect();
      const localX = clientX - left;
      
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const velocityX = Math.abs(clientX - lastX) / dt;

      // Map raw CSS speed (px/ms) to a glowing opacity vector maxing out at 1.0
      // Natively hardware accelerated, avoiding thrashing the main thread
      const dynamicGlow = Math.min(velocityX * 0.8, 1);
      
      xTo(localX);
      opTo(dynamicGlow + 0.1); // Retain a minor baseline opacity so it's visible on idle hover

      lastX = clientX;
      lastTime = now;
    };

    const onMouseLeave = () => {
      opTo(0);
      xTo(btn.getBoundingClientRect().width / 2); // Center reset fallback
    };

    btn.addEventListener("mousemove", onMouseMove);
    btn.addEventListener("mouseleave", onMouseLeave);

    return () => {
      btn.removeEventListener("mousemove", onMouseMove);
      btn.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <button 
      ref={btnRef}
      className={`relative overflow-hidden group bg-white/5 border border-white/10 hover:border-white/20 px-8 py-3 rounded-full transition-colors flex items-center justify-center font-bold text-white shadow-xl ${className}`}
      {...props}
    >
      {/* Programmatic Hardware Masked Flare */}
      <span 
        ref={flareRef}
        className="coded-flare absolute inset-y-0 w-32 -translate-x-1/2 pointer-events-none opacity-0 mix-blend-screen"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at center, rgba(0, 229, 255, 0.8) 0%, transparent 60%)',
          filter: 'blur(10px)',
          borderRadius: '50%',
          willChange: 'transform, opacity'
        }}
      />
      <span className="relative z-10 pointer-events-none">{children}</span>
    </button>
  );
}
