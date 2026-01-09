/**
 * Projectile Manager
 * Manages all projectile-related functionality including player and enemy projectiles.
 * Singleton pattern for consistent state management across the game.
 */
import { PROJECTILE_CONFIG, WORLD_WIDTH, PHYSICS_CONFIG, COMBAT_CONFIG, VISUAL_CONFIG } from '../config';
import gameState from '../utils/GameContext';
import playerStatsSystem from '../systems/PlayerStatsSystem';
import levelStatsTracker from '../systems/LevelStatsTracker';
import type { WASDKeys, Projectile, Enemy } from '../types/game';

class ProjectileManager {
    private lastProjectileTime: number = 0;

    constructor() {
        // No state to initialize - projectile data is managed through gameState.projectiles group
    }

    /**
     * Fire a projectile from the player.
     * Handles cooldown, direction detection, underwater behavior, and stats tracking.
     * 
     * @param scene - The Phaser scene to spawn the projectile in
     */
    fireProjectile(scene: Phaser.Scene): void {
        const gameTime = scene.time.now;
        
        if (gameTime - this.lastProjectileTime < PROJECTILE_CONFIG.basic.cooldown) {
            return;
        }
        
        this.lastProjectileTime = gameTime;
        
        const config = PROJECTILE_CONFIG.basic;
        
        const player = gameState.player;
        if (!player) return;
        
        // Determine direction based on which way the player is facing
        const direction = player.flipX ? -1 : 1;
        
        // Check if underwater for slower projectile speed
        const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                            gameState.currentSceneKey === 'UnderwaterMicroScene';
        const speedMultiplier = isUnderwater ? PHYSICS_CONFIG.underwater.speedMultiplier : 1.0;
        
        const velocityX = config.speed * direction * speedMultiplier;
        
        // Offset projectile spawn behind the vehicle (opposite of direction)
        const spawnOffsetX = direction === 1 ? PHYSICS_CONFIG.projectile.spawnOffsetX : -PHYSICS_CONFIG.projectile.spawnOffsetX;
        const projectileX = player.x + spawnOffsetX;
        
        // Projectile spawns at configured height ratio from top of tank
        const tankHeight = player.displayHeight;
        const projectileY = player.y - tankHeight / 2 + PHYSICS_CONFIG.projectile.heightRatio * tankHeight;
        
        // Create projectile (torpedo underwater, beam on land)
        const projectileTexture = isUnderwater ? 'torpedo' : 'beam';
        const projectile = scene.add.image(projectileX, projectileY, projectileTexture) as Projectile;
        projectile.setOrigin(0.5, 0.5);
        projectile.setDepth(PHYSICS_CONFIG.projectile.depth);
        
        // Scale projectile based on player scale
        const playerScale = player.scaleX;
        projectile.setScale(playerScale);
        
        // Flip the image if firing left
        if (direction === -1) {
            projectile.setFlipX(true);
        }
        
        gameState.projectiles?.add(projectile);
        scene.physics.add.existing(projectile);
        
        // Type assertion since we know projectile.body is an Arcade Body after physics.add.existing
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setBounce(0, 0);
        body.setCollideWorldBounds(true);
        body.setVelocity(velocityX, 0);
        
        // Set damage (god mode damage or normal)
        projectile.damage = playerStatsSystem.isGodMode() ? COMBAT_CONFIG.godMode.damage : config.damage;
        
        // Track projectile spawn position and max range (based on viewport width, not world width)
        projectile.spawnX = projectileX;
        projectile.maxRange = VISUAL_CONFIG.viewportWidth * PHYSICS_CONFIG.projectile.maxRangeMultiplier;
        
        // Track projectile fired for stats
        levelStatsTracker.recordProjectileFired();
    }

    /**
     * Update all active projectiles.
     * Destroys projectiles that exceed their max range or go off-world.
     */
    updateProjectiles(): void {
        const projectiles = gameState.projectiles;
        if (!projectiles) return;
        
        projectiles.children.entries.forEach(proj => {
            const projectile = proj as Projectile;
            // Destroy projectile if it exceeds max range or goes off world
            const distanceTraveled = Math.abs(projectile.x - projectile.spawnX);
            if (distanceTraveled > projectile.maxRange || projectile.x < 0 || projectile.x > WORLD_WIDTH) {
                projectile.destroy();
            }
        });
    }

