/**
 * Motion & Animation Utilities for Framer Motion
 * 
 * Curves and durations match design tokens.
 * Use these presets for consistency across all animations.
 */

export const MOTION = {
  /* ============================================
     EASING CURVES
     ============================================ */
  
  ease: {
    // Standard motion for most UI interactions
    standard: [0.4, 0, 0.2, 1],
    
    // Decelerate: natural, flowing exit
    out: [0.0, 0, 0.2, 1],
    
    // Accelerate: quick, snappy entrance
    in: [0.4, 0, 1, 1],
    
    // Bounce: playful, energetic
    bounce: [0.68, -0.55, 0.265, 1.55],
    
    // Subtle: for micro-interactions
    subtle: [0.25, 0.46, 0.45, 0.94],
  },

  /* ============================================
     DURATIONS (milliseconds)
     ============================================ */
  
  duration: {
    instant: 0,
    micro: 100,       // Icons, small state changes
    fast: 150,        // Hover states, short transitions
    normal: 200,      // Standard interactions
    slow: 300,        // Page transitions, modals
    glacial: 500,     // Elaborate animations
  },

  /* ============================================
     COMMON ANIMATIONS
     ============================================ */
  
  // Button press/release effect
  buttonPress: {
    scale: 0.98,
    transition: { duration: 100, ease: [0.4, 0, 0.2, 1] },
  },

  // Button hover effect
  buttonHover: {
    scale: 1.02,
    transition: { duration: 150, ease: [0.4, 0, 0.2, 1] },
  },

  // Fade in/out
  fadeIn: {
    opacity: 1,
    transition: { duration: 200, ease: [0.4, 0, 0.2, 1] },
  },

  fadeOut: {
    opacity: 0,
    transition: { duration: 200, ease: [0.0, 0, 0.2, 1] },
  },

  // Slide in from left (forward navigation)
  slideInLeft: {
    x: 0,
    opacity: 1,
    transition: { duration: 300, ease: [0.4, 0, 0.2, 1] },
  },

  slideOutRight: {
    x: 100,
    opacity: 0,
    transition: { duration: 300, ease: [0.0, 0, 0.2, 1] },
  },

  // Slide in from right (back navigation)
  slideInRight: {
    x: 0,
    opacity: 1,
    transition: { duration: 300, ease: [0.4, 0, 0.2, 1] },
  },

  slideOutLeft: {
    x: -100,
    opacity: 0,
    transition: { duration: 300, ease: [0.0, 0, 0.2, 1] },
  },

  // Bounce in (puzzle solved, success)
  bounceIn: {
    scale: 1,
    opacity: 1,
    transition: { duration: 400, ease: [0.68, -0.55, 0.265, 1.55] },
  },

  // Pulse effect (attention)
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1000,
      repeat: Infinity,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },

  // Subtle opacity pulse
  opacityPulse: {
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2000,
      repeat: Infinity,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },

  // Pop animation (like a button press)
  pop: {
    scale: [0.95, 1.05, 1],
    transition: {
      duration: 300,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },

  // Stagger children animations
  staggerContainer: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },

  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 300, ease: [0.4, 0, 0.2, 1] },
    },
  },
};

// Export individual curve values for CSS-in-JS
export const easingCurves = MOTION.ease;
export const durations = MOTION.duration;
