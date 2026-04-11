'use client';

import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { Draggable } from 'gsap/Draggable';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip, Draggable);
}

// ------------------------------------------------------------------
// FLIP Modal Expansion Environment
// ------------------------------------------------------------------

export function FlipPosterGallery({ items }: { items: { id: string, src: string, title: string }[] }) {
  const [activeItem, setActiveItem] = useState<{ id: string, src: string, title: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Transition logic
  const handleItemClick = (item: any) => {
    // Capture state of ALL poster elements before DOM changes
    const state = Flip.getState('.flip-poster-target');
    
    // Mount the modal node by setting state
    setActiveItem(item);
    
    // In the next tick after React renders the modal visually, animate from the saved bounds
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.8,
        ease: 'power3.inOut',
        absolute: true,        // Uses absolute positioning during the flip to prevent layout jumps
        zIndex: 9999,
        // Scale and morph into position
        scale: true,
        onEnter: elements => gsap.fromTo(elements, { opacity: 0 }, { opacity: 1, duration: 0.4 }),
        onLeave: elements => gsap.to(elements, { opacity: 0, duration: 0.4 })
      });
    });
  };

  const closeModal = () => {
    const state = Flip.getState('.flip-poster-target');
    setActiveItem(null);
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.8,
        ease: 'power3.inOut',
        absolute: true,
        scale: true,
      });
    });
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8">
        {items.map(item => (
          <div 
            key={item.id}
            className="cursor-pointer overflow-hidden rounded-xl aspect-[2/3]"
            onClick={() => handleItemClick(item)}
          >
            {/* If this item is active, we unmount it from the grid so it can exist in the modal for FLIP */}
            {activeItem?.id !== item.id && (
              <img 
                src={item.src} 
                alt={item.title} 
                className="w-full h-full object-cover flip-poster-target" 
                data-flip-id={`poster-${item.id}`} 
              />
            )}
          </div>
        ))}
      </div>

      {/* Modal - The destination for our chosen item */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-12">
          <button 
            onClick={closeModal}
            className="absolute top-8 right-8 z-50 text-white hover:text-accent font-bold"
          >
            CLOSE
          </button>
          <div className="w-full max-w-5xl h-[80vh] flex flex-col md:flex-row gap-8 items-center bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
               <img 
                 src={activeItem.src} 
                 alt={activeItem.title} 
                 className="w-full h-full object-cover flip-poster-target" 
                 data-flip-id={`poster-${activeItem.id}`} 
               />
            </div>
            <div className="w-full md:w-1/2 p-8 text-white">
               <h2 className="text-4xl md:text-6xl font-black mb-4">{activeItem.title}</h2>
               <p className="text-gray-400">Cinematic detail expansion powered by GSAP FLIP. The element mathematically morphed from its exact bounds in the CSS grid, converting its matrix transforms into full bleed dimensions flawlessly.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ------------------------------------------------------------------
// Sub-liquid displacement filter for Hero Image breathing
// ------------------------------------------------------------------

export function LiquidDistortionImage({ src, alt }: { src: string, alt?: string }) {
  const filterId = useRef(`liquid-disp-${Math.random().toString(36).substr(2, 9)}`);
  const dispMapRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!dispMapRef.current || !turbulenceRef.current || !containerRef.current) return;

    // We animate the SVG filter's scale to distort the image radially.
    // Setting default zero scale:
    gsap.set(dispMapRef.current, { attr: { scale: 0 } });

    // Base loop to softly shift the fractal noise core to give it a breathing "liquid" pass
    const tl = gsap.to(turbulenceRef.current, {
      attr: { baseFrequency: '0.01 0.02' },
      duration: 10,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    const handleEnter = () => {
      gsap.to(dispMapRef.current, { attr: { scale: 30 }, duration: 1.5, ease: 'power3.out' });
    };

    const handleLeave = () => {
      gsap.to(dispMapRef.current, { attr: { scale: 0 }, duration: 1.5, ease: 'power3.out' });
    };

    const el = containerRef.current;
    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mouseleave', handleLeave);
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* SVG Asset definition injected at top of container */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <filter id={filterId.current} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence 
            ref={turbulenceRef}
            type="fractalNoise" 
            baseFrequency="0.02 0.01" 
            numOctaves="3" 
            result="noise" 
          />
          <feDisplacementMap 
            ref={dispMapRef}
            in="SourceGraphic" 
            in2="noise" 
            scale="0" 
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>
      </svg>

      <img 
        src={src} 
        alt={alt || "Distortion Graphic"} 
        className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-110"
        style={{ filter: `url(#${filterId.current})` }}
      />
    </div>
  );
}


// ------------------------------------------------------------------
// GSAP Draggable Carousel mapped closely to Native Edge Bouncing
// ------------------------------------------------------------------

export function DraggableCarousel({ items }: { items: { id: string, src: string }[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !trackRef.current) return;

    // Mounts an inertial horizontal dragger restricted exactly to the bounding wrapper constraints.
    const dragInstance = Draggable.create(trackRef.current, {
      type: "x",
      bounds: containerRef.current,
      edgeResistance: 0.85,    // Matches the heavy iOS edge-bounce drag feeling
      inertia: true,           // If GSAP InertiaPlugin is loaded locally, it utilizes physics-based throwing
      dragResistance: 0.1,
    });

    return () => {
      dragInstance[0]?.kill();
    };
  }, []);

  return (
    <div className="w-full bg-[#050505] p-8 overflow-hidden pointer-events-auto">
      <h3 className="text-3xl font-black text-white mb-6 tracking-tight">Similar Movies</h3>
      {/* Container constraint boundary */}
      <div 
        ref={containerRef} 
        className="relative w-full overflow-visible touch-none"
      >
        {/* Physical drag track */}
        <div ref={trackRef} className="flex gap-4 w-max inline-flex items-center cursor-grab active:cursor-grabbing">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="w-[200px] md:w-[300px] aspect-[2/3] rounded-2xl overflow-hidden pointer-events-none border border-white/10"
            >
              <img src={item.src} className="w-full h-full object-cover" alt="Draggable Item" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
