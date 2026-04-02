"use client";

import React from 'react';
import styles from './BrutalButton.module.css';

type BrutalButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BrutalButtonVariant;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function BrutalButton({
  children,
  variant = 'secondary',
  fullWidth = false,
  className = '',
  icon,
  ...props
}: BrutalButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    fullWidth && styles.fullWidth,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}