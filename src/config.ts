// World configuration
export const WORLD_WIDTH = 8192;
export const WORLD_HEIGHT = 768;
export const CAMERA_PADDING = 256;

// Size configuration
export const SIZE_CONFIG: Record<string, {
    scale: number;
    speedMultiplier: number;
    jumpMultiplier: number;
    color: number;
}> = {
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

// Dynamic spawn configuration
export const SPAWN_CONFIG = {
    // Zone definitions (as percentage of world width)
    zones: {
        start: { begin: 0, end: 0.2 },      // First 20% - sparse
        middle: { begin: 0.2, end: 0.7 },   // Middle 50% - dense
        end: { begin: 0.7, end: 0.95 }      // Last 25% (before boss) - sparse
    },
    // Density multipliers for each zone
    densityMultipliers: {
        start: 0.6,    // 40% fewer enemies
        middle: 1.4,   // 40% more enemies
        end: 0.7       // 30% fewer enemies
    },
    // Random variance in spawn positions
    positionVariance: {
        x: 50,         // +/- 50 pixels in X
        y: 100         // +/- 100 pixels in Y (for swimming enemies)
    },
    // Boss spawn configuration
    boss: {
        minDistanceFromEnd: 200,  // Minimum distance from world end
        maxDistanceFromEnd: 600,  // Maximum distance from world end
        spawnLast: true           // Ensure boss spawns last
    }
};

// Enemy configuration
export const ENEMY_CONFIG: Record<string, {
    width: number;
    height: number;
    color: number;
    speed: number;
    health: number;
    damage: number;
    xpReward: number;
    patrolDistance: number;
    knockbackResistance: number;
    aggroRangeMultiplier: number;
    aggroSpeedMultiplier: number;
}> = {
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
    boss_generic: {
        width: 90,
        height: 90,
        color: 0xFF0000, // Red
        speed: 80,
        health: 100,  // 5x base health
        damage: 15,
        xpReward: 150,
        patrolDistance: 400,
        knockbackResistance: 2.0,  // More resistant to knockback
        aggroRangeMultiplier: 8.0, // Larger aggro range
        aggroSpeedMultiplier: 1.3  // Slightly slower when aggroed
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
    boss_micro: {
        width: 90,
        height: 90,
        color: 0x00FF88, // Green-cyan (bacteria)
        speed: 60,
        health: 25,  // 5x base health
        damage: 8,
        xpReward: 60,
        patrolDistance: 300,
        knockbackResistance: 1.5,
        aggroRangeMultiplier: 8.0,
        aggroSpeedMultiplier: 1.3
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
    boss_fish: {
        width: 90,
        height: 90,
        color: 0x00BFFF, // Deep sky blue
        speed: 70,
        health: 75,  // 5x base health
        damage: 12,
        xpReward: 120,
        patrolDistance: 500,
        knockbackResistance: 1.5,
        aggroRangeMultiplier: 8.0,
        aggroSpeedMultiplier: 1.3
    },
    boss_shark: {
        width: 90,
        height: 90,
        color: 0x1E90FF, // Dodger blue
        speed: 80,
        health: 80,  // Slightly stronger than boss_fish
        damage: 14,
        xpReward: 130,
        patrolDistance: 550,
        knockbackResistance: 1.6,
        aggroRangeMultiplier: 8.0,
        aggroSpeedMultiplier: 1.4
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
    boss_crab: {
        width: 90,
        height: 90,
        color: 0xFF6347, // Tomato red (crab color)
        speed: 60,
        health: 125,  // 5x base health
        damage: 18,
        xpReward: 180,
        patrolDistance: 350,
        knockbackResistance: 2.2,  // Very resistant to knockback
        aggroRangeMultiplier: 8.0,
        aggroSpeedMultiplier: 1.3
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
    },
    boss_plankton: {
        width: 60,
        height: 60,
        color: 0x7FFFD4, // Aquamarine
        speed: 50,
        health: 15,  // 5x base health
        damage: 5,
        xpReward: 50,
        patrolDistance: 280,
        knockbackResistance: 1.2,
        aggroRangeMultiplier: 8.0,
        aggroSpeedMultiplier: 1.3
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

// Hard mode configuration
export const HARD_MODE_CONFIG = {
    enemyHealthMultiplier: 1.5,      // Enemies have 50% more HP
    enemySpeedMultiplier: 1.3,       // Enemies move 30% faster
    enemyAggroRangeMultiplier: 1.5,  // Enemies have 50% larger line of sight
    enemySpawnMultiplier: 1.5        // 50% more enemies spawn
};

export const GOD_MODE_CONFIG = {
    playerSpeedMultiplier: 4.0       // Player moves 4x faster in god mode
};
