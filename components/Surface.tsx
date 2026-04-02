"use client";

import React from 'react';
import styles from './Surface.module.css';

type SurfaceElevation = 'flat' | 'raised' | 'lifted' | 'floating';
type SurfaceIntent = 'default' | 'accent' | 'success' | 'warning' | 'danger';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article';
  elevation?: SurfaceElevation;
  intent?: SurfaceIntent;
  bordered?: boolean;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export function Surface({
  as = 'div',
  elevation = 'raised',
  intent = 'default',
  bordered = true,
  padding = 'md',
  className = '',
  ...props
}: SurfaceProps) {
  const Component = as as React.ElementType;
  
  const classes = [
    styles.surface,
    styles[`elevation-${elevation}`],
    styles[`intent-${intent}`],
    bordered && styles.bordered,
    styles[`padding-${padding}`],
    className
  ].filter(Boolean).join(' ');

  return <Component className={classes} {...props} />;
}

/* Card abstraction (specialized surface) */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function Card({ header, footer, children, className = '', ...props }: CardProps) {
  return (
    <Surface elevation="raised" className={className} {...props}>
      {header && <div className={styles.cardHeader}>{header}</div>}
      <div className={styles.cardContent}>{children}</div>
      {footer && <div className={styles.cardFooter}>{footer}</div>}
    </Surface>
  );
}

/* Divider */
export function Divider({ className = '', ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={`${styles.divider} ${className}`} {...props} />;
}
