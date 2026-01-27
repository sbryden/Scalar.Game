/**
 * Companion Manager
 * Manages companion spawning, behavior, combat, and lifecycle
 */
import Phaser from 'phaser';
import gameContext from '../utils/GameContext';
import { getPlayerStatsSystem } from '../systems/PlayerStatsSystem';
import { COMPANION_CONFIG, WOLF_COMPANION_CONFIG, type BiomeType } from '../config';
import type { Companion, CompanionKind, CompanionState, Enemy, Projectile } from '../types/game';
import combatSystem from '../systems/CombatSystem';

export class CompanionManager {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Spawn a companion in the current scene
     */
    spawnCompanion(kind: CompanionKind, state: CompanionState): Companion | null {
        const config = COMPANION_CONFIG[kind];
        const player = gameContext.player;
        
        if (!player) {
            console.warn('Cannot spawn companion: no player found');
            return null;
        }

        // Check biome restrictions
        const currentBiome = this.getCurrentBiome();
        if (config.allowedBiomes && !config.allowedBiomes.some(biome => biome === currentBiome)) {
            console.log(`Companion ${kind} not allowed in biome ${currentBiome}`);
            return null;
        }

        // Create companion sprite
        const companion = this.scene.physics.add.sprite(
            player.x + 80,
            player.y,
            config.texture
        ) as Companion;

        // Set up physics
        companion.setCollideWorldBounds(true);
        companion.setScale(config.scale ?? 1);
        
        // Initialize companion properties
        companion.companionKind = kind;
        companion.health = state.currentHealth;
        companion.maxHealth = state.maxHealth;
        companion.stamina = state.currentStamina;
        companion.maxStamina = state.maxStamina;
        companion.isMeleeMode = false;
        companion.isExhausted = false;
        companion.isDepleted = false;
        companion.needsReset = false;
        companion.depletionPauseRemaining = 0;

        // Set damage based on kind
        if (kind === 'wolf') {
            const playerStatsSystem = getPlayerStatsSystem();
            const level = playerStatsSystem.getStats().level;
            companion.damage = WOLF_COMPANION_CONFIG.baseDamage + 
                (level - 1) * WOLF_COMPANION_CONFIG.damageScalePerLevel;
        } else {
            companion.damage = 10; // Default
        }

        // Create health and stamina bars only if config has required bar properties
        if (
            config &&
            typeof config.barWidth === 'number' &&
            typeof config.barHeight === 'number' &&
            typeof config.barOffsetY === 'number' &&
            typeof config.barSpacing === 'number' &&
            typeof config.healthBarColor === 'number' &&
            typeof config.staminaBarColor === 'number' &&
            typeof config.barBackgroundColor === 'number' &&
            typeof config.barBackgroundAlpha === 'number'
        ) {
            this.createCompanionBars(companion, config);
        }

        // Add to game context
        gameContext.addCompanion(companion);
        
        // Set up collision handlers for this companion
        this.setupCompanionCollision(companion);

        console.log(`Spawned ${kind} companion with ${companion.health}/${companion.maxHealth} HP`);
        return companion;
    }

    /**
     * Create HP and stamina bars above companion (like enemy health bars)
     */
    private createCompanionBars(companion: Companion, config: any): void {
        const barWidth = config.barWidth || 40;
        const barHeight = config.barHeight || 4;
        const barOffsetY = config.barOffsetY || -30;
        const barSpacing = config.barSpacing || 6;

        // Health bar background
        companion.healthBarBg = this.scene.add.rectangle(
            companion.x,
            companion.y + barOffsetY,
            barWidth,
            barHeight,
            config.barBackgroundColor || 0x000000,
            config.barBackgroundAlpha || 0.5
        );
        companion.healthBarBg.setOrigin(0, 0.5);
        companion.healthBarBg.setScrollFactor(1);
        companion.healthBarBg.setDepth(1000);

        // Health bar foreground
        companion.healthBar = this.scene.add.rectangle(
            companion.x,
            companion.y + barOffsetY,
            barWidth,
            barHeight,
            config.healthBarColor || 0x00ff00
        );
        companion.healthBar.setOrigin(0, 0.5);
        companion.healthBar.setScrollFactor(1);
        companion.healthBar.setDepth(1001);

        // Stamina bar background
        companion.staminaBarBg = this.scene.add.rectangle(
            companion.x,
            companion.y + barOffsetY + barSpacing,
            barWidth,
            barHeight,
            config.barBackgroundColor || 0x000000,
            config.barBackgroundAlpha || 0.5
        );
        companion.staminaBarBg.setOrigin(0, 0.5);
        companion.staminaBarBg.setScrollFactor(1);
        companion.staminaBarBg.setDepth(1000);

        // Stamina bar foreground
        companion.staminaBar = this.scene.add.rectangle(
            companion.x,
            companion.y + barOffsetY + barSpacing,
            barWidth,
            barHeight,
            config.staminaBarColor || 0x00ffff
        );
        companion.staminaBar.setOrigin(0, 0.5);
        companion.staminaBar.setScrollFactor(1);
        companion.staminaBar.setDepth(1001);

        companion.barOffsetY = barOffsetY;
    }

