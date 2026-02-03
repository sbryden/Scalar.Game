/**
 * Progression Configuration
 * XP, leveling, level system, and boss mode settings
 */

// XP and progression configuration
export const XP_CONFIG = {
    orb: {
        radius: 6,
        color: 0xFFD700,
        defaultValue: 25,
        bounce: 0.5,
        spawnVelocity: {
            xMaxAbsVelocity: 50,
            minUpwardVelocity: -100,
            maxUpwardVelocity: -50,
            maxUnderwaterVelocity: 30
        }
    },
    magnetism: {
        range: 150,
        speed: 250
    },
    progression: {
        startingLevel: 1,
        startingHealth: 100,
        startingMaxHealth: 100,
        startingXP: 0,
        startingXPToLevel: 750,
        healthIncreasePerLevel: 20,
        xpScalingFactor: 1.25
    },
    vehicleUpgrade: {
        submarineLevel2Threshold: 2,
        submarineLevel3Threshold: 3,
        maxCarLevel: 5
    }
} as const;

// Progressive Stage System configuration
// Note: "Stage" refers to game world/scene progression, distinct from player level (XP-based)
export const STAGE_SYSTEM_CONFIG = {
    startingStage: 1,
    enemyCountBase: 1.0,
    enemyCountIncreasePerStage: 0.1,
    enemyHealthBase: 1.0,
    enemyHealthIncreasePerStage: 0.15,
    enemyDamageBase: 1.0,
    enemyDamageIncreasePerStage: 0.10,
    enemySpeedBase: 1.0,
    enemySpeedIncreasePerStage: 0.05,
    maxStage: 99
} as const;

// Boss Mode configuration (not using 'as const' to allow mutable array assignment)
export const BOSS_MODE_CONFIG: {
    bossSegments: {
        land: number[];
        micro: number[];
        water: number[];
        waterMicro: number[];
    }
} = {
    bossSegments: {
        land: [3, 10, 14],
        micro: [7],
        water: [4, 11],
        waterMicro: [5, 12]
    }
};
