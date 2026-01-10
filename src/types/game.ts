/**
 * Game Type Definitions
 * Centralized type definitions for game objects and interfaces
 */
import Phaser from 'phaser';

/**
 * Player sprite with custom properties
 */
export interface Player extends Phaser.Physics.Arcade.Sprite {
    body: Phaser.Physics.Arcade.Body;
    stunnedUntil?: number;
    stunVelocity?: { x: number; y: number };
    isMeleeMode?: boolean;
    immuneUntil?: number; // For post-respawn immunity
    // Combo tracking
    comboCount?: number;
    lastComboHitTime?: number;
}

/**
 * Enemy sprite with custom properties
 */
export interface Enemy extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;
    health: number;
    maxHealth: number;
    damage: number;
    xpReward: number;
    speed: number;
    patrolDistance: number;
    knockbackResistance: number;
    startX: number;
    startY: number;
    enemyType: string;
    direction: number;
    hasHitBoundary: boolean;
    floatAngle: number;
    stunnedUntil?: number;
    healthBarBg: Phaser.GameObjects.Rectangle;
    healthBar: Phaser.GameObjects.Rectangle;
    healthBarOffsetY: number;
    isDead?: boolean; // Flag to indicate enemy is dead and should not be updated
    // Chase system properties
    isChasing: boolean;
    lineOfSight: number;
    chaseTarget?: Phaser.Physics.Arcade.Sprite;
    lastDamageTime?: number;
    lastPlayerDamageTime?: number;
    stunVelocity?: { x: number; y: number };
    // Spawner boss properties
    isSpawnerBoss?: boolean;
    minionType?: string;
    minionCount?: number;
    spawnRadius?: number;
    spawnerBossId?: string; // Unique ID for spawner bosses
    parentSpawnerBossId?: string; // For minions to reference their parent
    // Ranged ability properties
    hasRangedAbility?: boolean;
    projectileTexture?: string;
    projectileDamage?: number;
    projectileSpeed?: number;
    projectileCooldown?: number;
    lastProjectileTime?: number;
    // Burst fire properties
    burstCount?: number;
    burstDelay?: number;
    currentBurstShot?: number;
    lastBurstShotTime?: number;
}

/**
 * Projectile with custom properties
 */
export interface Projectile extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;
    damage: number;
    spawnX: number;
    maxRange: number;
    isEnemyProjectile?: boolean; // Flag to identify enemy projectiles
}

/**
 * XP Orb with custom properties
 */
export interface XPOrb extends Phaser.GameObjects.Arc {
    body: Phaser.Physics.Arcade.Body;
    xpValue: number;
    isCompanionOrb?: boolean;
    companionKind?: CompanionKind;
    // Companion orb float behavior
    floatTargetY?: number;
    hasReachedFloatHeight?: boolean;
}

/**
 * Companion types
 */
export type CompanionKind = 'wolf' | 'fish' | 'hawk';

/**
 * Companion sprite with custom properties
 */
export interface Companion extends Phaser.Physics.Arcade.Sprite {
    body: Phaser.Physics.Arcade.Body;
    companionKind: CompanionKind;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    damage: number;
    isMeleeMode?: boolean;
    stunnedUntil?: number;
    healthBarBg: Phaser.GameObjects.Rectangle;
    healthBar: Phaser.GameObjects.Rectangle;
    staminaBarBg: Phaser.GameObjects.Rectangle;
    staminaBar: Phaser.GameObjects.Rectangle;
    barOffsetY: number;
    // Stamina mechanics (mirroring player shield)
    isExhausted?: boolean;
    isDepleted?: boolean;
    needsReset?: boolean;
    depletionPauseRemaining?: number;
}

/**
 * Companion state (persisted across scenes)
 */
export interface CompanionState {
    kind: CompanionKind;
    alive: boolean;
    diedThisRun: boolean;
    currentHealth: number;
    maxHealth: number;
    currentStamina: number;
    maxStamina: number;
}

/**
 * Player statistics
 */
export interface PlayerStats {
    level: number;
    maxHealth: number;
    health: number;
    xp: number;
    xpToLevel: number;
    stamina: number;
    maxStamina: number;
    fuel: number;
    maxFuel: number;
    hasWolfCompanion?: boolean; // Deprecated: keeping for backwards compatibility
    companions?: Map<CompanionKind, CompanionState>;
}

/**
 * WASD key mapping
 */
export interface WASDKeys {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
}

/**
 * Saved position data for scene transitions
 */
export interface SavedPosition {
    x: number;
    y: number;
}

/**
 * Saved enemy data for scene transitions
 */
export interface SavedEnemy {
    x: number;
    y: number;
    health: number;
    enemyType: string;
    startX: number;
    startY: number;
    direction: number;
    floatAngle?: number;
}

/**
 * Game difficulty levels
 */
export type Difficulty = 'easy' | 'normal' | 'hard' | 'godMode';

/**
 * Player size states
 */
export type PlayerSize = 'small' | 'normal' | 'large';

/**
 * Scene keys
 */
export type SceneKey = 'BootScene' | 'MenuScene' | 'MainGameScene' | 'MicroScene' | 'MainGameMacroScene' | 'UnderwaterScene' | 'UnderwaterMicroScene' | 'UnderwaterMacroScene';

/**
 * Level complete flag sprite with custom properties
 */
export interface LevelCompleteFlag extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;
}
