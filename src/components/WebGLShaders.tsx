'use client';

import React, { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useLenis } from '@studio-freight/react-lenis';

// ------------------------------------------------------------------
// 1. Liquid Displacement Hover Poster (WebGL Fragment Shader)
// ------------------------------------------------------------------

export function ShaderPoster({ src, className = '', alt = '' }: { src: string, className?: string, alt?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // Strict mounting footprint preventing memory leaks
    renderer.setPixelRatio(window.devicePixelRatio);
    el.appendChild(renderer.domElement);

    // Initialize uniforms linking mathematically to GSAP proxies
    const uniforms = {
      u_tex: { value: new THREE.TextureLoader().load(src) },
      u_hover: { value: 0.0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) }
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D u_tex;
        uniform float u_hover;
        uniform vec2 u_mouse;
        varying vec2 vUv;

        void main() {
          vec2 p = vUv;
          // Calculate distance radius from exact cursor coordinates
          float dist = distance(p, u_mouse);
          // Apply a heavily geometric sine wave rippling through the UV structure
          float ripple = sin(dist * 25.0 - u_hover * 10.0) * 0.04 * u_hover;
          
          vec2 displacedUV = p + (p - u_mouse) * ripple;
          gl_FragColor = texture2D(u_tex, displacedUV);
        }
      `
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // GSAP Physics Binding
    let animationFrameId: number;
    const hoverTo = gsap.quickTo(uniforms.u_hover, "value", { duration: 0.8, ease: "power3.out" });

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      // Normalize cursor coordinate geometry to WebGL normalized float system (0.0 -> 1.0)
      uniforms.u_mouse.value.x = (e.clientX - left) / width;
      uniforms.u_mouse.value.y = 1.0 - ((e.clientY - top) / height);
    };

    el.addEventListener('mouseenter', () => hoverTo(1));
    el.addEventListener('mouseleave', () => hoverTo(0));
    el.addEventListener('mousemove', onMouseMove);

    const render = () => {
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // Strict Memory Teardown Sequence
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      el.removeEventListener('mouseenter', () => hoverTo(1));
      el.removeEventListener('mouseleave', () => hoverTo(0));
      el.removeEventListener('mousemove', onMouseMove);
      
      mesh.geometry.dispose();
      mesh.material.dispose();
      renderer.dispose();
      
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [src]);

  return <div ref={containerRef} className={`relative overflow-hidden cursor-pointer ${className}`} title={alt} />;
}

// ------------------------------------------------------------------
// 2. Chromatic Aberration Canvas (Lenis Scroll Velocity Extractor)
// ------------------------------------------------------------------

export function ScrollChromaticCanvas({ src, className = '' }: { src: string, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Directly pull contextual normalized scroll math bypassing standard DOM polling overheads
  const lenis = useLenis(); 
  const uniformsRef = useRef({
    u_tex: { value: new THREE.Texture() },
    u_velocity: { value: 0.0 }
  });

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    
    // Core structural mounting
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    renderer.setPixelRatio(window.devicePixelRatio);
    el.appendChild(renderer.domElement);

    new THREE.TextureLoader().load(src, (tex) => {
      uniformsRef.current.u_tex.value = tex;
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform sampler2D u_tex;
        uniform float u_velocity;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          
          // Split RGB channels mathematically scaling exponentially across Lenis momentum bounds
          float aberrationOffset = u_velocity * 0.005;
          float r = texture2D(u_tex, vec2(uv.x, uv.y + aberrationOffset)).r;
          float g = texture2D(u_tex, uv).g;
          float b = texture2D(u_tex, vec2(uv.x, uv.y - aberrationOffset)).b;
          
          gl_FragColor = vec4(r, g, b, 1.0);
        }
      `
    });

    scene.add(new THREE.Mesh(geometry, material));

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height);
    };
    resize();
    window.addEventListener('resize', resize);

    let animationFrameId: number;
    const render = () => {
      // Pull velocity live directly from the underlying Lenis physical mapping proxy
      if (lenis && lenis.velocity) {
        // Apply an aggressive ease/dampening so the snap back feels elastic and physical
        gsap.to(uniformsRef.current.u_velocity, { 
           value: Math.min(Math.max(lenis.velocity, -20), 20), 
           duration: 0.3,
           ease: "power2.out",
           overwrite: 'auto'
        });
      }
      
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [src, lenis]);

  return <div ref={containerRef} className={`relative block w-full h-full object-cover ${className}`} />;
}

// ------------------------------------------------------------------
// 3. Digital "Noise Unveil" Intersection Reveal (Math Fragment Core)
// ------------------------------------------------------------------

export function NoiseUnveil({ src, className = '' }: { src: string, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    el.appendChild(renderer.domElement);

    const uniforms = {
      u_tex: { value: new THREE.TextureLoader().load(src) },
      u_progress: { value: 0.0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform sampler2D u_tex;
        uniform float u_progress;
        varying vec2 vUv;

        // Extreme geometric pseudo-random hash generator for organic simplex emulation
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
          vec4 texColor = texture2D(u_tex, vUv);
          
          // Generate raw native pixel noise mapping tracking geometric bounds strictly
          float noise = random(vUv * 15.0);
          
          // As progress scales mathematically toward 1, burn the noise matrix backward
          // hiding transparent pixel thresholds natively
          if(noise > u_progress * 1.5) {
             discard;
          }
          
          // Edge glow (Subtle cyan burn on the actual physical tearline)
          float edge = smoothstep(u_progress * 1.5 - 0.1, u_progress * 1.5, noise);
          vec4 burnColor = mix(texColor, vec4(0.0, 0.9, 1.0, 1.0), edge * 0.8);

          gl_FragColor = burnColor;
        }
      `
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height);
    };
    resize();
    window.addEventListener('resize', resize);

    // Orchestrate native DOM intersection logic dropping generic CSS transitions entirely
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
           gsap.to(uniforms.u_progress, { value: 1, duration: 2.5, ease: 'expo.inOut' });
           observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(el);

    let animationFrameId: number;
    const render = () => {
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
      mesh.geometry.dispose();
      mesh.material.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [src]);

  return <div ref={containerRef} className={`relative block w-full h-full object-cover shadow-2xl ${className}`} />;
}
