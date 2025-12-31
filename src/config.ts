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
        patrolDistance: 300,
        knockbackResistance: 1.0,  // 1.0 = normal knockback, 0 = immune, >1 = takes more knockback
        aggroRangeMultiplier: 5.0, // Aggro range = enemy size * this multiplier
        aggroSpeedMultiplier: 1.5, // Speed when aggroed = base speed * this multiplier
        jumpVerticalThreshold: 50,   // Minimum vertical distance to trigger jump
        jumpHorizontalThreshold: 200, // Maximum horizontal distance to allow jump
        jumpVelocity: -250,          // Velocity applied when jumping (negative = upward)
        // Appearance
        spriteScale: 0.2,            // Scale of the enemy sprite
        bounce: 0.2,                 // Bounce physics value
        // Health bar
        healthBarWidth: 30,          // Width of health bar
        healthBarHeight: 4,          // Height of health bar
        healthBarOffsetY: 10,        // Additional offset for health bar Y position
        healthBarBgColor: 0x333333,  // Background color of health bar
        healthBarColor: 0xff0000,    // Foreground color of health bar
        healthBarDepth: 50,          // Render depth of health bar
        // Screen bounds
        screenBoundsTop: 50,         // Top boundary for enemies
        groundY: 750,                // Ground Y position
        // Patrol behavior (not used for ground enemies)
        floatAngleIncrement: 0.02,   // How fast the float angle changes
        floatSpeedMultiplier: 0.5,   // Multiplier for patrol speed during floating
        verticalAmplitude: 50,       // Amplitude of vertical floating movement
        patrolJumpProbability: 0.0,  // Probability of jumping during patrol (per frame)
        patrolJumpVelocity: -150     // Velocity for patrol jumps
    },
    micro: {
        width: 30,
        height: 30,
        color: 0x00FF88, // Green-cyan (bacteria)
        speed: 60,
        health: 5,
        damage: 5,
        xpReward: 10,
        patrolDistance: 200,
        knockbackResistance: 0.8,  // Lighter, knocked back less
        aggroRangeMultiplier: 5.0, // Aggro range = enemy size * this multiplier
        aggroSpeedMultiplier: 1.5, // Speed when aggroed = base speed * this multiplier
        jumpVerticalThreshold: 50,   // Minimum vertical distance to trigger jump (not used for swimming enemies)
        jumpHorizontalThreshold: 200, // Maximum horizontal distance to allow jump (not used for swimming enemies)
        jumpVelocity: -250,          // Velocity applied when jumping (not used for swimming enemies)
        // Appearance
        spriteScale: 0.2,            // Scale of the enemy sprite
        bounce: 0.2,                 // Bounce physics value
        // Health bar
        healthBarWidth: 30,          // Width of health bar
        healthBarHeight: 4,          // Height of health bar
        healthBarOffsetY: 10,        // Additional offset for health bar Y position
        healthBarBgColor: 0x333333,  // Background color of health bar
        healthBarColor: 0xff0000,    // Foreground color of health bar
        healthBarDepth: 50,          // Render depth of health bar
        // Screen bounds
        screenBoundsTop: 50,         // Top boundary for enemies
        groundY: 750,                // Ground Y position (not used for swimming enemies)
        // Patrol behavior (for swimming enemies)
        floatAngleIncrement: 0.02,   // How fast the float angle changes
        floatSpeedMultiplier: 0.5,   // Multiplier for patrol speed during floating
        verticalAmplitude: 50,       // Amplitude of vertical floating movement
        patrolJumpProbability: 0.0,  // Probability of jumping during patrol (not used for swimming enemies)
        patrolJumpVelocity: -150     // Velocity for patrol jumps (not used for swimming enemies)
    },
    fish: {
        width: 30,
        height: 30,
        color: 0x00BFFF, // Deep sky blue
        speed: 70,
        health: 15,
        damage: 8,
        xpReward: 20,
        patrolDistance: 400,
        knockbackResistance: 0.7,  // Swims smoothly, less affected by knockback
        aggroRangeMultiplier: 5.0, // Aggro range = enemy size * this multiplier
        aggroSpeedMultiplier: 1.5, // Speed when aggroed = base speed * this multiplier
        jumpVerticalThreshold: 50,   // Minimum vertical distance to trigger jump (not used for swimming enemies)
        jumpHorizontalThreshold: 200, // Maximum horizontal distance to allow jump (not used for swimming enemies)
        jumpVelocity: -250,          // Velocity applied when jumping (not used for swimming enemies)
        // Appearance
        spriteScale: 0.2,            // Scale of the enemy sprite
        bounce: 0.2,                 // Bounce physics value
        // Health bar
        healthBarWidth: 30,          // Width of health bar
        healthBarHeight: 4,          // Height of health bar
        healthBarOffsetY: 10,        // Additional offset for health bar Y position
        healthBarBgColor: 0x333333,  // Background color of health bar
        healthBarColor: 0xff0000,    // Foreground color of health bar
        healthBarDepth: 50,          // Render depth of health bar
        // Screen bounds
        screenBoundsTop: 50,         // Top boundary for enemies
        groundY: 750,                // Ground Y position (not used for swimming enemies)
        // Patrol behavior (for swimming enemies)
        floatAngleIncrement: 0.02,   // How fast the float angle changes
        floatSpeedMultiplier: 0.5,   // Multiplier for patrol speed during floating
        verticalAmplitude: 50,       // Amplitude of vertical floating movement
        patrolJumpProbability: 0.0,  // Probability of jumping during patrol (not used for swimming enemies)
        patrolJumpVelocity: -150     // Velocity for patrol jumps (not used for swimming enemies)
    },
    crab: {
        width: 30,
        height: 30,
        color: 0xFF6347, // Tomato red (crab color)
        speed: 60,
        health: 25,
        damage: 12,
        xpReward: 30,
        patrolDistance: 250,
        knockbackResistance: 1.2,  // Heavier, more resistant to knockback
        aggroRangeMultiplier: 5.0, // Aggro range = enemy size * this multiplier
        aggroSpeedMultiplier: 1.5, // Speed when aggroed = base speed * this multiplier
        jumpVerticalThreshold: 50,   // Minimum vertical distance to trigger jump
        jumpHorizontalThreshold: 200, // Maximum horizontal distance to allow jump
        jumpVelocity: -250,          // Velocity applied when jumping (negative = upward)
        // Appearance
        spriteScale: 0.2,            // Scale of the enemy sprite
        bounce: 0.2,                 // Bounce physics value
        // Health bar
        healthBarWidth: 30,          // Width of health bar
        healthBarHeight: 4,          // Height of health bar
        healthBarOffsetY: 10,        // Additional offset for health bar Y position
        healthBarBgColor: 0x333333,  // Background color of health bar
        healthBarColor: 0xff0000,    // Foreground color of health bar
        healthBarDepth: 50,          // Render depth of health bar
        // Screen bounds
        screenBoundsTop: 50,         // Top boundary for enemies
        groundY: 750,                // Ground Y position
        // Patrol behavior (for ground enemies with jumps)
        floatAngleIncrement: 0.02,   // How fast the float angle changes (not used for ground enemies)
        floatSpeedMultiplier: 0.5,   // Multiplier for patrol speed (not used for ground enemies)
        verticalAmplitude: 50,       // Amplitude of vertical movement (not used for ground enemies)
        patrolJumpProbability: 0.01, // Probability of jumping during patrol (per frame)
        patrolJumpVelocity: -150     // Velocity for patrol jumps
    },
    plankton: {
        width: 20,
        height: 20,
        color: 0x7FFFD4, // Aquamarine
        speed: 50,
        health: 3,
        damage: 3,
        xpReward: 8,
        patrolDistance: 180,
        knockbackResistance: 0.5,  // Very light, easily knocked back
        aggroRangeMultiplier: 5.0, // Aggro range = enemy size * this multiplier
        aggroSpeedMultiplier: 1.5, // Speed when aggroed = base speed * this multiplier
        jumpVerticalThreshold: 50,   // Minimum vertical distance to trigger jump (not used for swimming enemies)
        jumpHorizontalThreshold: 200, // Maximum horizontal distance to allow jump (not used for swimming enemies)
        jumpVelocity: -250,          // Velocity applied when jumping (not used for swimming enemies)
        // Appearance
        spriteScale: 0.2,            // Scale of the enemy sprite
        bounce: 0.2,                 // Bounce physics value
        // Health bar
        healthBarWidth: 30,          // Width of health bar
        healthBarHeight: 4,          // Height of health bar
        healthBarOffsetY: 10,        // Additional offset for health bar Y position
        healthBarBgColor: 0x333333,  // Background color of health bar
        healthBarColor: 0xff0000,    // Foreground color of health bar
        healthBarDepth: 50,          // Render depth of health bar
        // Screen bounds
        screenBoundsTop: 50,         // Top boundary for enemies
        groundY: 750,                // Ground Y position (not used for swimming enemies)
        // Patrol behavior (for swimming enemies)
        floatAngleIncrement: 0.02,   // How fast the float angle changes
        floatSpeedMultiplier: 0.3,   // Multiplier for patrol speed during floating (plankton is slower)
        verticalAmplitude: 30,       // Amplitude of vertical floating movement (plankton has smaller amplitude)
        patrolJumpProbability: 0.0,  // Probability of jumping during patrol (not used for swimming enemies)
        patrolJumpVelocity: -150     // Velocity for patrol jumps (not used for swimming enemies)
    }
};

// Player combat configuration
export const PLAYER_COMBAT_CONFIG = {
    baseMeleeDamage: 5,           // Base damage when colliding with enemies
    baseKnockbackForce: 300,      // Base knockback force applied to enemies
    enemyToPlayerCooldown: 500,   // Milliseconds between enemy damaging player
    playerToEnemyCooldown: 100,   // Milliseconds between player damaging enemy
    invulnerabilityDuration: 150, // How long player flashes after taking damage (ms)
    stunDuration: 500             // How long entities are stunned after knockback (ms)
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
