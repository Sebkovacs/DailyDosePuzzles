"use client";

import React from 'react';
import { motion } from 'framer-motion';
import styles from './ProgressIndicator.module.css';

type ProgressType = 'bar' | 'dots' | 'ring';
type ProgressVariant = 'default' | 'success' | 'warning' | 'danger';

interface ProgressIndicatorProps {
  type?: ProgressType;
  variant?: ProgressVariant;
  value?: number; /* 0-100 for bar */
  max?: number;   /* For dots/segments */
  current?: number;
  animated?: boolean;
}

export function ProgressBar({
  variant = 'default',
  value = 0,
  animated = true,
}: Omit<ProgressIndicatorProps, 'type' | 'max' | 'current'>) {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`${styles.progressBar} ${styles[`variant-${variant}`]}`}>
      <motion.div
        className={styles.fill}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: animated ? 0.6 : 0,
          ease: 'easeOut',
        }}
      />
    </div>
  );
}

export function ProgressDots({
  max = 5,
  current = 0,
  variant = 'default',
}: Omit<ProgressIndicatorProps, 'type' | 'value' | 'animated'>) {
  return (
    <div className={styles.progressDots}>
      {Array.from({ length: max }).map((_, i) => (
        <motion.div
          key={i}
          className={`${styles.dot} ${i < current ? styles.filled : styles.empty} ${styles[`variant-${variant}`]}`}
          animate={{ scale: i < current ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        />
      ))}
    </div>
  );
}

export function ProgressRing({
  value = 0,
  variant = 'default',
}: Omit<ProgressIndicatorProps, 'type' | 'max' | 'current' | 'animated'>) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg className={styles.progressRing} width="120" height="120" viewBox="0 0 120 120">
      <circle
        className={styles.background}
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        strokeWidth="6"
      />
      <motion.circle
        className={`${styles.progress} ${styles[`variant-${variant}`]}`}
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        strokeLinecap="round"
      />
      <text
        className={styles.text}
        x="60"
        y="65"
        textAnchor="middle"
        fontSize="16"
        fontWeight="600"
      >
        {percentage}%
      </text>
    </svg>
  );
}

export function ProgressIndicator(props: ProgressIndicatorProps) {
  const { type = 'bar' } = props;

  switch (type) {
    case 'dots':
      return <ProgressDots {...props} />;
    case 'ring':
      return <ProgressRing {...props} />;
    case 'bar':
    default:
      return <ProgressBar {...props} />;
  }
}