    /**
     * Fire an enemy projectile from an enemy toward the player.
     * Handles range checking, cooldown, and direction calculation.
     * Special handling for boss_water_crab which fires in a cone.
     * Special handling for burst fire enemies like wolf_tank_boss.
     * 
     * @param scene - The Phaser scene to spawn the projectile in
     * @param enemy - The enemy firing the projectile
     * @param gameTime - Current game time in milliseconds
     */
    fireEnemyProjectile(scene: Phaser.Scene, enemy: Enemy, gameTime: number): void {
        if (!enemy.hasRangedAbility || !enemy.projectileTexture) {
            return;
        }
        
        const player = gameState.player;
        if (!player || !player.active) {
            return;
        }
        
        // Check distance to player - only fire if within reasonable range
        const distanceToPlayer = Phaser.Math.Distance.Between(
            enemy.x, enemy.y,
            player.x, player.y
        );
        const maxFiringRange = enemy.lineOfSight || 800; // Use enemy's line of sight as max firing range
        if (distanceToPlayer > maxFiringRange) {
            return;
        }
        
        // Handle burst fire logic
        if (enemy.burstCount && enemy.burstDelay !== undefined) {
            // Initialize burst state if needed
            if (enemy.currentBurstShot === undefined) {
                enemy.currentBurstShot = 0;
            }
            
            // Check if we're in the middle of a burst
            if (enemy.currentBurstShot > 0 && enemy.currentBurstShot < enemy.burstCount) {
                // Continue burst if enough time has passed
                if (enemy.lastBurstShotTime && gameTime - enemy.lastBurstShotTime >= enemy.burstDelay) {
                    this.fireSingleProjectile(scene, enemy, player);
                    enemy.currentBurstShot++;
                    enemy.lastBurstShotTime = gameTime;
                    
                    // Reset burst after last shot
                    if (enemy.currentBurstShot >= enemy.burstCount) {
                        enemy.currentBurstShot = 0;
                        enemy.lastProjectileTime = gameTime;
                    }
                }
                return;
            }
            
            // Check cooldown before starting new burst
            const cooldown = enemy.projectileCooldown || 3000;
            if (enemy.lastProjectileTime && gameTime - enemy.lastProjectileTime < cooldown) {
                return;
            }
            
            // Start new burst
            this.fireSingleProjectile(scene, enemy, player);
            enemy.currentBurstShot = 1;
            enemy.lastBurstShotTime = gameTime;
            return;
        }
        
        // Regular single-shot enemies
        const cooldown = enemy.projectileCooldown || 3000;
        if (enemy.lastProjectileTime && gameTime - enemy.lastProjectileTime < cooldown) {
            return;
        }
        
        enemy.lastProjectileTime = gameTime;
        
        // Special handling for boss_water_crab - fires in a cone
        if (enemy.enemyType === 'boss_water_crab') {
            this.fireCrabBossCone(scene, enemy);
            return;
        }
        
        // Default single projectile firing
        this.fireSingleProjectile(scene, enemy, player);
    }
    
