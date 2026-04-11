'use client';

import React from 'react';
import Link from 'next/link';
import { useTransitionOrchestrator } from './TransitionProvider';

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A drop-in replacement for Next.js <Link> that triggers the global GSAP Curtain transition.
 */
export function TransitionLink({ href, children, className = '', ...props }: TransitionLinkProps) {
  const { navigateTo } = useTransitionOrchestrator();

  const handleIntercept = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // Determine if the user is forcing a new tab native action
    const isModifierKey = e.ctrlKey || e.shiftKey || e.metaKey || e.altKey;
    if (isModifierKey || props.target === '_blank') {
      return; 
    }

    e.preventDefault();
    navigateTo(href);
  };

  return (
    <a 
      href={href} 
      onClick={handleIntercept} 
      className={`cursor-pointer ${className}`} 
      {...props}
    >
      {children}
    </a>
  );
}
