/**
 * Common Tailwind CSS class strings for reusable UI patterns.
 */

/**
 * Base classes for a card with a glassmorphism effect.
 * Includes background, blur, shadow, border, and rounding.
 */
export const glassmorphismCardBase = 
  'bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl shadow-lg border border-white/30 dark:border-gray-700/30 rounded-2xl overflow-hidden';

/**
 * Animation classes for card hover effects.
 * Includes translate, shadow, and custom animations like shine and border pulse.
 * Meant to be used in conjunction with `group` utility class on the card.
 */
export const cardHoverAnimations = 
  'transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl group-hover:shadow-xl hover-card-animation hover-shine hover-border-pulse';

/**
 * Combined classes for a standard animated glassmorphism card.
 */
export const animatedGlassCard = `${glassmorphismCardBase} ${cardHoverAnimations}`;

// Add comments to explain each constant and its purpose.
// Ensure that the class strings are accurate and reflect the intended styles. 


