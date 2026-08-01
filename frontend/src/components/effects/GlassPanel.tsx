import type { HTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  intensity?: 'soft' | 'medium' | 'strong';
  interactive?: boolean;
}

const intensityClasses = {
  soft: 'glass-panel-soft',
  medium: 'glass-panel',
  strong: 'glass-panel-strong',
};

/**
 * Cross-browser CSS glass surface used throughout the storefront.
 * The enhanced Liquid Glass shader is reserved for the hero so that
 * product lists stay fast on mobile devices.
 */
export function GlassPanel({
  children,
  className,
  intensity = 'medium',
  interactive = false,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        intensityClasses[intensity],
        interactive && 'glass-panel-interactive',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
