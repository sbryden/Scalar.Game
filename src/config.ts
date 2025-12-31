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
        aggroSpeedMultiplier: 1.5  // Speed when aggroed = base speed * this multiplier
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
        aggroSpeedMultiplier: 1.5  // Speed when aggroed = base speed * this multiplier
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
        aggroSpeedMultiplier: 1.5  // Speed when aggroed = base speed * this multiplier
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
        aggroSpeedMultiplier: 1.5  // Speed when aggroed = base speed * this multiplier
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
        aggroSpeedMultiplier: 1.5  // Speed when aggroed = base speed * this multiplier
    }
};

// Player combat configuration
export const PLAYER_COMBAT_CONFIG = {
    baseMeleeDamage: 5,           // Base damage when colliding with enemies
    baseKnockbackForce: 300,      // Base knockback force applied to enemies
    enemyToPlayerCooldown: 500,   // Milliseconds between enemy damaging player
    playerToEnemyCooldown: 100,   // Milliseconds between player damaging enemy
    invulnerabilityDuration: 150, // How long player flashes after taking damage (ms)
    stunDuration: 500,            // How long entities are stunned after knockback (ms)
    // Melee attack mode configuration
    meleeModePlayerDamage: 15,        // Damage dealt to enemy in melee mode (3x base)
    passiveModePlayerDamage: 3,       // Damage dealt when moving toward enemy without melee mode
    meleeModeDamageReduction: 0.25,   // Player takes 25% damage in melee mode
    requiredApproachSpeed: 50         // Minimum velocity toward enemy for passive damage
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
