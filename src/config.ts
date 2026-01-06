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
    },
    large: {
        scale: 1.5,
        speedMultiplier: 0.8,
        jumpMultiplier: 0.9,
        color: 0xFF4500 // Orange-red
    }
};

export const SIZE_CHANGE_COOLDOWN = 500;

// Dynamic spawn configuration
export const SPAWN_CONFIG = {
    // Segment-based spawning (world divided into 16 segments)
    segmentCount: 16,
    // Density range for random assignment (multipliers)
    densityRange: {
        min: 0.3,    // Minimum density multiplier
        max: 1.8     // Maximum density multiplier
    },
    // Random variance in spawn positions
    positionVariance: {
        x: 50,         // +/- 25 pixels in X
        y: 100         // +/- 50 pixels in Y (for swimming enemies)
    },
    // Default spawn parameters per scene type
    defaults: {
        baseInterval: 300,        // Base spawn interval in pixels
        groundY: 680,             // Y position for ground enemies
        midWaterY: 400,           // Y position for mid-water swimming enemies
        microWaterY: 350,         // Y position for micro underwater enemies
        bossGroundY: 550,         // Y position for ground bosses
        bossCrabY: 600,           // Y position for crab bosses
        minSpawnX: 300,           // Minimum X spawn boundary
        minSpawnY: 100,           // Minimum Y spawn boundary
        maxSpawnY: 700            // Maximum Y spawn boundary
    }
};