    /**
     * Update companion bars (mirroring enemy health bar update logic)
     */
    private updateCompanionBars(companion: Companion): void {
        const config = COMPANION_CONFIG[companion.companionKind];
        const barSpacing = config.barSpacing || 6;

        // Health bar position and scale
        const maxHealth = companion.maxHealth;
        const healthRatio = maxHealth > 0 ? companion.health / maxHealth : 0;
        companion.healthBarBg.setPosition(companion.x, companion.y + companion.barOffsetY);
        companion.healthBar.setPosition(companion.x, companion.y + companion.barOffsetY);
        companion.healthBar.setScale(healthRatio, 1);

        // Stamina bar position and scale
        const maxStamina = companion.maxStamina;
        const staminaRatio = maxStamina > 0 ? companion.stamina / maxStamina : 0;
        companion.staminaBarBg.setPosition(companion.x, companion.y + companion.barOffsetY + barSpacing);
        companion.staminaBar.setPosition(companion.x, companion.y + companion.barOffsetY + barSpacing);
        companion.staminaBar.setScale(staminaRatio, 1);
    }

    /**
     * Destroy companion bars
     */
    private destroyCompanionBars(companion: Companion): void {
        companion.healthBarBg?.destroy();
        companion.healthBar?.destroy();
        companion.staminaBarBg?.destroy();
        companion.staminaBar?.destroy();
    }

    /**
     * Update companion behavior each frame
     */
    update(deltaMs: number): void {
        const companions = gameContext.companions;
        const player = gameContext.player;

        if (!player || companions.length === 0) return;

        const delta = deltaMs / 1000; // Convert to seconds

        for (const companion of companions) {
            if (!companion.active) continue;

            // Update movement (follow player)
            this.updateMovement(companion, player, delta);

            // Update stamina
            this.updateStamina(companion, delta);

            // Update melee mode based on nearby enemies
            this.updateMeleeMode(companion);

            // Update visual tint based on state
            this.updateVisualState(companion);

            // Update bars
            this.updateCompanionBars(companion);

            // Sync state back to PlayerStatsSystem
            this.syncCompanionState(companion);
        }
    }

    /**
     * Update companion movement to follow player
     */
    private updateMovement(companion: Companion, player: Phaser.Physics.Arcade.Sprite, delta: number): void {
        const config = COMPANION_CONFIG[companion.companionKind];
        const followDistance = config.followDistance || 80;
        const followSpeed = config.followSpeed || 250; // Default to 250 to match player speed

        const dx = player.x - companion.x;
        const dy = player.y - companion.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only move if beyond follow distance
        if (distance > followDistance) {
            const angle = Math.atan2(dy, dx);
            const velocityX = Math.cos(angle) * followSpeed;
            const velocityY = Math.sin(angle) * followSpeed;

            companion.setVelocity(velocityX, velocityY);

            // Flip sprite based on direction
            companion.setFlipX(velocityX < 0);
        } else {
            // Stop when close enough
            companion.setVelocity(0, 0);
        }
    }

