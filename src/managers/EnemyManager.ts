/**
 * Enemy Manager
 * Manages all enemy-related functionality including spawning, AI, and behavior.
 * Singleton pattern for consistent state management across the game.
 */
import { ENEMY_CONFIG, EASY_MODE_CONFIG, HARD_MODE_CONFIG, PHYSICS_CONFIG, VISUAL_CONFIG, DETECTION_CONFIG } from "../config";
import gameState from "../utils/GameContext";
import combatSystem from "../systems/CombatSystem";
import type { Enemy, Projectile } from '../types/game';
import playerStatsSystem from '../systems/PlayerStatsSystem';
import levelProgressionSystem from '../systems/LevelProgressionSystem';
import projectileManager from './ProjectileManager';

class EnemyManager {
    constructor() {
        // No state to initialize - all enemy data is managed through gameState.enemies group
    }

    /**
     * Helper function to check if an enemy type is a swimming enemy.
     * Swimming enemies can move freely in all directions and don't have gravity.
     * 
     * @param enemyType - The type identifier of the enemy
     * @returns True if the enemy is a swimming type
     */
    isSwimmingEnemy(enemyType: string): boolean {
        return enemyType === "micro" || enemyType === "fish" || enemyType === "water_swimming_micro" ||
               enemyType === "boss_land_micro" || enemyType === "boss_water_swimming" || 
               enemyType === "boss_water_swimming_micro" || enemyType === "boss_water_shark" ||
               // Macro scale swimming enemies
               enemyType === "whale" || enemyType === "giant_shark" || enemyType === "sea_dragon" ||
               enemyType === "whale_boss" || enemyType === "giant_shark_boss" || enemyType === "sea_serpent_boss";
    }