// Detection configuration
export const DETECTION_CONFIG = {
    minLineOfSight: 100, // Minimum line of sight distance for small enemies
    bossLineOfSightScreenPercent: 0.6, // Boss line of sight as % of screen width (60%)
    maxLineOfSightScreenPercent: 1.0 // Maximum line of sight (100% of screen width)
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
    lineOfSightMultiplier: number;
    chaseSpeedMultiplier: number;
    hasRangedAbility?: boolean;
    projectileTexture?: string;
    projectileDamage?: number;
    projectileSpeed?: number;
    projectileCooldown?: number;
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
        lineOfSightMultiplier: 5.0, // Line of sight = enemy size * this multiplier
        chaseSpeedMultiplier: 1.5  // Speed when chasing = base speed * this multiplier
    },
    boss_land: {
        width: 90,
        height: 90,
        color: 0xFF0000, // Red
        speed: 80,
        health: 100,  // 5x base health
        damage: 15,
        xpReward: 150,
        patrolDistance: 400,
        knockbackResistance: 2.0,  // More resistant to knockback
        lineOfSightMultiplier: 8.0, // Larger line of sight range
        chaseSpeedMultiplier: 1.3  // Slightly slower when chasing
    },
    spawner_boss_land: {
        width: 90,
        height: 90,
        color: 0xFF4500, // Orange-red
        speed: 80,
        health: 150,  // Boss health - will spawn 4 minions with ~37.5 health each
        damage: 15,
        xpReward: 230, // Total XP including minions (150 base + 4*20 minion rewards)
        patrolDistance: 400,
        knockbackResistance: 2.0,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3
    },
    rock_minion: {
        width: 25,
        height: 25,
        color: 0x8B4513, // Saddle brown
        speed: 90,  // Faster than regular enemies
        health: 37.5,  // 4 minions = 150 total health
        damage: 8,
        xpReward: 0, // XP handled by parent spawner boss
        patrolDistance: 250,
        knockbackResistance: 0.8,
        lineOfSightMultiplier: 5.0,
        chaseSpeedMultiplier: 1.6  // Aggressive chasers
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
        lineOfSightMultiplier: 5.0, // Line of sight = enemy size * this multiplier
        chaseSpeedMultiplier: 1.5  // Speed when chasing = base speed * this multiplier
    },
    boss_land_micro: {
        width: 90,
        height: 90,
        color: 0x00FF88, // Green-cyan (bacteria)
        speed: 60,
        health: 25,  // 5x base health
        damage: 8,
        xpReward: 60,
        patrolDistance: 300,
        knockbackResistance: 1.5,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3
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
        lineOfSightMultiplier: 5.0, // Line of sight = enemy size * this multiplier
        chaseSpeedMultiplier: 1.5  // Speed when chasing = base speed * this multiplier
    },
    boss_water_swimming: {
        width: 90,
        height: 90,
        color: 0x00BFFF, // Deep sky blue
        speed: 70,
        health: 75,  // 5x base health
        damage: 12,
        xpReward: 120,
        patrolDistance: 500,
        knockbackResistance: 1.5,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3
    },
    boss_water_shark: {
        width: 90,
        height: 90,
        color: 0x1E90FF, // Dodger blue
        speed: 80,
        health: 80,  // Slightly stronger than boss_water_swimming
        damage: 14,
        xpReward: 130,
        patrolDistance: 550,
        knockbackResistance: 1.6,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.4,
        // Ranged ability configuration
        hasRangedAbility: true,
        projectileTexture: 'sharkpedo',
        projectileDamage: 50,
        projectileSpeed: 300,
        projectileCooldown: 3000
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
        lineOfSightMultiplier: 5.0, // Line of sight = enemy size * this multiplier
        chaseSpeedMultiplier: 1.5  // Speed when chasing = base speed * this multiplier
    },
    boss_water_crab: {
        width: 90,
        height: 90,
        color: 0xFF6347, // Tomato red (crab color)
        speed: 60,
        health: 125,  // 5x base health
        damage: 18,
        xpReward: 180,
        patrolDistance: 350,
        knockbackResistance: 2.2,  // Very resistant to knockback
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3,
        // Ranged ability configuration
        hasRangedAbility: true,
        projectileTexture: 'bubble',
        projectileDamage: 10,
        projectileSpeed: 200,
        projectileCooldown: 2000
    },
    water_swimming_micro: {
        width: 20,
        height: 20,
        color: 0x7FFFD4, // Aquamarine
        speed: 50,
        health: 3,
        damage: 3,
        xpReward: 8,
        patrolDistance: 180,
        knockbackResistance: 0.5,  // Very light, easily knocked back
        lineOfSightMultiplier: 5.0, // Line of sight = enemy size * this multiplier
        chaseSpeedMultiplier: 1.5  // Speed when chasing = base speed * this multiplier
    },
    boss_water_swimming_micro: {
        width: 60,
        height: 60,
        color: 0x7FFFD4, // Aquamarine
        speed: 50,
        health: 15,  // 5x base health
        damage: 5,
        xpReward: 50,
        patrolDistance: 280,
        knockbackResistance: 1.2,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3
    },
    boss_water_crab_micro: {
        width: 60,
        height: 60,
        color: 0xFF6347, // Tomato red
        speed: 50,
        health: 18,
        damage: 6,
        xpReward: 55,
        patrolDistance: 270,
        knockbackResistance: 1.3,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3
    },
    // === MACRO SCALE LAND ENEMIES ===
    golem: {
        width: 60,
        height: 60,
        color: 0x696969, // Dim gray (stone)
        speed: 50,
        health: 40,
        damage: 18,
        xpReward: 45,
        patrolDistance: 300,
        knockbackResistance: 2.5,  // Very resistant to knockback
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.2
    },
    wolf_macro: {
        width: 50,
        height: 50,
        color: 0x808080, // Gray (wolf)
        speed: 90,
        health: 30,
        damage: 20,
        xpReward: 40,
        patrolDistance: 450,
        knockbackResistance: 1.8,
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.6  // Fast chaser
    },
    bear: {
        width: 65,
        height: 65,
        color: 0x8B4513, // Saddle brown (bear)
        speed: 70,
        health: 50,
        damage: 22,
        xpReward: 50,
        patrolDistance: 350,
        knockbackResistance: 2.8,
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.4
    },
    golem_boss: {
        width: 120,
        height: 120,
        color: 0x2F4F4F, // Dark slate gray (boss golem)
        speed: 60,
        health: 200,
        damage: 30,
        xpReward: 250,
        patrolDistance: 400,
        knockbackResistance: 3.5,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.2
    },
    bear_boss: {
        width: 120,
        height: 120,
        color: 0x654321, // Dark brown (boss bear)
        speed: 80,
        health: 180,
        damage: 28,
        xpReward: 240,
        patrolDistance: 450,
        knockbackResistance: 3.2,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.5
    },
    // === MACRO SCALE UNDERWATER ENEMIES ===
    whale: {
        width: 80,
        height: 80,
        color: 0x4682B4, // Steel blue (whale)
        speed: 60,
        health: 60,
        damage: 25,
        xpReward: 55,
        patrolDistance: 500,
        knockbackResistance: 3.0,
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.3
    },
    giant_shark: {
        width: 70,
        height: 70,
        color: 0x2F4F4F, // Dark slate gray (shark)
        speed: 85,
        health: 50,
        damage: 28,
        xpReward: 50,
        patrolDistance: 550,
        knockbackResistance: 2.5,
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.5
    },
    sea_dragon: {
        width: 75,
        height: 75,
        color: 0x8B008B, // Dark magenta (sea dragon)
        speed: 75,
        health: 55,
        damage: 26,
        xpReward: 52,
        patrolDistance: 480,
        knockbackResistance: 2.7,
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.4
    },
    giant_crab: {
        width: 60,
        height: 60,
        color: 0xDC143C, // Crimson (giant crab)
        speed: 55,
        health: 70,
        damage: 30,
        xpReward: 60,
        patrolDistance: 300,
        knockbackResistance: 3.5,
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.3
    },
    sea_serpent: {
        width: 65,
        height: 65,
        color: 0x006400, // Dark green (sea serpent)
        speed: 65,
        health: 65,
        damage: 27,
        xpReward: 58,
        patrolDistance: 400,
        knockbackResistance: 2.8,
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.4
    },
    whale_boss: {
        width: 140,
        height: 140,
        color: 0x191970, // Midnight blue (boss whale)
        speed: 70,
        health: 250,
        damage: 35,
        xpReward: 300,
        patrolDistance: 600,
        knockbackResistance: 4.0,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3
    },
    giant_shark_boss: {
        width: 140,
        height: 140,
        color: 0x000080, // Navy (boss shark)
        speed: 90,
        health: 220,
        damage: 32,
        xpReward: 280,
        patrolDistance: 650,
        knockbackResistance: 3.5,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.6,
        // Ranged ability
        hasRangedAbility: true,
        projectileTexture: 'sharkpedo',
        projectileDamage: 60,
        projectileSpeed: 350,
        projectileCooldown: 2500
    },
    giant_crab_boss: {
        width: 140,
        height: 140,
        color: 0x8B0000, // Dark red (boss crab)
        speed: 60,
        health: 280,
        damage: 38,
        xpReward: 320,
        patrolDistance: 350,
        knockbackResistance: 4.5,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.2
    },
    sea_serpent_boss: {
        width: 140,
        height: 140,
        color: 0x228B22, // Forest green (boss serpent)
        speed: 75,
        health: 240,
        damage: 34,
        xpReward: 290,
        patrolDistance: 500,
        knockbackResistance: 3.8,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.4
    }
};

