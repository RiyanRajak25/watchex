'use client';

import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { useLenis } from '@studio-freight/react-lenis';
import Link from 'next/link';

interface VelocityGridProps {
  items: { id: string | number; src: string; title?: string; href?: string }[];
}

export function VelocityGrid({ items }: VelocityGridProps) {
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lenis = useLenis();
  
  // A GSAP proxy to tween the skew mathematically to allow graceful elastic interruptions
  const proxy = useRef({ skew: 0 });

  useLayoutEffect(() => {
    if (!gridWrapperRef.current) return;

    // Direct setter bypassing standard tween generation tracking for maximum high-frame rendering
    const skewSetter = gsap.quickSetter(gridWrapperRef.current, 'skewY', 'deg');

    const updateFrame = () => {
      // 1. Scroll-Skewing Logic & Context Extraction
      const velocity = lenis?.velocity || 0;
      
      // Calculate un-dampened target but Clamp it strictly mathematically
      const rawTargetSkew = velocity * 0.15;
      const targetSkew = gsap.utils.clamp(-7, 7, rawTargetSkew);

      // 2. Elastic Recovery
      if (Math.abs(velocity) < 0.1 && Math.abs(proxy.current.skew) > 0.01) {
        // Scroll has physically stopped: Snap back dynamically using high-tension elastic native spring
        gsap.to(proxy.current, {
          skew: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto',
          onUpdate: () => skewSetter(proxy.current.skew)
        });
      } else if (Math.abs(velocity) >= 0.1) {
        // Heavy Scrolling: Override elasticity, glue tightly to velocity metrics (small smooth lag)
        gsap.to(proxy.current, {
          skew: targetSkew,
          duration: 0.1,
          overwrite: 'auto',
          onUpdate: () => skewSetter(proxy.current.skew)
        });
      }

      // 3. Depth Scaling & Brightness Dimming via Central Proximity Check
      // This is highly performant mathematically inside requestAnimationFrame vs heavy intersection observers
      const windowCenterY = window.innerHeight / 2;
      const maxDistance = window.innerHeight; // Normalise over screen bounds

      itemsRef.current.forEach((item) => {
        if (!item) return;
        
        const rect = item.getBoundingClientRect();
        const itemCenterY = rect.top + rect.height / 2;
        
        const rawDistance = Math.abs(windowCenterY - itemCenterY);
        // Clamp distance factor cleanly from 0 (dead center) securely to 1 (far edge)
        const ratio = gsap.utils.clamp(0, 1, rawDistance / maxDistance);

        // Center = ratio 0: Scale 1.05, Opacity 1.0
        // Edges = ratio 1: Scale 0.9, Opacity 0.5
        const scale = gsap.utils.interpolate(1.05, 0.9, ratio);
        
        // We square ratio (e.g., 0.5 * 0.5 = 0.25) so it dims faster only near edges,
        // maintaining high focus near center limits smoothly.
        const opacity = gsap.utils.interpolate(1.0, 0.5, gsap.parseEase('power2.in')(ratio));

        gsap.set(item, {
          scale,
          opacity,
          transformOrigin: 'center center'
        });
      });
    };

    gsap.ticker.add(updateFrame);
    return () => gsap.ticker.remove(updateFrame);
  }, [lenis]);

  return (
    <div className="w-full relative py-32 overflow-hidden pointer-events-auto">
      <div 
        ref={gridWrapperRef} 
        className="w-full max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12 will-change-transform"
      >
        {items.map((item, index) => (
          <div 
            key={item.id}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            className="flex flex-col gap-4 will-change-[transform,opacity]"
          >
            {item.href ? (
              <Link href={item.href} className="block w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img 
                  src={item.src} 
                  alt={item.title || "Poster"} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </Link>
            ) : (
              <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img 
                  src={item.src} 
                  alt={item.title || "Poster"} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {item.title && (
              <h3 className="text-white text-lg font-bold text-center tracking-wide line-clamp-1">
                {item.title}
              </h3>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
