'use client';

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';

// -------------------------------------------------------------
// Magnetic Hover Wrapper
// -------------------------------------------------------------
function MagneticWrapper({ children, onMouseEnter, onMouseLeave }: { children: React.ReactNode, onMouseEnter?: () => void, onMouseLeave?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * 0.35; // Magnetism strength
    const y = (e.clientY - (top + height / 2)) * 0.35;
    
    gsap.to(ref.current, {
      x,
      y,
      duration: 1,
      ease: 'power3.out',
      overwrite: 'auto'
    });
  };

  const handleMouseOut = () => {
    if (onMouseLeave) onMouseLeave();
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.3)',
      overwrite: 'auto'
    });
  };

  return (
    <div 
      className="inline-block cursor-pointer p-4 -m-4 relative z-20"
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseOut}
      onMouseEnter={onMouseEnter}
    >
      <div ref={ref} className="will-change-transform inline-block">
        {children}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Core Component Dependencies
// -------------------------------------------------------------
const LINKS = [
  { id: 1, title: 'Trending',   preview: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80' },
  { id: 2, title: 'Action',     preview: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=1600&q=80' },
  { id: 3, title: 'Sci-Fi',     preview: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80' },
  { id: 4, title: 'Horror',     preview: 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=1600&q=80' },
  { id: 5, title: 'Cinematica', preview: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&q=80' },
];

export function MenuOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const svgPathRef = useRef<SVGPathElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const linksContainerRef = useRef<HTMLDivElement>(null);
  const activeHoverBgRef = useRef<HTMLImageElement>(null);
  const bgWrapperRef = useRef<HTMLDivElement>(null);

  const [activePreview, setActivePreview] = useState<string | null>(null);

  // SVG Coordinate Morph Sequences (Top-Down execution mapping onto a 100x100 viewBox constraint)
  const initialPath  = 'M 0 0 L 100 0 L 100 0 Q 50 0 0 0 Z';
  const midPathIn    = 'M 0 0 L 100 0 L 100 60 Q 50 140 0 60 Z';
  const flatComplete = 'M 0 0 L 100 0 L 100 100 Q 50 100 0 100 Z';
  
  // Reversing logic pulls the curve back up dynamically 
  const midPathOut   = 'M 0 100 L 100 100 L 100 40 Q 50 -40 0 40 Z';
  const finalPathOut = 'M 0 100 L 100 100 L 100 100 Q 50 100 0 100 Z';

  useEffect(() => {
    if (!svgPathRef.current || !wrapperRef.current || !linksContainerRef.current) return;

    if (isOpen) {
      // Physically mount wrapper before sequence
      gsap.set(wrapperRef.current, { display: 'flex' });
      const links = linksContainerRef.current.querySelectorAll('.menu-link-wrapper');
      gsap.set(links, { yPercent: 120, rotation: 5 });

      const tl = gsap.timeline();

      // Ensure path is reset to zero state
      gsap.set(svgPathRef.current, { attr: { d: initialPath } });

      // Morphing execution downwards into liquid elasticity
      tl.to(svgPathRef.current, {
        attr: { d: midPathIn },
        duration: 0.5,
        ease: 'power4.in',
      })
      .to(svgPathRef.current, {
        attr: { d: flatComplete },
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
      })

      // Masked Stagger Link Reveal
      .to(links, {
        yPercent: 0,
        rotation: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.05
      }, "-=0.6"); // Overlaps tightly against the background resolving

    } else {
      // Exit sequence maps heavily upwards drawing out from bottom
      const links = linksContainerRef.current.querySelectorAll('.menu-link-wrapper');
      const tl = gsap.timeline();

      tl.to(links, {
        yPercent: -120,
        rotation: -5,
        duration: 0.4,
        ease: 'power3.in',
        stagger: 0.03
      })
      
      // Pulling upwards with a reverse liquid curve
      .to(svgPathRef.current, {
        attr: { d: midPathOut },
        duration: 0.4,
        ease: 'power4.in',
      }, "-=0.2")
      .to(svgPathRef.current, {
        attr: { d: finalPathOut },
        duration: 0.6,
        ease: 'power3.out',
        onComplete: () => {
           gsap.set(wrapperRef.current, { display: 'none' });
           gsap.set(svgPathRef.current, { attr: { d: initialPath } }); // cleanup
        }
      });
    }
  }, [isOpen]);

  // Hook mapping smooth image overlay fade
  useEffect(() => {
    if (!bgWrapperRef.current) return;
    if (activePreview) {
      gsap.to(bgWrapperRef.current, { opacity: 0.4, duration: 0.6, ease: 'power2.out', scale: 1.05 });
    } else {
      gsap.to(bgWrapperRef.current, { opacity: 0, duration: 0.6, ease: 'power2.out', scale: 1 });
    }
  }, [activePreview]);

  return (
    <div 
      ref={wrapperRef} 
      className="fixed inset-0 z-[1000] hidden items-center justify-center pointer-events-none"
    >
      {/* Absolute Inline Screen Curtain overriding layout matrix constraints safely via preserveAspectRatio none */}
      <svg 
        className="absolute inset-0 w-full h-[150vh] pointer-events-auto top-[-25vh] mix-blend-normal" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <path 
          ref={svgPathRef} 
          d={initialPath} 
          fill="#050505" 
        />
      </svg>

      {/* Dynamic Blurred Hover Backgrounds */}
      <div 
        ref={bgWrapperRef}
        className="absolute inset-0 pointer-events-none opacity-0 w-full h-full transform-gpu z-10"
      >
        {activePreview && (
          <img 
            src={activePreview}
            alt="Category Preview"
            className="w-full h-full object-cover blur-2xl block"
          />
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none bg-black/30 z-10" />

      <button 
        onClick={onClose}
        className="absolute top-8 right-8 z-[200] pointer-events-auto font-bold tracking-widest text-white/50 hover:text-white uppercase px-6 py-3 rounded-full border border-white/20 glass"
      >
        Close Cinematic Hub
      </button>

      {/* Navigation Stack */}
      <nav ref={linksContainerRef} className="relative z-50 flex flex-col items-center justify-center gap-6 pointer-events-auto">
        {LINKS.map((link) => (
          <div key={link.id} className="overflow-hidden p-2">
            <div className="menu-link-wrapper transform-gpu will-change-transform origin-bottom-left">
              <MagneticWrapper
                onMouseEnter={() => setActivePreview(link.preview)}
                onMouseLeave={() => setActivePreview(null)}
              >
                <div 
                  className="text-5xl md:text-8xl font-black uppercase text-white/90 hover:text-accent transition-colors drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] tracking-tighter mix-blend-screen"
                >
                  {link.title}
                </div>
              </MagneticWrapper>
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