// Boss texture configuration with weighted random selection
// Each boss type can have multiple texture options with spawn weights
export const BOSS_TEXTURE_CONFIG: Record<string, Array<{ texture: string; weight: number }>> = {
    boss_land: [
        { texture: 'snake_boss', weight: 0.5 },
        { texture: 'rockgiant', weight: 0.5 }
    ],
    spawner_boss_land: [
        { texture: 'rock_car_with_minions', weight: 1.0 }
    ],
    boss_land_micro: [
        { texture: 'zombie_blob', weight: 0.8 },
        { texture: 'micromonkeyboss', weight: 0.2 }
    ],
    boss_water_swimming: [
        { texture: 'water_enemy_fish_1', weight: 0.25 },
        { texture: 'water_enemy_needle_fish_1', weight: 0.75 }
    ],
    boss_water_shark: [
        { texture: 'sharkboss', weight: 1.0 }
    ],
    boss_water_crab: [
        { texture: 'crabboss', weight: 1.0 }
    ],
    boss_water_swimming_micro: [
        { texture: 'micro_boss', weight: 1.0 }
    ],
    boss_water_crab_micro: [
        { texture: 'crabboss', weight: 1.0 }
    ]
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
    passiveModeVelocityBonusMultiplier: 0.5, // Passive mode gets 50% of velocity bonus compared to melee
    meleeModeDamageReduction: 0.25,   // Player takes 25% damage in melee mode
    requiredApproachSpeed: 50,        // Minimum velocity toward enemy for passive damage
    // Momentum-based damage
    velocityDamageMultiplier: 0.01,   // Damage bonus per unit of velocity (0.01 = +1 damage per 100 velocity)
    maxVelocityBonus: 10,             // Maximum bonus damage from velocity
    // Size/mass considerations
    standardEnemyWidth: 30,           // Standard enemy width for size comparison calculations
    sizeAdvantageMultiplier: 1.3,     // Damage multiplier when attacking smaller enemies
    sizeDisadvantageMultiplier: 0.8,  // Damage multiplier when attacking larger enemies
    // Positioning bonuses
    headOnBonusMultiplier: 1.2,       // 20% bonus damage for head-on collisions
    headOnDetectionThreshold: 0.8,    // Dot product threshold for detecting head-on attacks (0.8 = ~36° cone)
    rearAttackMultiplier: 0.9,        // 10% reduced damage for rear attacks (safer but less effective)
    // Combo system
    comboTimeWindow: 2000,            // Time window for consecutive hits to count as combo (ms)
    comboDamageBonus: 0.15,           // 15% bonus damage per combo hit
    maxComboMultiplier: 2.0,          // Maximum total damage multiplier from combos (2x at ~7 hits)
    // Scale-based ramming variations
    microScaleMultiplier: 0.9,        // Slightly reduced ramming effectiveness at micro scale
    normalScaleMultiplier: 1.0,       // Normal ramming effectiveness
    macroScaleMultiplier: 1.3,        // Enhanced ramming effectiveness at macro scale (30% bonus)
    // Knockback scaling
    knockbackVelocityScaleFactor: 500, // Velocity at which knockback force doubles
    maxKnockbackMultiplier: 2.0       // Maximum knockback multiplier from velocity
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
    },
    enemy: {
        sharkpedo: {
            speed: 300,
            damage: 15,
            cooldown: 3000, // 3 seconds between shots
            range: 800 // Max range for enemy projectiles
        }
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
        cameraShakeDuration: 100, // Duration of camera shake on damage (ms)
        cameraShakeIntensityMelee: 0.003, // Shake intensity in melee mode
        cameraShakeIntensityNormal: 0.005, // Shake intensity in normal mode
            cameraShakeIntensityPerDamage: 0.0001, // Additional shake per point of damage dealt
            cameraShakeMaxIntensity: 0.015, // Maximum camera shake intensity
            impactFlashDuration: 150, // Duration of impact flash effect (ms)
            impactFlashDamageThreshold: 25, // Minimum damage to trigger impact flash effect
            meleeModeTintColor: 0x88ccff, // Tint color for melee mode (blue aura)
            impactFlashColor: 0xFFFFFF, // Flash color on high-damage impacts
            explosion: {
                duration: 200, // How long explosion lasts (ms)
                minScale: 0.3, // Starting scale
                maxScale: 1.5, // Ending scale (expands)
                particleColor: 0xFFAA00, // Orange explosion color
                particleCount: 8, // Number of particles
                particleSpeed: 150, // Speed of particles flying out
                alphaStart: 1.0, // Starting alpha
                alphaEnd: 0.0 // Ending alpha (fade out)
            }
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
        sizeChangeJumpVelocity: -200, // Y velocity applied when changing size
        jumpPower: 200 // Base jump velocity for land-based jumping
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
            velocity: -250 // Y velocity for chase jump
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
    viewportWidth: 1024, // Reference/base screen width used for visual & projectile calculations (not the dynamic world/viewport width)
    healthBar: {
        width: 30, // Width of enemy health bars
        height: 4, // Height of enemy health bars
        offsetY: 10, // Offset above enemy for health bar placement
        depth: 50, // Z-depth for health bar rendering
        displayOriginY: 2 // Y origin for health bar display in pixels; 2 == height / 2, so the origin is at the vertical center of the 4px-tall bar
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
            xMaxAbsVelocity: 50, // Maximum absolute X velocity (range from -50 to 50)
            minUpwardVelocity: -100, // Minimum upward Y velocity (more negative = stronger upward)
            maxUpwardVelocity: -50, // Maximum upward Y velocity (less negative = weaker upward)
            maxUnderwaterVelocity: 30 // Maximum absolute velocity for underwater orbs (used as -max..+max)
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

// Hard mode configuration
export const HARD_MODE_CONFIG = {
    enemyHealthMultiplier: 1.5,      // Enemies have 50% more HP
    enemySpeedMultiplier: 1.3,       // Enemies move 30% faster
    enemyLineOfSightMultiplier: 1.5,  // Enemies have 50% larger line of sight
    enemySpawnMultiplier: 1.5        // 50% more enemies spawn
};

export const GOD_MODE_CONFIG = {
    playerSpeedMultiplier: 4.0       // Player moves 4x faster in god mode
};

// Stamina configuration
export const STAMINA_CONFIG = {
    startingMaxStamina: 100,         // Starting maximum stamina
    startingStamina: 100,            // Starting current stamina (full)
    rechargeRate: 10,                // Stamina recharged per second
    consumptionRate: 25,             // Stamina consumed per second in melee mode
    exhaustionThreshold: 0.2,        // 20% - cannot activate melee below this
    xpOrbRestoration: 15,            // Stamina restored per XP orb collected
    staminaIncreasePerLevel: 10,     // Max stamina increase per level up
    depletionPauseDuration: 2500     // Pause duration when stamina hits 0 (ms) before recharge resumes
};


// UI configuration for stamina display
export const STAMINA_UI_CONFIG = {
    exhaustionFlashDuration: 300,    // Duration of exhaustion flash effect (ms)
    colors: {
        normal: 0x00BFFF,            // Deep sky blue for normal stamina (>20%)
        exhaustion: 0xFF8800,        // Orange for exhaustion warning (≤20%)
        depleted: 0xFF0000           // Red for depleted (0%)
    }
};

// Fuel configuration (for size transformations)
export const FUEL_CONFIG = {
    startingMaxFuel: 100,            // Starting maximum fuel
    startingFuel: 0,                 // Starting current fuel (0 due to initial cooldown)
    regenerationRate: 5,             // Fuel regenerated per second (base rate)
    regenerationRatePerLevel: 0.5,   // Additional regeneration per player level
    consumptionAmount: 20,           // Fuel consumed per size transformation
    lowFuelThreshold: 0.25,          // 25% - show warning below this
    initialCooldownDuration: 20000   // 20 seconds initial cooldown (ms)
};

// UI configuration for fuel display
export const FUEL_UI_CONFIG = {
    lowFuelFlashDuration: 300,       // Duration of low fuel flash effect (ms)
    colors: {
        normal: 0xFFD700,            // Gold for normal fuel (>25%)
        lowFuel: 0xFF8800,           // Orange for low fuel warning (≤25%)
        depleted: 0xFF0000           // Red for depleted (0%)
    }
};

// Progressive Level System configuration
export const LEVEL_SYSTEM_CONFIG = {
    startingLevel: 1,                // Starting level
    enemyCountBase: 1.0,             // Base enemy count multiplier (level 1)
    enemyCountIncreasePerLevel: 0.2, // +20% enemy count per level
    enemyHealthBase: 1.0,            // Base enemy health multiplier (level 1)
    enemyHealthIncreasePerLevel: 0.15, // +15% enemy health per level
    enemyDamageBase: 1.0,            // Base enemy damage multiplier (level 1)
    enemyDamageIncreasePerLevel: 0.10, // +10% enemy damage per level
    enemySpeedBase: 1.0,             // Base enemy speed multiplier (level 1)
    enemySpeedIncreasePerLevel: 0.05, // +5% enemy speed per level
    maxLevel: 99                     // Maximum level (for UI display purposes)
};

// Boss Mode configuration
export const BOSS_MODE_CONFIG = {
    // Segments where bosses spawn (avoiding first 2 segments for starting area)
    // Distributes bosses evenly across remaining segments (2-14)
    bossSegments: {
        land: [3, 10],              // 2 bosses: SnakeBoss, RockCarSpawner
        micro: [7],                  // 1 boss: MicroBoss
        water: [4, 11],              // 2 bosses: SharkBoss, CrabBoss
        waterMicro: [5, 12]          // 2 bosses: MicroSwimBoss, MicroCrabBoss
    }
};