    /**
     * Update stamina (shield-like mechanics)
     */
    private updateStamina(companion: Companion, delta: number): void {
        if (companion.companionKind !== 'wolf') return;

        const config = WOLF_COMPANION_CONFIG.stamina;

        // Handle depletion pause
        if (companion.depletionPauseRemaining && companion.depletionPauseRemaining > 0) {
            companion.depletionPauseRemaining -= delta * 1000;
            if (companion.depletionPauseRemaining <= 0) {
                companion.depletionPauseRemaining = 0;
                companion.isDepleted = false;
            }
            return;
        }

        if (companion.isMeleeMode && !companion.isDepleted) {
            // Consume stamina while in melee mode
            companion.stamina -= config.consumptionRate * delta;

            if (companion.stamina <= 0) {
                companion.stamina = 0;
                companion.isDepleted = true;
                companion.needsReset = true;
                companion.depletionPauseRemaining = config.depletionPauseDuration;
                companion.isMeleeMode = false;
                console.log('Wolf companion stamina depleted');
            } else if (companion.stamina <= config.exhaustionThreshold) {
                companion.isExhausted = true;
            }
        } else {
            // Recharge stamina
            if (!companion.isDepleted) {
                companion.stamina += config.rechargeRate * delta;
                if (companion.stamina > companion.maxStamina) {
                    companion.stamina = companion.maxStamina;
                }

                // Reset exhausted flag when above threshold
                if (companion.stamina > config.exhaustionThreshold) {
                    companion.isExhausted = false;
                    if (companion.needsReset) {
                        companion.needsReset = false;
                    }
                }
            }
        }
    }

    /**
     * Toggle melee mode based on nearby enemies
     */
    private updateMeleeMode(companion: Companion): void {
        if (companion.companionKind !== 'wolf') return;
        if (companion.isDepleted || companion.needsReset) {
            companion.isMeleeMode = false;
            return;
        }

        const config = WOLF_COMPANION_CONFIG;
        const attackRange = config.attackRange || 60;
        const enemies = gameContext.enemies;

        if (!enemies) {
            companion.isMeleeMode = false;
            return;
        }

        // Check if any enemy is within attack range
        let hasNearbyEnemy = false;
        enemies.children.entries.forEach((enemyObj) => {
            const enemy = enemyObj as Enemy;
            if (enemy.active && !enemy.isDead) {
                const dx = enemy.x - companion.x;
                const dy = enemy.y - companion.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= attackRange) {
                    hasNearbyEnemy = true;
                }
            }
        });

