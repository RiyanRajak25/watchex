'use client';

import React from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { TransitionProvider } from '@/components/TransitionProvider';
import { FlipPosterProvider } from '@/components/FlipPosterEngine';
import FilmGrain from '@/components/FilmGrain';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.08, syncTouch: true }}>
      <TransitionProvider>
        <FlipPosterProvider>
          {children}
          {/* Ambient Film Grain bound strictly to GSAP scroll velocity */}
          <FilmGrain />
        </FlipPosterProvider>
      </TransitionProvider>
    </ReactLenis>
  );
}
