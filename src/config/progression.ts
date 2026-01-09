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
        startingXPToLevel: 100,
        healthIncreasePerLevel: 20,
        xpScalingFactor: 1.5
    },
    vehicleUpgrade: {
        submarineLevel2Threshold: 2,
        submarineLevel3Threshold: 3,
        maxCarLevel: 5
    }
} as const;

// Progressive Level System configuration
export const LEVEL_SYSTEM_CONFIG = {
    startingLevel: 1,
    enemyCountBase: 1.0,
    enemyCountIncreasePerLevel: 0.1,
    enemyHealthBase: 1.0,
    enemyHealthIncreasePerLevel: 0.15,
    enemyDamageBase: 1.0,
    enemyDamageIncreasePerLevel: 0.10,
    enemySpeedBase: 1.0,
    enemySpeedIncreasePerLevel: 0.05,
    maxLevel: 99
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
