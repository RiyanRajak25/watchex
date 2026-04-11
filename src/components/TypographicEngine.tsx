'use client';

import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '@studio-freight/react-lenis';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------
// Velocity-Driven Marquee
// -------------------------------------------------------------
export function CastMarquee({ items }: { items: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const proxy = useRef({ timeScale: 1 });
  const lenis = useLenis();

  useLayoutEffect(() => {
    if (!trackRef.current) return;

    // Create an infinite horizontal scroll timeline
    tlRef.current = gsap.timeline({ repeat: -1 });
    tlRef.current.to(trackRef.current, {
      xPercent: -50,
      ease: 'none',
      duration: 15,
    });

    return () => {
      tlRef.current?.kill();
    };
  }, []);

  useLayoutEffect(() => {
    if (!tlRef.current) return;

    // Tie timeline timeScale to scroll velocity seamlessly using a proxy object
    const updateVelocity = () => {
      const velocity = lenis?.velocity || 0;
      // Default timeScale is 1. When scrolling down (positive velocity), it speeds up.
      // When scrolling up (negative), it goes in reverse smoothly.
      const targetTimeScale = 1 + velocity * 0.06;

      gsap.to(proxy.current, {
        timeScale: targetTimeScale,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: 'auto',
        onUpdate: () => {
           if (tlRef.current) {
             tlRef.current.timeScale(proxy.current.timeScale);
           }
        }
      });
    };

    gsap.ticker.add(updateVelocity);
    return () => gsap.ticker.remove(updateVelocity);
  }, [lenis]);

  // Duplicate items twice to map a seamless infinite loop scrolling from 0 to -50% width
  const loopedItems = [...items, ...items, ...items, ...items];

  return (
    <div ref={containerRef} className="w-full overflow-hidden flex items-center py-6 bg-black pointer-events-none">
      <div 
        ref={trackRef} 
        className="flex whitespace-nowrap gap-8 md:gap-16 items-center will-change-transform w-fit"
      >
        {loopedItems.map((item, idx) => (
          <span 
            key={idx} 
            className="text-3xl md:text-5xl font-black uppercase text-transparent bg-clip-text text-white/10"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Text Splitter & Masking Reveal
// -------------------------------------------------------------
export function RevealHeading({ text, className = '' }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [words, setWords] = useState<string[][]>([]);

  // Simple custom split text logic
  useEffect(() => {
    // Split by words, then by characters
    const split = text.split(' ').map(word => word.split(''));
    setWords(split);
  }, [text]);

  const resizeTimer = useRef<NodeJS.Timeout>();

  useLayoutEffect(() => {
    if (!containerRef.current || words.length === 0) return;

    const chars = containerRef.current.querySelectorAll('.reveal-char');
    
    // Set initial position
    gsap.set(chars, { yPercent: 100 });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(chars, {
            yPercent: 0,
            duration: 1.2,
            stagger: 0.02,
            ease: 'expo.out',
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(containerRef.current);

    // Recompute sizes on resize
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    });
    resizeObserver.observe(document.body);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      clearTimeout(resizeTimer.current);
    };
  }, [words]);

  return (
    <h2 ref={containerRef} className={`flex flex-wrap gap-x-3 gap-y-1 ${className}`}>
      {words.map((word, wordIdx) => (
        <span 
          key={wordIdx} 
          className="inline-flex whitespace-nowrap overflow-hidden"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
        >
          {word.map((char, charIdx) => (
            <span 
              key={charIdx} 
              className="reveal-char inline-block will-change-transform"
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}

// -------------------------------------------------------------
// Parallax Typography
// -------------------------------------------------------------
export function ParallaxTypography({ text, speed = 0.5, className = '' }: { text: string; speed?: number; className?: string }) {
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!textRef.current) return;

    const st = ScrollTrigger.create({
      trigger: textRef.current,
      start: 'top bottom', // Start animating when text enters bottom of screen
      end: 'bottom top',   // End when text leaves top of screen
      scrub: true,
      animation: gsap.to(textRef.current, {
        y: (i, target) => -window.innerHeight * speed, 
        ease: 'none'
      })
    });

    return () => {
      st.kill();
    };
  }, [speed]);

  return (
    <div className="relative w-full overflow-hidden flex justify-center items-center pointer-events-none select-none z-0">
      <div 
        ref={textRef} 
        className={`will-change-transform font-black text-[15vw] leading-none text-white/5 opacity-50 mix-blend-overlay ${className}`}
      >
        {text}
      </div>
    </div>
  );
}
