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

// Combat configuration
export const COMBAT_CONFIG = {
    godMode: {
        damage: 1000, // Damage dealt in god mode (projectiles and collisions)
        health: 10000000 // Health in god mode
    },
    visual: {
        enemyFlashDuration: 100, // How long enemy flashes when hit (ms)
        playerFlashDuration: 150, // Already in PLAYER_COMBAT_CONFIG but needed here for reference
        cameraShakeDuration: 100, // Duration of camera shake on damage (ms)
        cameraShakeIntensityMelee: 0.003, // Shake intensity in melee mode
        cameraShakeIntensityNormal: 0.005 // Shake intensity in normal mode
    },
    stun: {
        velocityDecay: 0.95 // Velocity decay multiplier during stun (per frame)
    },
    playerKnockback: {
        force: 250, // Base force applied to player when hit
        verticalMultiplier: 0.5 // Multiplier for vertical knockback
    }
};

// Physics configuration
export const PHYSICS_CONFIG = {
    underwater: {
        speedMultiplier: 0.5 // Projectiles move at half speed underwater
    },
    projectile: {
        spawnOffsetX: 40, // Horizontal offset from player center for projectile spawn
        heightRatio: 1/6, // Projectile spawns at 1/6 height from top of tank
        maxRangeMultiplier: 1.5, // Max range = screen width * this value
        depth: 0 // Z-depth for projectile rendering
    },
    player: {
        baseDisplayScale: 0.25, // Base scale for the tank sprite
        sizeChangeJumpVelocity: -200 // Y velocity applied when changing size
    },
    enemy: {
        baseScale: 0.2, // Base scale for enemy sprites
        bossScaleMultiplier: 3, // Boss enemies are 3x base scale
        bounce: 0.2, // Bounce value for enemy physics
        groundY: 750, // Y coordinate of ground level
        screenTopBoundary: 50, // Y coordinate of top screen boundary
        screenBottomBoundary: 750, // Y coordinate of bottom screen boundary
        aggroJump: {
            verticalThreshold: 50, // Jump if player is this many pixels above
            horizontalThreshold: 200, // Only jump if player within this horizontal distance
            velocity: -250 // Y velocity for aggro jump
        },
        patrol: {
            floatAngleIncrement: 0.02, // How fast the float angle changes per frame
            floatSpeedPlankton: 0.3, // Speed multiplier for plankton floating
            floatSpeedOther: 0.5, // Speed multiplier for other swimming enemies
            verticalAmplitudePlankton: 30, // Vertical amplitude for plankton floating
            verticalAmplitudeOther: 50, // Vertical amplitude for other swimming enemies
            crabJumpProbability: 0.01, // Probability per frame that crab will jump
            crabJumpVelocity: -150 // Y velocity for crab jump
        }
    }
};

// Visual configuration
export const VISUAL_CONFIG = {
    screenWidth: 1024, // Reference screen width for calculations
    healthBar: {
        width: 30, // Width of enemy health bars
        height: 4, // Height of enemy health bars
        offsetY: 10, // Offset above enemy for health bar placement
        depth: 50, // Z-depth for health bar rendering
        centerDivisor: 2, // Divisor for calculating health bar horizontal center (barWidth / 2)
        displayOriginY: 2 // Y origin point for health bar display
    },
    fishSpawn: {
        fishTextureThreshold: 0.25 // Probability threshold for water_enemy_fish_1 vs needle fish
    }
};

// XP and progression configuration
export const XP_CONFIG = {
    orb: {
        radius: 6, // Radius of XP orb circles
        color: 0xFFD700, // Gold color for XP orbs
        defaultValue: 25, // Default XP value if not specified
        bounce: 0.5, // Bounce value for XP orb physics
        spawnVelocity: {
            xRange: 50, // Random X velocity range (-50 to 50)
            yRangeMin: -100, // Y velocity lower bound (more upward velocity)
            yRangeMax: -50, // Y velocity upper bound (less upward velocity)
            underwaterRange: 30 // Velocity range for underwater orbs
        }
    },
    magnetism: {
        range: 150, // Distance at which orbs start being attracted to player
        speed: 250 // Speed at which orbs move toward player
    },
    progression: {
        startingLevel: 1,
        startingHealth: 100,
        startingMaxHealth: 100,
        startingXP: 0,
        startingXPToLevel: 100,
        healthIncreasePerLevel: 20, // Health gained per level up
        xpScalingFactor: 1.1 // XP requirement multiplier per level (10% increase)
    },
    vehicleUpgrade: {
        submarineLevel2Threshold: 2, // Level required for submarine tier 2
        submarineLevel3Threshold: 3, // Level required for submarine tier 3
        maxCarLevel: 5 // Maximum car level (capped at 5)
    }
};
