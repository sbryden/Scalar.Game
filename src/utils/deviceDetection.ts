/**
 * Device Detection Utility
 * Detects iPad and other touch-capable devices
 */

/**
 * Check if the device is an iPad or touch-capable device
 */
export function isIPad(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    // Check for iPad specifically
    return userAgent.includes('ipad') || 
           // iPadOS 13+ pretends to be Mac, check for touch support
           (userAgent.includes('macintosh') && navigator.maxTouchPoints > 1);
}

/**
 * Check if the device supports touch input
 */
export function isTouchDevice(): boolean {
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - msMaxTouchPoints is IE-specific
        navigator.msMaxTouchPoints > 0
    );
}

/**
 * Check if touch controls should be enabled
 * Returns true for iPad and other touch devices
 */
export function shouldEnableTouchControls(): boolean {
    return isIPad() || isTouchDevice();
}

/**
 * Get the device type for logging/analytics
 */
export function getDeviceType(): 'ipad' | 'mobile' | 'desktop' {
    if (isIPad()) {
        return 'ipad';
    } else if (isTouchDevice()) {
        return 'mobile';
    }
    return 'desktop';
}
