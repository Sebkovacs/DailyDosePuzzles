"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MOTION } from '@/styles/motions';
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

/* SVG Dimension Tokens (from CSS variables) */
const DEFAULT_SVG_SIZE = 120;
const DEFAULT_RADIUS = 45;
const DEFAULT_STROKE_WIDTH = 6;

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
          duration: animated ? MOTION.duration.slow : MOTION.duration.instant,
          ease: MOTION.ease.out,
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
          transition={{ duration: MOTION.duration.fast, ease: MOTION.ease.subtle }}
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
  const radius = DEFAULT_RADIUS;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      className={styles.progressRing}
      width={DEFAULT_SVG_SIZE}
      height={DEFAULT_SVG_SIZE}
      viewBox={`0 0 ${DEFAULT_SVG_SIZE} ${DEFAULT_SVG_SIZE}`}
    >
      <circle
        className={styles.background}
        cx={DEFAULT_SVG_SIZE / 2}
        cy={DEFAULT_SVG_SIZE / 2}
        r={radius}
        fill="none"
        strokeWidth={DEFAULT_STROKE_WIDTH}
      />
      <motion.circle
        className={`${styles.progress} ${styles[`variant-${variant}`]}`}
        cx={DEFAULT_SVG_SIZE / 2}
        cy={DEFAULT_SVG_SIZE / 2}
        r={radius}
        fill="none"
        strokeWidth={DEFAULT_STROKE_WIDTH}
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: MOTION.duration.glacial, ease: MOTION.ease.standard }}
        strokeLinecap="round"
      />
      <text
        className={styles.text}
        x={DEFAULT_SVG_SIZE / 2}
        y={DEFAULT_SVG_SIZE / 2 + 5}
        textAnchor="middle"
        fontSize="16"
        fontWeight="600"
      >
        {Math.round(percentage)}%
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
