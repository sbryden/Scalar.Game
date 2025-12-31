/**
 * Game Type Definitions
 * Centralized type definitions for game objects and interfaces
 */
import Phaser from 'phaser';

/**
 * Player sprite with custom properties
 */
export interface Player extends Phaser.Physics.Arcade.Sprite {
    stunnedUntil?: number;
    stunVelocity?: { x: number; y: number };
    isMeleeMode?: boolean;
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
    // Aggro system properties
    isAggroed: boolean;
    aggroRange: number;
    aggroTarget?: Phaser.Physics.Arcade.Sprite;
    lastDamageTime?: number;
    lastPlayerDamageTime?: number;
    stunVelocity?: { x: number; y: number };
}

/**
 * Projectile with custom properties
 */
export interface Projectile extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;
    damage: number;
    spawnX: number;
    maxRange: number;
}

/**
 * XP Orb with custom properties
 */
export interface XPOrb extends Phaser.GameObjects.Arc {
    body: Phaser.Physics.Arcade.Body;
    xpValue: number;
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
export type Difficulty = 'normal' | 'godMode';

/**
 * Player size states
 */
export type PlayerSize = 'small' | 'normal' | 'large';

/**
 * Scene keys
 */
export type SceneKey = 'BootScene' | 'MenuScene' | 'MainGameScene' | 'MicroScene' | 'UnderwaterScene' | 'UnderwaterMicroScene';