    /**
     * Spawn a new enemy at the specified location.
     * Applies difficulty and level-based multipliers to enemy stats.
     * 
     * @param scene - The Phaser scene to spawn the enemy in
     * @param x - The x-coordinate for the enemy spawn position
     * @param y - The y-coordinate for the enemy spawn position
     * @param enemyType - The type of enemy to spawn (default: "generic")
     * @returns The spawned Enemy sprite
     * @throws Error if enemy type is unknown or gameState.enemies is not initialized
     */
    spawnEnemy(scene: Phaser.Scene, x: number, y: number, enemyType: string = "generic"): Enemy {
        const config = ENEMY_CONFIG[enemyType];
        
        // Guard against unknown enemy types
        if (!config) {
            console.error(`Unknown enemy type: ${enemyType}. Falling back to 'generic'.`);
            return this.spawnEnemy(scene, x, y, 'generic');
        }
        
        // Check if this is a boss enemy
        const isBoss = enemyType.startsWith('boss_');
        
        // Apply difficulty multipliers
        const difficulty = playerStatsSystem.difficulty;
        let difficultyHealthMultiplier = 1;
        let difficultySpeedMultiplier = 1;
        let lineOfSightMultiplier = 1;
        
        if (difficulty === 'easy') {
            difficultyHealthMultiplier = EASY_MODE_CONFIG.enemyHealthMultiplier;
            difficultySpeedMultiplier = EASY_MODE_CONFIG.enemySpeedMultiplier;
            lineOfSightMultiplier = EASY_MODE_CONFIG.enemyLineOfSightMultiplier;
        } else if (difficulty === 'hard') {
            difficultyHealthMultiplier = HARD_MODE_CONFIG.enemyHealthMultiplier;
            difficultySpeedMultiplier = HARD_MODE_CONFIG.enemySpeedMultiplier;
            lineOfSightMultiplier = HARD_MODE_CONFIG.enemyLineOfSightMultiplier;
        }
        
        // Apply level-based multipliers (these stack with difficulty multipliers)
        const levelHealthMultiplier = levelProgressionSystem.getEnemyHealthMultiplier();
        const levelDamageMultiplier = levelProgressionSystem.getEnemyDamageMultiplier();
        const levelSpeedMultiplier = levelProgressionSystem.getEnemySpeedMultiplier();
        
        // Combine all multipliers (damage not affected by difficulty, only by level)
        const finalHealthMultiplier = difficultyHealthMultiplier * levelHealthMultiplier;
        const finalSpeedMultiplier = difficultySpeedMultiplier * levelSpeedMultiplier;
        const finalDamageMultiplier = levelDamageMultiplier;
        
        // Select texture - handle both single textures and weighted variants
        const texture = this.selectEnemyTexture(config.texture);
        
        const enemy = scene.add.sprite(x, y, texture) as Enemy;
        // Boss enemies are scaled according to config
        const baseScale = PHYSICS_CONFIG.enemy.baseScale;
        let enemyScale = isBoss ? baseScale * PHYSICS_CONFIG.enemy.bossScaleMultiplier : baseScale;
        
        // Spawner boss is 2x the size of regular bosses
        if (enemyType === 'spawner_boss_land') {
            enemyScale *= 2;
        }
        
        enemy.setScale(enemyScale);
        scene.physics.add.existing(enemy);
        (enemy.body as Phaser.Physics.Arcade.Body).setBounce(PHYSICS_CONFIG.enemy.bounce);
        (enemy.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

        // Swimming enemies don't have gravity
        if (this.isSwimmingEnemy(enemyType)) {
            (enemy.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        }

        enemy.health = config.health * finalHealthMultiplier;
        enemy.maxHealth = config.health * finalHealthMultiplier;
        enemy.damage = config.damage * finalDamageMultiplier;
        enemy.xpReward = config.xpReward;
        enemy.speed = config.speed * finalSpeedMultiplier;
        enemy.patrolDistance = config.patrolDistance;
        enemy.knockbackResistance = config.knockbackResistance;
        enemy.startX = x;
        enemy.startY = y;
        enemy.enemyType = enemyType;
        enemy.direction = 1;
        enemy.hasHitBoundary = false;
        enemy.floatAngle = Math.random() * Math.PI * 2; // Random starting angle for floating
        enemy.setFlipX(false); // Start facing right
        
        // Initialize chase system properties
        // Calculate line of sight based on larger of width and height
        const largerDimension = Math.max(enemy.displayWidth, enemy.displayHeight);
        let calculatedLineOfSight = largerDimension * config.lineOfSightMultiplier * lineOfSightMultiplier;
        
        // Apply minimum line of sight
        calculatedLineOfSight = Math.max(calculatedLineOfSight, DETECTION_CONFIG.minLineOfSight);
        
        // Bosses get enhanced line of sight based on screen width
        if (isBoss && enemy.scene && enemy.scene.cameras.main) {
            const screenWidth = enemy.scene.cameras.main.width;
            const bossLineOfSight = screenWidth * DETECTION_CONFIG.bossLineOfSightScreenPercent;
            const maxLineOfSight = screenWidth * DETECTION_CONFIG.maxLineOfSightScreenPercent;
            // Use the larger of calculated or boss-specific, but cap at max
            calculatedLineOfSight = Math.min(Math.max(calculatedLineOfSight, bossLineOfSight), maxLineOfSight);
        }
        
        enemy.isChasing = false;
        enemy.lineOfSight = calculatedLineOfSight;
        enemy.chaseTarget = undefined;
        
        // Configure spawner boss properties
        if (enemyType === 'spawner_boss_land') {
            enemy.isSpawnerBoss = true;
            enemy.minionType = 'rock_minion';
            enemy.minionCount = 4;
            enemy.spawnRadius = 100;
        }
        
        // Configure spawner micro enemies
        if (enemyType === 'spawner_micro') {
            enemy.isSpawnerBoss = true;
            enemy.minionType = 'micro_minion';
            enemy.minionCount = 3;
            enemy.spawnRadius = 50;
        }
        
        // Configure spawner water micro enemies
        if (enemyType === 'spawner_water_swimming_micro') {
            enemy.isSpawnerBoss = true;
            enemy.minionType = 'water_micro_minion';
            enemy.minionCount = 3;
            enemy.spawnRadius = 50;
        }
        
        // Configure ranged ability properties
        if (config.hasRangedAbility) {
            enemy.hasRangedAbility = true;
            enemy.projectileTexture = config.projectileTexture;
            enemy.projectileDamage = config.projectileDamage;
            enemy.projectileSpeed = config.projectileSpeed;
            enemy.projectileCooldown = config.projectileCooldown;
            
            // Configure burst fire properties if present
            if (config.burstCount && config.burstDelay) {
                enemy.burstCount = config.burstCount;
                enemy.burstDelay = config.burstDelay;
                enemy.currentBurstShot = 0;
            }
        }

        const barWidth = VISUAL_CONFIG.healthBar.width;
        const barHeight = VISUAL_CONFIG.healthBar.height;
        const healthBarOffsetY = enemy.displayHeight / 2 + VISUAL_CONFIG.healthBar.offsetY;
        enemy.healthBarBg = scene.add.rectangle(
            x,
            y - healthBarOffsetY,
            barWidth,
            barHeight,
            0x333333
        );
        enemy.healthBar = scene.add.rectangle(
            x,
            y - healthBarOffsetY,
            barWidth,
            barHeight,
            0xff0000
        );
        enemy.healthBar.setDepth(VISUAL_CONFIG.healthBar.depth);
        enemy.healthBarBg.setDepth(VISUAL_CONFIG.healthBar.depth);
        enemy.healthBarOffsetY = healthBarOffsetY;

        if (!gameState.enemies) {
            console.error('gameState.enemies is not initialized');
            throw new Error('gameState.enemies is not initialized');
        }
        
        gameState.enemies.add(enemy);
        return enemy;
    }

    /**
     * Update enemy AI behavior for a single enemy.
     * Handles chase detection, AI state transitions, and delegates to appropriate AI functions.
     * 
     * @param enemy - The enemy to update
     * @param gameTime - Current game time in milliseconds
     */
    updateEnemyAI(enemy: Enemy, gameTime: number): void {
        // Skip AI updates for dead enemies
        if (enemy.isDead) {
            return;
        }
        
        // Check if enemy is stunned
        if (enemy.stunnedUntil && gameTime < enemy.stunnedUntil) {
            // Enemy is stunned, don't update AI
            return;
        }
        
        // Check for proximity-based detection if not already chasing
        if (!enemy.isChasing && gameState.player) {
            const distanceToPlayer = Phaser.Math.Distance.Between(
                enemy.x, enemy.y,
                gameState.player.x, gameState.player.y
            );
            
            const playerIsImmune = gameState.player.immuneUntil && gameTime < gameState.player.immuneUntil;
            
            if (distanceToPlayer <= enemy.lineOfSight && !playerIsImmune) {
                enemy.isChasing = true;
                enemy.chaseTarget = gameState.player;
            }
        }
        
        // If chasing, use chase AI instead of patrol AI
        if (enemy.isChasing && enemy.chaseTarget && enemy.chaseTarget.active) {
            this.updateChaseAI(enemy);
            // Update health bar after chase AI
            this.updateEnemyHealthBar(enemy);
            return;
        }
        
        // Reset chase state if target is no longer valid
        if (enemy.isChasing && (!enemy.chaseTarget || !enemy.chaseTarget.active)) {
            enemy.isChasing = false;
            enemy.chaseTarget = undefined;
        }
        
        // Default patrol behavior
        this.updatePatrolAI(enemy);
        this.updateEnemyHealthBar(enemy);
    }

    /**
     * Apply damage to an enemy from a projectile.
     * Delegates to the combat system for actual damage handling.
     * 
     * @param projectile - The projectile that hit the enemy
     * @param enemy - The enemy that was hit
     */
    async damageEnemy(projectile: Projectile, enemy: Enemy): Promise<void> {
        combatSystem.damageEnemy(projectile, enemy);
    }

    /**
     * Select a texture for an enemy.
     * Handles both single textures and arrays of weighted texture variants.
     * 
     * @param textureConfig - Either a string texture key or array of weighted variants
     * @returns The selected texture key
     */
    private selectEnemyTexture(textureConfig: string | Array<{ texture: string; weight: number }>): string {
        // If it's a string, return it directly
        if (typeof textureConfig === 'string') {
            return textureConfig;
        }
        
        // If it's an array, do weighted random selection
        if (Array.isArray(textureConfig)) {
            if (textureConfig.length === 0) {
                console.error('Empty texture variant array');
                return 'enemy';
            }
            
            if (textureConfig.length === 1) {
                return textureConfig[0]!.texture;
            }
            
            const random = Math.random();
            let cumulativeWeight = 0;
            
            for (const variant of textureConfig) {
                cumulativeWeight += variant.weight;
                if (random < cumulativeWeight) {
                    return variant.texture;
                }
            }
            
            // Fallback to last option if no match (shouldn't happen with proper weights)
            return textureConfig[textureConfig.length - 1]!.texture;
        }
        
        console.error('Invalid texture config:', textureConfig);
        return 'enemy';
    }

    /**
     * Update chase AI for an enemy that is actively chasing a target.
     * Handles movement toward target and ranged attacks.
     * 
     * @param enemy - The enemy to update
     */
    private updateChaseAI(enemy: Enemy): void {
        if (!enemy.chaseTarget) return;
        
        const config = ENEMY_CONFIG[enemy.enemyType];
        
        // Guard against unknown enemy types
        if (!config) {
            console.error(`Unknown enemy type: ${enemy.enemyType}`);
            return;
        }
        
        const chaseSpeed = enemy.speed * config.chaseSpeedMultiplier;
        
        // Calculate direction to player
        const angleToPlayer = Math.atan2(
            enemy.chaseTarget.y - enemy.y,
            enemy.chaseTarget.x - enemy.x
        );
        
        // Fire projectile if enemy has ranged ability
        if (enemy.hasRangedAbility && enemy.scene) {
            const gameTime = enemy.scene.time.now;
            projectileManager.fireEnemyProjectile(enemy.scene, enemy, gameTime);
        }
        
        // Different behavior for swimming vs ground enemies
        if (this.isSwimmingEnemy(enemy.enemyType)) {
            // Swimming enemies can move freely in all directions
            const velocityX = Math.cos(angleToPlayer) * chaseSpeed;
            const velocityY = Math.sin(angleToPlayer) * chaseSpeed;
            
            enemy.body.setVelocityX(velocityX);
            enemy.body.setVelocityY(velocityY);
            
            // Update sprite direction
            enemy.setFlipX(velocityX < 0);
            
            // Keep enemies within screen bounds
            if (enemy.y < PHYSICS_CONFIG.enemy.screenTopBoundary) {
                enemy.y = PHYSICS_CONFIG.enemy.screenTopBoundary;
                enemy.body.setVelocityY(Math.abs(enemy.body.velocity.y));
            } else if (enemy.y > PHYSICS_CONFIG.enemy.screenBottomBoundary) {
                enemy.y = PHYSICS_CONFIG.enemy.screenBottomBoundary;
                enemy.body.setVelocityY(-Math.abs(enemy.body.velocity.y));
            }
        } else {
            // Ground enemies (crab, generic) - respect gravity and jump
            const horizontalDirection = Math.sign(enemy.chaseTarget.x - enemy.x);
            enemy.body.setVelocityX(chaseSpeed * horizontalDirection);
            enemy.setFlipX(horizontalDirection === -1);
            
            // Jump if player is above and enemy is on ground
            const verticalDistance = enemy.y - enemy.chaseTarget.y;
            const horizontalDistance = Math.abs(enemy.x - enemy.chaseTarget.x);
            
            if (enemy.body.touching.down && 
                verticalDistance > PHYSICS_CONFIG.enemy.aggroJump.verticalThreshold && 
                horizontalDistance < PHYSICS_CONFIG.enemy.aggroJump.horizontalThreshold) {
                // Jump towards player
                enemy.body.setVelocityY(PHYSICS_CONFIG.enemy.aggroJump.velocity);
            }
            
            // Keep enemy above ground
            const groundY = PHYSICS_CONFIG.enemy.groundY;
            const enemyHalfHeight = enemy.displayHeight / 2;
            const minY = groundY - enemyHalfHeight;
            if (enemy.y > minY) {
                enemy.y = minY;
            }
        }
    }

    /**
     * Update patrol AI for an enemy following its default patrol pattern.
     * Different behavior for swimming vs ground-based enemies.
     * 
     * @param enemy - The enemy to update
     */
    private updatePatrolAI(enemy: Enemy): void {
        // Different behavior for swimming enemies (fish, water_swimming_micro, micro) vs ground enemies
        if (this.isSwimmingEnemy(enemy.enemyType)) {
            // Swimming enemies float around their zone in a circular/wavy pattern
            const maxDistance = enemy.patrolDistance / 2;
            const distFromStart = Math.abs(enemy.x - enemy.startX);

            if (distFromStart > maxDistance) {
                if (!enemy.hasHitBoundary) {
                    enemy.direction *= -1;
                    enemy.hasHitBoundary = true;
                    enemy.setFlipX(enemy.direction === -1);
                }
            } else {
                enemy.hasHitBoundary = false;
            }

            // Float with sinusoidal vertical movement - allow full screen height
            enemy.floatAngle += PHYSICS_CONFIG.enemy.patrol.floatAngleIncrement;
            const floatSpeed = enemy.speed * (enemy.enemyType === "water_swimming_micro" ? 
                PHYSICS_CONFIG.enemy.patrol.floatSpeedPlankton : 
                PHYSICS_CONFIG.enemy.patrol.floatSpeedOther);
            const verticalAmplitude = enemy.enemyType === "water_swimming_micro" ? 
                PHYSICS_CONFIG.enemy.patrol.verticalAmplitudePlankton : 
                PHYSICS_CONFIG.enemy.patrol.verticalAmplitudeOther;

            enemy.body.setVelocityX(floatSpeed * enemy.direction);
            enemy.body.setVelocityY(Math.cos(enemy.floatAngle) * verticalAmplitude);

            // Keep enemies within screen bounds (but allow them to reach top)
            if (enemy.y < PHYSICS_CONFIG.enemy.screenTopBoundary) {
                enemy.y = PHYSICS_CONFIG.enemy.screenTopBoundary;
                enemy.body.setVelocityY(Math.abs(enemy.body.velocity.y));
            } else if (enemy.y > PHYSICS_CONFIG.enemy.screenBottomBoundary) {
                enemy.y = PHYSICS_CONFIG.enemy.screenBottomBoundary;
                enemy.body.setVelocityY(-Math.abs(enemy.body.velocity.y));
            }
        } else if (enemy.enemyType === "crab") {
            // Crabs walk on ground but can jump occasionally
            const maxDistance = enemy.patrolDistance / 2;
            const distFromStart = Math.abs(enemy.x - enemy.startX);

            if (distFromStart > maxDistance) {
                if (!enemy.hasHitBoundary) {
                    enemy.direction *= -1;
                    enemy.hasHitBoundary = true;
                    enemy.setFlipX(enemy.direction === -1);
                }
            } else {
                enemy.hasHitBoundary = false;
            }

            enemy.body.setVelocityX(enemy.speed * enemy.direction);

            // Occasional small jump (configurable chance per frame when on ground)
            if (enemy.body.touching.down && Math.random() < PHYSICS_CONFIG.enemy.patrol.crabJumpProbability) {
                enemy.body.setVelocityY(PHYSICS_CONFIG.enemy.patrol.crabJumpVelocity);
            }

            // Keep enemy above ground
            const groundY = PHYSICS_CONFIG.enemy.groundY;
            const enemyHalfHeight = enemy.displayHeight / 2;
            const minY = groundY - enemyHalfHeight;
            if (enemy.y > minY) {
                enemy.y = minY;
            }
        } else {
            // Ground enemies - original behavior (generic, etc.)
            const maxDistance = enemy.patrolDistance / 2;
            const distFromStart = Math.abs(enemy.x - enemy.startX);

            if (distFromStart > maxDistance) {
                if (!enemy.hasHitBoundary) {
                    enemy.direction *= -1;
                    enemy.hasHitBoundary = true;
                    enemy.setFlipX(enemy.direction === -1);
                }
            } else {
                enemy.hasHitBoundary = false;
            }

            enemy.body.setVelocityX(enemy.speed * enemy.direction);

            // Keep enemy above ground
            const groundY = PHYSICS_CONFIG.enemy.groundY;
            const enemyHalfHeight = enemy.displayHeight / 2;
            const minY = groundY - enemyHalfHeight;
            if (enemy.y > minY) {
                enemy.y = minY;
            }
        }
    }

    /**
     * Update the visual health bar for an enemy.
     * Positions the health bar above the enemy and scales it based on current health.
     * 
     * @param enemy - The enemy to update the health bar for
     */
    private updateEnemyHealthBar(enemy: Enemy): void {
        // Skip health bar updates for dead enemies
        if (enemy.isDead) {
            return;
        }
        
        // Update health bar for all enemies
        if (enemy.healthBar && enemy.healthBarBg) {
            const barWidth = VISUAL_CONFIG.healthBar.width;
            const healthPercent = enemy.health / enemy.maxHealth;
            enemy.healthBar.setDisplayOrigin(barWidth / 2, VISUAL_CONFIG.healthBar.displayOriginY);
            enemy.healthBar.setScale(healthPercent, 1);
            const healthBarY = enemy.y - enemy.healthBarOffsetY;
            enemy.healthBar.x = enemy.x;
            enemy.healthBar.y = healthBarY;
            enemy.healthBarBg.x = enemy.x;
            enemy.healthBarBg.y = healthBarY;
        }
    }
}

// Singleton instance management
let enemyManagerInstance: EnemyManager | null = null;

/**
 * Get the EnemyManager instance, creating it if necessary
 */
export function getEnemyManager(): EnemyManager {
    if (!enemyManagerInstance) {
        enemyManagerInstance = new EnemyManager();
    }
    return enemyManagerInstance;
}

/**
 * Reset the EnemyManager instance (useful for testing)
 */
export function resetEnemyManager(): void {
    enemyManagerInstance = null;
}

// Default export for backward compatibility
export default getEnemyManager();
