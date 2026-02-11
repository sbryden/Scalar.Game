/**
 * World and Scene Configuration
 * Basic world dimensions and size transformation settings
 */

// World configuration
export const WORLD_WIDTH = 8192;
export const WORLD_HEIGHT = 768;
export const CAMERA_PADDING = 256;

// Size configuration
export const SIZE_CONFIG = {
    small: {
        scale: 0.5,
        speedMultiplier: 1.5,
        jumpMultiplier: 1.2,
        color: 0xFF6B9D // Pink
    },
    normal: {
        scale: 1.0,
        speedMultiplier: 1.0,
        jumpMultiplier: 1.0,
        color: 0x00FF00 // Green
    },
    large: {
        scale: 1.5,
        speedMultiplier: 0.8,
        jumpMultiplier: 0.9,
        color: 0xFF4500 // Orange-red
    }
} as const;

export const SIZE_CHANGE_COOLDOWN = 500;

// Size transition animation configuration
export const SIZE_TRANSITION_DURATION = 750; // ms per phase (departure + arrival = ~1.5s total)
export const GROW_ZOOM_TARGET = 2.5; // Camera zooms in when growing (world appears to expand)
export const SHRINK_ZOOM_TARGET = 0.5; // Camera zooms out when shrinking (world appears to contract)
export const TRANSITION_EASE = 'Sine.InOut';

export type SizeKey = keyof typeof SIZE_CONFIG;
