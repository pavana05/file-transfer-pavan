/**
 * Haptic Feedback Utility for PWA
 * Uses the Vibration API for basic haptic feedback on mobile devices
 */

// Check if vibration API is supported
const isVibrationSupported = (): boolean => {
  return 'vibrate' in navigator || 'vibration' in navigator;
};

/**
 * Haptic feedback patterns
 */
export const HapticPattern = {
  // Light tap - for button presses
  LIGHT: [10],
  
  // Medium tap - for interactions
  MEDIUM: [20],
  
  // Success - for successful actions
  SUCCESS: [10, 50, 10, 50, 30],
  
  // Error - for errors or warnings
  ERROR: [50, 100, 50],
  
  // Selection - for selecting items
  SELECTION: [5],
  
  // Long press
  LONG_PRESS: [30],
  
  // Notification
  NOTIFICATION: [10, 100, 10, 100, 50],
};

/**
 * Trigger haptic feedback with a specific pattern
 * @param pattern - Vibration pattern (number for single vibration, array for pattern)
 */
export const triggerHaptic = (pattern: number | number[] = HapticPattern.LIGHT): void => {
  if (!isVibrationSupported()) {
    return; // Silently fail if not supported
  }

  try {
    // Vibrate with the specified pattern
    if (Array.isArray(pattern)) {
      navigator.vibrate([...pattern]);
    } else {
      navigator.vibrate(pattern);
    }
  } catch (error) {
    // Silently catch any errors
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Pre-defined haptic feedback functions for common interactions
 */
export const haptics = {
  /**
   * Light tap feedback for button clicks
   */
  light: () => triggerHaptic([...HapticPattern.LIGHT]),

  /**
   * Medium tap feedback for interactions
   */
  medium: () => triggerHaptic([...HapticPattern.MEDIUM]),

  /**
   * Success feedback for successful operations
   */
  success: () => triggerHaptic([...HapticPattern.SUCCESS]),

  /**
   * Error feedback for errors
   */
  error: () => triggerHaptic([...HapticPattern.ERROR]),

  /**
   * Selection feedback for selecting items
   */
  selection: () => triggerHaptic([...HapticPattern.SELECTION]),

  /**
   * Long press feedback
   */
  longPress: () => triggerHaptic([...HapticPattern.LONG_PRESS]),

  /**
   * Notification feedback
   */
  notification: () => triggerHaptic([...HapticPattern.NOTIFICATION]),
};

/**
 * React hook for haptic feedback
 */
export const useHaptic = () => {
  return {
    triggerHaptic,
    haptics,
    isSupported: isVibrationSupported(),
  };
};
