'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Extracts the dominant color from an image URL using a hidden canvas.
 */
const getDominantColor = (imageUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      // Downsample for performance
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);

      try {
        const imageData = ctx.getImageData(0, 0, 50, 50).data;
        let r = 0, g = 0, b = 0;
        const totalPixels = imageData.length / 4;

        for (let i = 0; i < imageData.length; i += 4) {
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
        }

        // Return a heavily darkened, desaturated version of the color for ambient glow
        resolve(`rgba(${Math.floor((r / totalPixels) * 0.4)}, ${Math.floor((g / totalPixels) * 0.4)}, ${Math.floor((b / totalPixels) * 0.4)}, 1)`);
      } catch (e) {
        resolve(null);
      }
    };
    
    img.onerror = () => resolve(null);
  });
};

/**
 * Hook to detect active movie section and shift background color
 */
export function useAmbientAtmosphere(sectionRef: React.RefObject<HTMLElement>, imageUrl?: string | null) {
  const isIntersecting = useRef(false);

  useEffect(() => {
    if (!sectionRef.current || !imageUrl) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        isIntersecting.current = entry.isIntersecting;

        if (entry.isIntersecting) {
          const dominantColor = await getDominantColor(imageUrl);
          
          if (dominantColor && isIntersecting.current) {
            // Smoothly animate the global CSS variable using GSAP
            gsap.to(document.documentElement, {
              '--ambient-glow': dominantColor,
              duration: 3.5,
              ease: 'power2.inOut',
              overwrite: 'auto'
            });
          }
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the poster is in view
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, [sectionRef, imageUrl]);
}
