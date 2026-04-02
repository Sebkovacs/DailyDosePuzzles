"use client";

import React from 'react';
import styles from './Text.module.css';

type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type TextVariant = 'primary' | 'secondary' | 'muted' | 'inverse';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

interface TextProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'p' | 'span' | 'div';
  size?: TextSize;
  variant?: TextVariant;
  weight?: TextWeight;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function Text({
  as = 'p',
  size = 'md',
  variant = 'primary',
  weight = 'regular',
  align = 'left',
  className = '',
  ...props
}: TextProps) {
  const Component = as as React.ElementType;
  
  const classes = [
    styles.text,
    styles[`size-${size}`],
    styles[`variant-${variant}`],
    styles[`weight-${weight}`],
    styles[`align-${align}`],
    className
  ].filter(Boolean).join(' ');

  return <Component className={classes} {...props} />;
}

/* Heading Components */
export function Heading1({ children, className = '', ...props }: Omit<TextProps, 'as' | 'size'>) {
  return <Text as="h1" size="4xl" weight="bold" className={className} {...props}>{children}</Text>;
}

export function Heading2({ children, className = '', ...props }: Omit<TextProps, 'as' | 'size'>) {
  return <Text as="h2" size="3xl" weight="bold" className={className} {...props}>{children}</Text>;
}

export function Heading3({ children, className = '', ...props }: Omit<TextProps, 'as' | 'size'>) {
  return <Text as="h3" size="2xl" weight="semibold" className={className} {...props}>{children}</Text>;
}

export function Heading4({ children, className = '', ...props }: Omit<TextProps, 'as' | 'size'>) {
  return <Text as="h4" size="xl" weight="semibold" className={className} {...props}>{children}</Text>;
}

/* Body Text Components */
export function Body({ children, className = '', ...props }: Omit<TextProps, 'as' | 'size'>) {
  return <Text as="p" size="md" className={className} {...props}>{children}</Text>;
}

export function Label({ children, className = '', ...props }: Omit<TextProps, 'as' | 'size'>) {
  return <Text as="label" size="sm" weight="semibold" className={className} {...props}>{children}</Text>;
}

export function Caption({ children, className = '', ...props }: Omit<TextProps, 'as' | 'size'>) {
  return <Text as="span" size="xs" variant="muted" className={className} {...props}>{children}</Text>;
}

export function Mono({ children, className = '', ...props }: Omit<TextProps, 'as'>) {
  return <Text as="code" className={`${styles.mono} ${className}`} {...props}>{children}</Text>;
}