        companion.isMeleeMode = hasNearbyEnemy;
    }

    /**
     * Update visual state (tints) based on companion state
     */
    private updateVisualState(companion: Companion): void {
        const config = COMPANION_CONFIG[companion.companionKind];
        const tintConfig = (config as { tint?: { exhausted?: number; melee?: number; normal?: number } }).tint;

        // If no tint configuration exists for this companion, clear any existing tint and exit
        if (!tintConfig) {
            if (typeof (companion as any).clearTint === 'function') {
                (companion as any).clearTint();
            }
            return;
        }

        if (companion.isExhausted && tintConfig.exhausted !== undefined) {
            companion.setTint(tintConfig.exhausted);
        } else if (companion.isMeleeMode && tintConfig.melee !== undefined) {
            companion.setTint(tintConfig.melee);
        } else if (tintConfig.normal !== undefined) {
            companion.setTint(tintConfig.normal);
        } else if (typeof (companion as any).clearTint === 'function') {
            // Fallback if no appropriate tint value is configured
            (companion as any).clearTint();
        }
    }

    /**
     * Sync companion sprite state back to PlayerStatsSystem
     */
    private syncCompanionState(companion: Companion): void {
        const playerStatsSystem = getPlayerStatsSystem();
        playerStatsSystem.updateCompanionState(companion.companionKind, {
            currentHealth: companion.health,
            currentStamina: companion.stamina,
            alive: companion.health > 0
        });

        // Check for death
        if (companion.health <= 0) {
            this.handleCompanionDeath(companion);
        }
    }

    /**
     * Handle companion death
     */
    private handleCompanionDeath(companion: Companion): void {
        const playerStatsSystem = getPlayerStatsSystem();
        playerStatsSystem.markCompanionDead(companion.companionKind);

        console.log(`${companion.companionKind} companion has died and cannot be revived this run`);

        // Destroy companion sprite and bars
        this.destroyCompanion(companion);
    }

    /**
     * Destroy a companion sprite and its bars
     */
    destroyCompanion(companion: Companion): void {
        this.destroyCompanionBars(companion);
        gameContext.removeCompanion(companion);
        companion.destroy();
    }

    /**
     * Despawn all companions (scene transition or player death)
     */
    despawnAll(): void {
        const companions = [...gameContext.companions];
        for (const companion of companions) {
            this.destroyCompanion(companion);
        }
        gameContext.clearCompanions();
    }

    /**
     * Respawn companions based on PlayerStatsSystem state
     * Called when entering a scene
     */
    respawnCompanions(): void {
        const playerStatsSystem = getPlayerStatsSystem();
        const activeCompanions = playerStatsSystem.getActiveCompanions();

        for (const companionState of activeCompanions) {
            this.spawnCompanion(companionState.kind, companionState);
        }
    }

    /**
     * Set up collision handlers for a single companion
     */
    private setupCompanionCollision(companion: Companion): void {
        const { enemies, projectiles } = gameContext;
        
        if (!enemies || !projectiles) {
            return;
        }
        
        // Companion-Enemy collision (melee damage)
        this.scene.physics.add.overlap(companion, enemies, (obj1, obj2) => {
            const isEnemy = (obj: unknown): obj is Enemy => {
                return obj !== null && typeof obj === 'object' && 'health' in obj && 'enemyType' in obj;
            };
            
            let companionObj: Companion;
            let enemy: Enemy;
            
            if (isEnemy(obj1)) {
                enemy = obj1;
                companionObj = obj2 as Companion;
            } else if (isEnemy(obj2)) {
                enemy = obj2;
                companionObj = obj1 as Companion;
            } else {
                return;
            }
            
            // Handle companion-enemy collision
            combatSystem.handleCompanionEnemyCollision(companionObj, enemy, this.scene.time.now);
        }, undefined, this.scene);
        
        // Companion-Enemy Projectile collision (companion takes damage)
        this.scene.physics.add.overlap(companion, projectiles, (obj1, obj2) => {
            const isProjectile = (obj: unknown): obj is Projectile => {
                return obj !== null && typeof obj === 'object' && 'damage' in obj && 'spawnX' in obj;
            };
            
            let companionObj: Companion;
            let projectile: Projectile;
            
            if (isProjectile(obj1)) {
                projectile = obj1;
                companionObj = obj2 as Companion;
            } else if (isProjectile(obj2)) {
                projectile = obj2;
                companionObj = obj1 as Companion;
            } else {
                return;
            }
            
            // Only enemy projectiles damage companions
            if (projectile.isEnemyProjectile) {
                // Handle enemy projectile hitting companion
                combatSystem.handleEnemyProjectileHitCompanion(projectile, companionObj, this.scene.time.now);
            }
        }, undefined, this.scene);
    }

    /**
     * Get current biome from scene key
     */
    private getCurrentBiome(): BiomeType {
        const sceneKey = gameContext.currentSceneKey;
        
        if (sceneKey.includes('Underwater')) {
            return 'water';
        } else if (sceneKey === 'MainGameScene' || sceneKey === 'MicroScene' || sceneKey === 'MainGameMacroScene') {
            return 'land';
        }
        
        return 'land'; // Default
    }

    /**
     * Apply damage to a companion
     */
    takeDamage(companion: Companion, amount: number): void {
        // Apply damage reduction if in melee mode
        if (companion.isMeleeMode && companion.companionKind === 'wolf') {
            amount *= (1 - WOLF_COMPANION_CONFIG.meleeModeDamageReduction);
        }

        companion.health = Math.max(0, companion.health - amount);
        
        // Visual feedback
        companion.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (companion.active) {
                this.updateVisualState(companion);
            }
        });
    }
}

// Singleton instance
let companionManagerInstance: CompanionManager | null = null;

/**
 * Initialize the companion manager
 */
export function initializeCompanionManager(scene: Phaser.Scene): CompanionManager {
    companionManagerInstance = new CompanionManager(scene);
    return companionManagerInstance;
}

/**
 * Get the companion manager instance
 */
export function getCompanionManager(): CompanionManager | null {
    return companionManagerInstance;
}

/**
 * Reset companion manager
 */
export function resetCompanionManager(): void {
    companionManagerInstance = null;
}

export default getCompanionManager;
