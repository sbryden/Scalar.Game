/**
 * Enemy Configuration
 * All enemy type definitions, stats, and boss configurations
 * 
 * ARCHITECTURE NOTE:
 * Each enemy type now includes its texture directly in its configuration.
 * This ensures:
 * - All enemy properties are co-located in one place
 * - TypeScript enforces that every enemy has a texture defined
 * - No silent fallbacks that could cause bugs
 * - Easy to see and maintain all enemy attributes
 * 
 * TEXTURE VARIATION:
 * The texture field supports two formats:
 * 1. Single texture: texture: 'enemy_name'
 * 2. Multiple variants with weights: texture: [
 *      { texture: 'enemy_variant_1', weight: 0.5 },
 *      { texture: 'enemy_variant_2', weight: 0.5 }
 *    ]
 * Weights should sum to 1.0 for proper probability distribution.
 */

export interface TextureVariant {
    texture: string;
    weight: number;
}

export interface EnemyStats {
    texture: string | TextureVariant[];  // Single texture or array of weighted variants
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
    projectileTexture?: string | TextureVariant[];  // Single texture or array of weighted variants
    projectileDamage?: number;
    projectileSpeed?: number;
    projectileCooldown?: number;
    burstCount?: number;
    burstDelay?: number;
}

// Enemy configuration
// 
// TEXTURE EXAMPLES:
// - Single texture:    texture: 'bacteria'
// - Multiple variants: texture: [
//                        { texture: 'normal_enemy_1', weight: 0.5 },
//                        { texture: 'normal_enemy_2', weight: 0.5 }
//                      ]
export const ENEMY_CONFIG: Record<string, EnemyStats> = {
    // === NORMAL SCALE LAND ENEMIES ===
    generic: {
        texture: 'enemy',
        width: 30,
        height: 30,
        color: 0xFF0000,
        speed: 80,
        health: 20,
        damage: 10,
        xpReward: 25,
        patrolDistance: 300,
        knockbackResistance: 1.0,
        lineOfSightMultiplier: 5.0,
        chaseSpeedMultiplier: 1.5
    },
    boss_land: {
        texture: 'land/normal/snake_boss',
        width: 90,
        height: 90,
        color: 0xFF0000,
        speed: 80,
        health: 100,
        damage: 15,
        xpReward: 150,
        patrolDistance: 400,
        knockbackResistance: 2.0,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3,
        hasRangedAbility: true,
        projectileTexture: [
            { texture: 'land/normal/snakefire', weight: 0.25 },
            { texture: 'land/normal/snakeice', weight: 0.25 },
            { texture: 'land/normal/snakesmoke', weight: 0.25 },
            { texture: 'land/normal/snakevines', weight: 0.25 }
        ],
        projectileDamage: 20,
        projectileSpeed: 300,
        projectileCooldown: 2500,
        burstCount: 4,
        burstDelay: 150
    },
    boss_wolf_tank: {
        texture: 'land/normal/wolf_boss',
        width: 120,
        height: 120,
        color: 0x808080,
        speed: 75,
        health: 180,
        damage: 25,
        xpReward: 220,
        patrolDistance: 400,
        knockbackResistance: 2.5,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.4,
        hasRangedAbility: true,
        projectileTexture: 'land/normal/wolf_boss_bullet',
        projectileDamage: 30,
        projectileSpeed: 350,
        projectileCooldown: 2000,
        burstCount: 3,
        burstDelay: 100
    },

    // === MICRO SCALE LAND ENEMIES ===
    micro: {
        texture: 'land/micro/bacteria',
        width: 30,
        height: 30,
        color: 0x00FF88,
        speed: 60,
        health: 5,
        damage: 5,
        xpReward: 10,
        patrolDistance: 200,
        knockbackResistance: 0.8,
        lineOfSightMultiplier: 5.0,
        chaseSpeedMultiplier: 1.5
    },
    spawner_micro: {
        texture: 'land/micro/bacteria',
        width: 30,
        height: 30,
        color: 0xFF8800,
        speed: 50,
        health: 8,
        damage: 5,
        xpReward: 25,
        patrolDistance: 200,
        knockbackResistance: 1.0,
        lineOfSightMultiplier: 5.0,
        chaseSpeedMultiplier: 1.3
    },
    micro_minion: {
        texture: 'land/micro/bacteria',
        width: 18,  // 60% of 30
        height: 18,
        color: 0x00FF88,
        speed: 70,
        health: 2,  // 30% of micro's 5 HP (rounded)
        damage: 4,
        xpReward: 3,
        patrolDistance: 150,
        knockbackResistance: 0.6,
        lineOfSightMultiplier: 4.0,
        chaseSpeedMultiplier: 1.6
    },
    boss_land_micro: {
        texture: [
            { texture: 'water/micro/zombie_blob', weight: 0.8 },
            { texture: 'land/micro/micromonkeyboss', weight: 0.2 }
        ],
        width: 90,
        height: 90,
        color: 0x00FF88,
        speed: 60,
        health: 25,
        damage: 8,
        xpReward: 60,
        patrolDistance: 300,
        knockbackResistance: 1.5,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3
    },

    // === NORMAL SCALE WATER ENEMIES ===
    fish: {
        texture: [
            { texture: 'water/normal/water_enemy_fish_1', weight: 0.25 },
            { texture: 'water/normal/water_enemy_needle_fish_1', weight: 0.75 }
        ],
        width: 30,
        height: 30,
        color: 0x00BFFF,
        speed: 70,
        health: 15,
        damage: 8,
        xpReward: 20,
        patrolDistance: 400,
        knockbackResistance: 0.7,
        lineOfSightMultiplier: 5.0,
        chaseSpeedMultiplier: 1.5
    },
    boss_water_swimming: {
        texture: 'water/normal/shark_1',
        width: 90,
        height: 90,
        color: 0x00BFFF,
        speed: 70,
        health: 75,
        damage: 12,
        xpReward: 120,
        patrolDistance: 500,
        knockbackResistance: 1.5,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3
    },
    boss_water_shark: {
        texture: 'water/normal/sharkboss',
        width: 90,
        height: 90,
        color: 0x1E90FF,
        speed: 80,
        health: 80,
        damage: 14,
        xpReward: 130,
        patrolDistance: 550,
        knockbackResistance: 1.6,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.4,
        hasRangedAbility: true,
        projectileTexture: 'water/normal/sharkpedo',
        projectileDamage: 50,
        projectileSpeed: 300,
        projectileCooldown: 3000
    },
    crab: {
        texture: 'water/normal/water_enemy_crab_1',
        width: 30,
        height: 30,
        color: 0xFF6347,
        speed: 60,
        health: 25,
        damage: 12,
        xpReward: 30,
        patrolDistance: 250,
        knockbackResistance: 1.2,
        lineOfSightMultiplier: 5.0,
        chaseSpeedMultiplier: 1.5
    },
    boss_water_crab: {
        texture: 'water/normal/crabboss',
        width: 90,
        height: 90,
        color: 0xFF6347,
        speed: 60,
        health: 125,
        damage: 18,
        xpReward: 180,
        patrolDistance: 350,
        knockbackResistance: 2.2,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3,
        hasRangedAbility: true,
        projectileTexture: 'water/normal/bubble',
        projectileDamage: 10,
        projectileSpeed: 200,
        projectileCooldown: 2000
    },

    // === MICRO SCALE WATER ENEMIES ===
    water_swimming_micro: {
        texture: 'water/micro/baby_fish',
        width: 20,
        height: 20,
        color: 0x7FFFD4,
        speed: 50,
        health: 3,
        damage: 3,
        xpReward: 8,
        patrolDistance: 180,
        knockbackResistance: 0.5,
        lineOfSightMultiplier: 5.0,
        chaseSpeedMultiplier: 1.5
    },
    spawner_water_swimming_micro: {
        texture: 'water/micro/fish_to_fish',
        width: 20,
        height: 20,
        color: 0xFF8800,
        speed: 40,
        health: 5,
        damage: 3,
        xpReward: 20,
        patrolDistance: 180,
        knockbackResistance: 0.7,
        lineOfSightMultiplier: 5.0,
        chaseSpeedMultiplier: 1.3
    },
    water_micro_minion: {
        texture: 'water/micro/microfish2',
        width: 12,  // 60% of 20
        height: 12,
        color: 0x7FFFD4,
        speed: 60,
        health: 1,  // 30% of water_swimming_micro's 3 HP (rounded)
        damage: 2,
        xpReward: 2,
        patrolDistance: 120,
        knockbackResistance: 0.4,
        lineOfSightMultiplier: 4.0,
        chaseSpeedMultiplier: 1.6
    },
    boss_water_swimming_micro: {
        texture: 'water/micro/micro_boss',
        width: 60,
        height: 60,
        color: 0x7FFFD4,
        speed: 50,
        health: 15,
        damage: 5,
        xpReward: 50,
        patrolDistance: 280,
        knockbackResistance: 1.2,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3
    },
    boss_water_crab_micro: {
        texture: 'water/normal/crabboss',
        width: 60,
        height: 60,
        color: 0xFF6347,
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
    spawner_boss_land: {
        texture: 'land/macro/rock_car_with_minions',
        width: 120,
        height: 120,
        color: 0xFF4500,
        speed: 65,
        health: 200,
        damage: 25,
        xpReward: 280,
        patrolDistance: 450,
        knockbackResistance: 3.0,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.2
    },
    rock_minion: {
        texture: 'land/macro/rock_minion_1',
        width: 35,
        height: 35,
        color: 0x8B4513,
        speed: 80,
        health: 45,
        damage: 12,
        xpReward: 15,
        patrolDistance: 300,
        knockbackResistance: 1.5,
        lineOfSightMultiplier: 5.0,
        chaseSpeedMultiplier: 1.5
    },
    golem: {
        texture: 'land/macro/rocktower_minion',
        width: 60,
        height: 60,
        color: 0x696969,
        speed: 50,
        health: 40,
        damage: 18,
        xpReward: 45,
        patrolDistance: 300,
        knockbackResistance: 2.5,
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.2
    },
    wolf_macro: {
        texture: 'land/macro/rockgiant',
        width: 50,
        height: 50,
        color: 0x808080,
        speed: 90,
        health: 30,
        damage: 20,
        xpReward: 40,
        patrolDistance: 450,
        knockbackResistance: 1.8,
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.6
    },
    bear: {
        texture: 'land/jet_mech',
        width: 65,
        height: 65,
        color: 0x8B4513,
        speed: 70,
        health: 50,
        damage: 22,
        xpReward: 50,
        patrolDistance: 350,
        knockbackResistance: 2.8,
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.4
    },
    boss_land_golem: {
        texture: 'land/macro/rocktower',
        width: 120,
        height: 120,
        color: 0x2F4F4F,
        speed: 60,
        health: 200,
        damage: 30,
        xpReward: 250,
        patrolDistance: 400,
        knockbackResistance: 3.5,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.2,
        hasRangedAbility: true,
        projectileTexture: 'land/macro/rocktower_projectile',
        projectileDamage: 40,
        projectileSpeed: 280,
        projectileCooldown: 3000
    },
    boss_land_bear: {
        texture: 'land/macro/rockgiant',
        width: 120,
        height: 120,
        color: 0x654321,
        speed: 80,
        health: 180,
        damage: 28,
        xpReward: 240,
        patrolDistance: 450,
        knockbackResistance: 3.2,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.5
    },

    // === MACRO SCALE WATER ENEMIES ===
    whale: {
        texture: 'water/macro/water_enemy_giant_1',
        width: 80,
        height: 80,
        color: 0x4682B4,
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
        texture: 'water/normal/shark_1',
        width: 70,
        height: 70,
        color: 0x2F4F4F,
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
        texture: 'water/macro/babykraken',
        width: 75,
        height: 75,
        color: 0x8B008B,
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
        texture: 'water/normal/water_enemy_crab_1',
        width: 60,
        height: 60,
        color: 0xDC143C,
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
        texture: 'water/macro/mutant_kraken',
        width: 65,
        height: 65,
        color: 0x006400,
        speed: 65,
        health: 65,
        damage: 27,
        xpReward: 58,
        patrolDistance: 400,
        knockbackResistance: 2.8,
        lineOfSightMultiplier: 6.0,
        chaseSpeedMultiplier: 1.4
    },
    boss_water_whale: {
        texture: 'water/macro/water_enemy_giant_1',
        width: 140,
        height: 140,
        color: 0x191970,
        speed: 70,
        health: 250,
        damage: 35,
        xpReward: 300,
        patrolDistance: 600,
        knockbackResistance: 4.0,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3
    },
    boss_water_giant_shark: {
        texture: 'water/normal/sharkboss',
        width: 140,
        height: 140,
        color: 0x000080,
        speed: 90,
        health: 220,
        damage: 32,
        xpReward: 280,
        patrolDistance: 650,
        knockbackResistance: 3.5,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.6,
        hasRangedAbility: true,
        projectileTexture: 'water/normal/sharkpedo',
        projectileDamage: 60,
        projectileSpeed: 350,
        projectileCooldown: 2500
    },
    boss_water_giant_crab: {
        texture: 'water/normal/crabboss',
        width: 140,
        height: 140,
        color: 0x8B0000,
        speed: 60,
        health: 280,
        damage: 38,
        xpReward: 320,
        patrolDistance: 350,
        knockbackResistance: 4.5,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.2,
        hasRangedAbility: true,
        projectileTexture: 'water/normal/bubble',
        projectileDamage: 25,
        projectileSpeed: 250,
        projectileCooldown: 2200
    },
    boss_water_sea_serpent: {
        texture: 'water/macro/warning_kraken',
        width: 140,
        height: 140,
        color: 0x228B22,
        speed: 75,
        health: 240,
        damage: 34,
        xpReward: 290,
        patrolDistance: 500,
        knockbackResistance: 3.8,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.4
    }
} as const;

/**
 * @deprecated Legacy boss texture configuration. 
 * New enemy configurations should use the inline texture array format in ENEMY_CONFIG instead.
 * This is maintained for backward compatibility with enemies that haven't been migrated yet.
 * 
 * To migrate, move the texture variants directly into the enemy's texture field as an array.
 * Example: texture: [{ texture: 'boss1', weight: 0.5 }, { texture: 'boss2', weight: 0.5 }]
 */
export const BOSS_TEXTURE_CONFIG: Record<string, Array<{ texture: string; weight: number }>> = {
    // Migrated entries have been moved to inline texture arrays in ENEMY_CONFIG
    // These remaining entries are kept for backward compatibility until all enemies are migrated
    spawner_boss_land: [
        { texture: 'land/macro/rock_car_with_minions', weight: 1.0 }
    ],
    boss_water_shark: [
        { texture: 'water/normal/sharkboss', weight: 1.0 }
    ],
    boss_water_crab: [
        { texture: 'water/normal/crabboss', weight: 1.0 }
    ],
    boss_water_swimming_micro: [
        { texture: 'water/micro/micro_boss', weight: 1.0 }
    ],
    boss_water_crab_micro: [
        { texture: 'water/normal/crabboss', weight: 1.0 }
    ],
    boss_wolf_tank: [
        { texture: 'land/normal/wolf_boss', weight: 1.0 }
    ]
};

// Detection configuration
export const DETECTION_CONFIG = {
    minLineOfSight: 100,
    bossLineOfSightScreenPercent: 0.6,
    maxLineOfSightScreenPercent: 1.0
} as const;

/**
 * Difficulty Mode Configurations
 * 
 * Each difficulty affects:
 * - enemyHealthMultiplier: How much HP enemies have
 * - enemySpeedMultiplier: How fast enemies move
 * - enemyLineOfSightMultiplier: How far enemies can detect the player
 * - enemySpawnMultiplier: Enemy density (number of spawns)
 * - enemyDamageMultiplier: How much damage enemies deal to the player
 * - playerDamageMultiplier: How much damage the player deals to enemies
 * - xpMultiplier: XP gain rate
 * - resourceDropMultiplier: Chance of resource/orb drops
 */

// Easy mode - Player advantages, one-shot most enemies
export const EASY_MODE_CONFIG = {
    enemyHealthMultiplier: 0.4,        // Enemies have 40% HP (easier to kill)
    enemySpeedMultiplier: 0.7,         // Enemies move slower
    enemyLineOfSightMultiplier: 0.5,   // Enemies detect player from shorter range
    enemySpawnMultiplier: 0.5,         // 50% enemy density
    enemyDamageMultiplier: 0.5,        // Enemies deal half damage
    playerDamageMultiplier: 2.0,       // Player deals double damage
    xpMultiplier: 0.8,                 // Slightly less XP (easier game)
    resourceDropMultiplier: 1.5        // More resource drops
} as const;

// Normal mode - Balanced gameplay (rebalanced to be more accessible)
export const NORMAL_MODE_CONFIG = {
    enemyHealthMultiplier: 1.0,        // Standard enemy HP
    enemySpeedMultiplier: 1.0,         // Standard enemy speed
    enemyLineOfSightMultiplier: 1.0,   // Standard detection range
    enemySpawnMultiplier: 1.0,         // Standard enemy density
    enemyDamageMultiplier: 1.0,        // Standard enemy damage
    playerDamageMultiplier: 1.0,       // Standard player damage
    xpMultiplier: 1.0,                 // Standard XP
    resourceDropMultiplier: 1.0        // Standard drops
} as const;

// Hard mode - Tougher enemies, fewer resources (rebalanced from previous values)
export const HARD_MODE_CONFIG = {
    enemyHealthMultiplier: 1.3,        // 30% more HP (reduced from 1.5)
    enemySpeedMultiplier: 1.15,        // 15% faster (reduced from 1.3)
    enemyLineOfSightMultiplier: 1.3,   // Better detection (reduced from 1.5)
    enemySpawnMultiplier: 1.3,         // 30% more enemies (reduced from 1.5)
    enemyDamageMultiplier: 1.25,       // 25% more damage
    playerDamageMultiplier: 0.9,       // Player deals slightly less damage
    xpMultiplier: 1.25,                // More XP reward for the challenge
    resourceDropMultiplier: 0.8        // Fewer resource drops
} as const;

// Brutal mode - Extreme challenge, high risk/high reward
export const BRUTAL_MODE_CONFIG = {
    enemyHealthMultiplier: 2.0,        // Double enemy HP
    enemySpeedMultiplier: 1.4,         // 40% faster enemies
    enemyLineOfSightMultiplier: 2.0,   // Double detection range
    enemySpawnMultiplier: 1.8,         // 80% more enemies
    enemyDamageMultiplier: 2.0,        // Double enemy damage
    playerDamageMultiplier: 0.75,      // Player deals 25% less damage
    xpMultiplier: 2.0,                 // Double XP reward
    resourceDropMultiplier: 0.5        // Half resource drops
} as const;

// Type for difficulty config - use number instead of literal types
export interface DifficultyConfig {
    readonly enemyHealthMultiplier: number;
    readonly enemySpeedMultiplier: number;
    readonly enemyLineOfSightMultiplier: number;
    readonly enemySpawnMultiplier: number;
    readonly enemyDamageMultiplier: number;
    readonly playerDamageMultiplier: number;
    readonly xpMultiplier: number;
    // Multiplier that controls how resource drop rates scale with difficulty.
    readonly resourceDropMultiplier: number;
}
