/**
 * Configuration Index
 * Barrel export for all configuration modules
 */

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
    HARD_MODE_CONFIG
} from './enemies';
export type { EnemyStats, TextureVariant } from './enemies';

// Combat
export {
    PLAYER_COMBAT_CONFIG,
    PROJECTILE_CONFIG,
    COMBAT_CONFIG,
    GOD_MODE_CONFIG
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
    LEVEL_SYSTEM_CONFIG,
    BOSS_MODE_CONFIG
} from './progression';
