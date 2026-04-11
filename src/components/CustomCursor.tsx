'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!cursorRef.current || !followerRef.current) return;

    // Use GSAP quickTo for zero-latency, highly performant tracking
    const xTo = gsap.quickTo(cursorRef.current, 'x', { duration: 0, ease: 'none' });
    const yTo = gsap.quickTo(cursorRef.current, 'y', { duration: 0, ease: 'none' });
    
    // Follower uses a slightly delayed quickTo for the elastic effect
    const fXTo = gsap.quickTo(followerRef.current, 'x', { duration: 0.4, ease: 'power3' });
    const fYTo = gsap.quickTo(followerRef.current, 'y', { duration: 0.4, ease: 'power3' });

    const moveCursor = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      fXTo(e.clientX);
      fYTo(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleHoverEnter = () => {
      gsap.to(cursorRef.current, { scale: 0, duration: 0.2 });
      gsap.to(followerRef.current, { scale: 1.5, backgroundColor: '#ffffff', duration: 0.3 });
    };
    const handleHoverLeave = () => {
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
      gsap.to(followerRef.current, { scale: 1, backgroundColor: 'transparent', duration: 0.3 });
    };

    window.addEventListener('mousemove', moveCursor);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    const interactiveSelectors = 'a, button, input, textarea, [role="button"]';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', handleHoverEnter);
      el.addEventListener('mouseleave', handleHoverLeave);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      
      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverEnter);
        el.removeEventListener('mouseleave', handleHoverLeave);
      });
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white pointer-events-none z-[9999] style-exclusion"
        style={{
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'exclusion'
        }}
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] border border-white/80"
        style={{
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'exclusion'
        }}
      />
    </>
  );
}
