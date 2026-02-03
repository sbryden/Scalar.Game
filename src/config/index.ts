/**
 * Configuration Index
 * Barrel export for all configuration modules
 */

// Options
export {
    getOptions,
    saveOptions,
    resetOptions,
    getDefaultOptions,
    loadOptions
} from './options';
export type { GameOptions } from './options';

// World and scene
export {
    WORLD_WIDTH,
    WORLD_HEIGHT,
    CAMERA_PADDING,
    SIZE_CONFIG,
    SIZE_CHANGE_COOLDOWN
} from './world';
export type { SizeKey } from './world';

// Enemies
export {
    ENEMY_CONFIG,
    BOSS_TEXTURE_CONFIG,
    DETECTION_CONFIG,
    EASY_MODE_CONFIG,
    NORMAL_MODE_CONFIG,
    HARD_MODE_CONFIG,
    BRUTAL_MODE_CONFIG
} from './enemies';
export type { EnemyStats, TextureVariant, DifficultyConfig } from './enemies';

// Combat
export {
    PLAYER_COMBAT_CONFIG,
    PROJECTILE_CONFIG,
    COMBAT_CONFIG,
    GOD_MODE_CONFIG,
    JET_MECH_CONFIG
} from './combat';

// Physics
export {
    PHYSICS_CONFIG,
    SPAWN_CONFIG
} from './physics';

// UI
export {
    VISUAL_CONFIG,
    STAMINA_CONFIG,
    STAMINA_UI_CONFIG,
    FUEL_CONFIG,
    FUEL_UI_CONFIG
} from './ui';

// Progression
export {
    XP_CONFIG,
    STAGE_SYSTEM_CONFIG,
    BOSS_MODE_CONFIG
} from './progression';

// Companions
export {
    COMPANION_CONFIG,
    WOLF_COMPANION_CONFIG,
    FISH_COMPANION_CONFIG,
    HAWK_COMPANION_CONFIG,
    getCompanionConfig,
    isCompanionAllowedInBiome
} from './companions';
export type { BiomeType } from './companions';

// Utility functions
import { EASY_MODE_CONFIG, NORMAL_MODE_CONFIG, HARD_MODE_CONFIG, BRUTAL_MODE_CONFIG, type DifficultyConfig } from './enemies';
import type { Difficulty } from '../types/game';

/**
 * Get the configuration object for a given difficulty level
 * @param difficulty - The difficulty level
 * @returns The corresponding difficulty configuration
 */
export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
    switch (difficulty) {
        case 'easy':
            return EASY_MODE_CONFIG;
        case 'normal':
            return NORMAL_MODE_CONFIG;
        case 'hard':
            return HARD_MODE_CONFIG;
        case 'brutal':
            return BRUTAL_MODE_CONFIG;
        case 'godMode':
            // God mode uses easy config for enemies (player is invincible anyway)
            return EASY_MODE_CONFIG;
        default:
            return NORMAL_MODE_CONFIG;
    }
}
