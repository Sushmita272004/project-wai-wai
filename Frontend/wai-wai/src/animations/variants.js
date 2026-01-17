// Reusable Framer Motion variants for consistent interactions
// Usage: import { fadeInUp, slideIn, staggerContainer, pageTransition, interactive } from "./variants";

export const fadeInUp = (delay = 0, duration = 0.6, distance = 24) => ({
  initial: { opacity: 0, y: distance },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: [0.22, 1, 0.36, 1], delay },
  },
  exit: { opacity: 0, y: distance / 2, transition: { duration: 0.3 } },
});

export const slideIn = (
  direction = "left",
  delay = 0,
  distance = 32,
  duration = 0.6,
) => {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "left" || direction === "up" ? -1 : 1;
  return {
    initial: { opacity: 0, [axis]: sign * distance },
    animate: {
      opacity: 1,
      [axis]: 0,
      transition: { duration, ease: [0.22, 1, 0.36, 1], delay },
    },
    exit: {
      opacity: 0,
      [axis]: sign * (distance / 2),
      transition: { duration: 0.3 },
    },
  };
};

export const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
      when: "beforeChildren",
    },
  },
});

export const listItem = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.25 } },
});

// Page route transitions for React Router + AnimatePresence
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: 8, transition: { duration: 0.25 } },
};

// Hover, tap, focus interactions to spread onto motion components
export const interactive = {
  whileHover: { scale: 1.02, translateY: -1 },
  whileTap: { scale: 0.98 },
  whileFocus: { boxShadow: "0 0 0 4px rgba(14,165,233,0.15)" },
};

// Skeleton loading pulse
export const skeletonPulse = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: { duration: 1.2, repeat: Infinity },
  },
};

// Navbar / menu stagger reveal
export const navStagger = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const navItem = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.2 } },
};
