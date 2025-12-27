// World configuration
export const WORLD_WIDTH = 16384;
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
        speedMultiplier: 0.7,
        jumpMultiplier: 0.8,
        color: 0xFF8C00 // Orange
    }
};

export const SIZE_CHANGE_COOLDOWN = 500;

// Enemy configuration
export const ENEMY_CONFIG = {
    generic: {
        width: 30,
        height: 30,
        color: 0xFF0000, // Red
        speed: 80,
        health: 20,
        damage: 10,
        xpReward: 25,
        patrolDistance: 300
    }
};

// Projectile configuration
export const PROJECTILE_CONFIG = {
    basic: {
        width: 10,
        height: 10,
        color: 0xFFFF00, // Yellow
        speed: 300,
        damage: 10,
        cooldown: 500 // milliseconds between shots
    }
};