    /**
     * Fire a single projectile from enemy toward player.
     * Helper method used by both regular and burst fire.
     * 
     * @param scene - The Phaser scene to spawn the projectile in
     * @param enemy - The enemy firing the projectile
     * @param player - The player target
     */
    private fireSingleProjectile(scene: Phaser.Scene, enemy: Enemy, player: Phaser.Physics.Arcade.Sprite): void {
        // Calculate direction to player
        const angleToPlayer = Math.atan2(
            player.y - enemy.y,
            player.x - enemy.x
        );
        
        const speed = enemy.projectileSpeed || 300;
        const velocityX = Math.cos(angleToPlayer) * speed;
        const velocityY = Math.sin(angleToPlayer) * speed;
        
        // Spawn projectile from enemy position
        const projectile = scene.add.image(enemy.x, enemy.y, enemy.projectileTexture!) as Projectile;
        projectile.setOrigin(0.5, 0.5);
        projectile.setDepth(PHYSICS_CONFIG.projectile.depth);
        
        // Scale projectile based on enemy scale
        const enemyScale = enemy.scaleX || 1;
        projectile.setScale(enemyScale * 0.5); // Make enemy projectiles a bit smaller
        
        // Rotate projectile to face direction
        projectile.setRotation(angleToPlayer);
        
        gameState.projectiles?.add(projectile);
        scene.physics.add.existing(projectile);
        
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setBounce(0, 0);
        body.setCollideWorldBounds(true);
        body.setVelocity(velocityX, velocityY);
        
        // Make collision body larger for better hit detection with fast-moving projectiles
        body.setSize(projectile.width * 2, projectile.height * 2);
        body.setOffset(-projectile.width / 2, -projectile.height / 2);
        
        // Set damage
        projectile.damage = enemy.projectileDamage || 15;
        
        // Mark as enemy projectile
        projectile.isEnemyProjectile = true;
        
        // Track spawn position and max range
        projectile.spawnX = enemy.x;
        // Use config range if available, otherwise fallback to 800
        projectile.maxRange = PROJECTILE_CONFIG.enemy.sharkpedo?.range || 800;
    }

    /**
     * Fire a cone of projectiles from the crab boss toward the player.
     * Fires 5-7 projectiles at random angles within a 45-degree cone centered on the player.
     * 
     * @param scene - The Phaser scene to spawn projectiles in
     * @param enemy - The crab boss enemy
     */
    private fireCrabBossCone(scene: Phaser.Scene, enemy: Enemy): void {
        const player = gameState.player;
        if (!player || !player.active) {
            return;
        }

        // Calculate base angle to player
        const baseAngleToPlayer = Math.atan2(
            player.y - enemy.y,
            player.x - enemy.x
        );

        // Cone spread: 45 degrees total (±22.5 degrees from center)
        const coneHalfAngle = Math.PI / 8; // 22.5 degrees in radians

        // Fire 5-7 projectiles in the burst
        const projectileCount = Phaser.Math.Between(5, 7);
        const speed = enemy.projectileSpeed || 200;

        for (let i = 0; i < projectileCount; i++) {
            // Random angle within the cone
            const randomOffset = (Math.random() - 0.5) * 2 * coneHalfAngle; // Random between -coneHalfAngle and +coneHalfAngle
            const projectileAngle = baseAngleToPlayer + randomOffset;

            const velocityX = Math.cos(projectileAngle) * speed;
            const velocityY = Math.sin(projectileAngle) * speed;

            // Spawn projectile from enemy position
            const projectile = scene.add.image(enemy.x, enemy.y, enemy.projectileTexture!) as Projectile;
            projectile.setOrigin(0.5, 0.5);
            projectile.setDepth(PHYSICS_CONFIG.projectile.depth);

            // Scale projectile based on enemy scale
            const enemyScale = enemy.scaleX || 1;
            projectile.setScale(enemyScale * 0.3); // Smaller bubbles

            // Rotate projectile to face direction
            projectile.setRotation(projectileAngle);

            gameState.projectiles?.add(projectile);
            scene.physics.add.existing(projectile);

            const body = projectile.body as Phaser.Physics.Arcade.Body;
            body.setAllowGravity(false);
            body.setBounce(0, 0);
            body.setCollideWorldBounds(true);
            body.setVelocity(velocityX, velocityY);

            // Set damage
            projectile.damage = enemy.projectileDamage || 10;

            // Mark as enemy projectile
            projectile.isEnemyProjectile = true;

            // Track spawn position and max range
            projectile.spawnX = enemy.x;
            projectile.maxRange = PROJECTILE_CONFIG.enemy.sharkpedo?.range || 600; // Shorter range for bubbles
        }
    }
}

// Singleton instance management
let projectileManagerInstance: ProjectileManager | null = null;

/**
 * Get the ProjectileManager instance, creating it if necessary
 */
export function getProjectileManager(): ProjectileManager {
    if (!projectileManagerInstance) {
        projectileManagerInstance = new ProjectileManager();
    }
    return projectileManagerInstance;
}

/**
 * Reset the ProjectileManager instance (useful for testing)
 */
export function resetProjectileManager(): void {
    projectileManagerInstance = null;
}

// Default export for backward compatibility
export default getProjectileManager();
