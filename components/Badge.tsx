"use client";

import React from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
  ...props
}: BadgeProps) {
  const classes = [
    styles.badge,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {icon && <span className={styles.icon}>{icon}</span>}
    </span>
  );
}

/* Pill variant - commonly used for scores, counts */
export function Pill({ children, variant = 'neutral', size = 'md', className = '', ...props }: BadgeProps) {
  const classes = [
    styles.pill,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    className
  ].filter(Boolean).join(' ');

  return <span className={classes} {...props}>{children}</span>;
}
