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
    projectileTexture?: string;
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
        texture: [
            { texture: 'snake_boss', weight: 0.5 },
            { texture: 'rockgiant', weight: 0.5 }
        ],
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
        chaseSpeedMultiplier: 1.3
    },
    spawner_boss_land: {
        texture: 'rock_car_with_minions',
        width: 90,
        height: 90,
        color: 0xFF4500,
        speed: 80,
        health: 150,
        damage: 15,
        xpReward: 230,
        patrolDistance: 400,
        knockbackResistance: 2.0,
        lineOfSightMultiplier: 8.0,
        chaseSpeedMultiplier: 1.3
    },
    boss_wolf_tank: {
        texture: 'wolf_boss',
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
        projectileTexture: 'wolf_boss_bullet',
        projectileDamage: 30,
        projectileSpeed: 350,
        projectileCooldown: 2000,
        burstCount: 3,
        burstDelay: 100
    },
    rock_minion: {
        texture: 'rock_minion_1',
        width: 25,
        height: 25,
        color: 0x8B4513,
        speed: 90,
        health: 37.5,
        damage: 8,
        xpReward: 0,
        patrolDistance: 250,
        knockbackResistance: 0.8,
        lineOfSightMultiplier: 5.0,
        chaseSpeedMultiplier: 1.6
    },

    // === MICRO SCALE LAND ENEMIES ===
    micro: {
        texture: 'bacteria',
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
        texture: 'bacteria',
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
        texture: 'bacteria',
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
            { texture: 'zombie_blob', weight: 0.8 },
            { texture: 'micromonkeyboss', weight: 0.2 }
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
            { texture: 'water_enemy_fish_1', weight: 0.25 },
            { texture: 'water_enemy_needle_fish_1', weight: 0.75 }
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
        texture: [
            { texture: 'water_enemy_fish_1', weight: 0.25 },
            { texture: 'water_enemy_needle_fish_1', weight: 0.75 }
        ],
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
        texture: 'sharkboss',
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
        projectileTexture: 'sharkpedo',
        projectileDamage: 50,
        projectileSpeed: 300,
        projectileCooldown: 3000
    },
    crab: {
        texture: 'water_enemy_crab_1',
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
        texture: 'crabboss',
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
        projectileTexture: 'bubble',
        projectileDamage: 10,
        projectileSpeed: 200,
        projectileCooldown: 2000
    },

    // === MICRO SCALE WATER ENEMIES ===
    water_swimming_micro: {
        texture: 'bacteria',
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
        texture: 'bacteria',
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
        texture: 'bacteria',
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
        texture: 'micro_boss',
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
        texture: 'crabboss',
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
    golem: {
        texture: 'enemy',
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
        texture: 'enemy',
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
        texture: 'enemy',
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
    golem_boss: {
        texture: 'enemy',
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
        chaseSpeedMultiplier: 1.2
    },
    bear_boss: {
        texture: 'enemy',
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
        texture: 'enemy',
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
        texture: 'enemy',
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
        texture: 'enemy',
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
        texture: 'enemy',
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
        texture: 'enemy',
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
    whale_boss: {
        texture: 'enemy',
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
    giant_shark_boss: {
        texture: 'enemy',
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
        projectileTexture: 'sharkpedo',
        projectileDamage: 60,
        projectileSpeed: 350,
        projectileCooldown: 2500
    },
    giant_crab_boss: {
        texture: 'enemy',
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
        chaseSpeedMultiplier: 1.2
    },
    sea_serpent_boss: {
        texture: 'enemy',
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
        { texture: 'rock_car_with_minions', weight: 1.0 }
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
    ],
    boss_wolf_tank: [
        { texture: 'wolf_boss', weight: 1.0 }
    ]
};

// Detection configuration
export const DETECTION_CONFIG = {
    minLineOfSight: 100,
    bossLineOfSightScreenPercent: 0.6,
    maxLineOfSightScreenPercent: 1.0
} as const;

// Easy mode enemy modifiers
export const EASY_MODE_CONFIG = {
    enemyHealthMultiplier: 0.7,
    enemySpeedMultiplier: 0.8,
    enemyLineOfSightMultiplier: 0.7,
    enemySpawnMultiplier: 0.6
} as const;

// Hard mode enemy modifiers
export const HARD_MODE_CONFIG = {
    enemyHealthMultiplier: 1.5,
    enemySpeedMultiplier: 1.3,
    enemyLineOfSightMultiplier: 1.5,
    enemySpawnMultiplier: 1.5
} as const;
