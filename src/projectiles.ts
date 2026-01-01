import { PROJECTILE_CONFIG, WORLD_WIDTH, PHYSICS_CONFIG, COMBAT_CONFIG, VISUAL_CONFIG } from './config';
import gameState from './utils/gameState';
import playerStatsSystem from './systems/PlayerStatsSystem';
import levelStatsTracker from './systems/LevelStatsTracker';
import type { WASDKeys, Projectile, Enemy } from './types/game';

let lastProjectileTime = 0;

export function setInputs(c: Phaser.Types.Input.Keyboard.CursorKeys, w: WASDKeys): void { 
    gameState.cursors = c; 
    gameState.wasdKeys = w; 
}

export function fireProjectile(scene: Phaser.Scene): void {
    const gameTime = scene.time.now;
    
    if (gameTime - lastProjectileTime < PROJECTILE_CONFIG.basic.cooldown) {
        return;
    }
    
    lastProjectileTime = gameTime;
    
    const config = PROJECTILE_CONFIG.basic;
    
    let direction = 1;
    if (gameState.wasdKeys?.A.isDown || gameState.cursors?.left.isDown) {
        direction = -1;
    }
    
    // Check if underwater for slower projectile speed
    const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                        gameState.currentSceneKey === 'UnderwaterMicroScene';
    const speedMultiplier = isUnderwater ? PHYSICS_CONFIG.underwater.speedMultiplier : 1.0;
    
    const velocityX = config.speed * direction * speedMultiplier;
    
    const player = gameState.player;
    if (!player) return;
    
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

export function updateProjectiles(): void {
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
 * Fire an enemy projectile from an enemy toward the player
 */
export function fireEnemyProjectile(scene: Phaser.Scene, enemy: Enemy, gameTime: number): void {
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
    
    // Check cooldown
    const cooldown = enemy.projectileCooldown || 3000;
    if (enemy.lastProjectileTime && gameTime - enemy.lastProjectileTime < cooldown) {
        return;
    }
    
    enemy.lastProjectileTime = gameTime;
    
    // Calculate direction to player
    const angleToPlayer = Math.atan2(
        player.y - enemy.y,
        player.x - enemy.x
    );
    
    const speed = enemy.projectileSpeed || 300;
    const velocityX = Math.cos(angleToPlayer) * speed;
    const velocityY = Math.sin(angleToPlayer) * speed;
    
    // Spawn projectile from enemy position
    const projectile = scene.add.image(enemy.x, enemy.y, enemy.projectileTexture) as Projectile;
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
    
    // Set damage
    projectile.damage = enemy.projectileDamage || 15;
    
    // Mark as enemy projectile
    projectile.isEnemyProjectile = true;
    
    // Track spawn position and max range
    projectile.spawnX = enemy.x;
    // Use config range if available, otherwise fallback to 800
    projectile.maxRange = PROJECTILE_CONFIG.enemy.sharkpedo?.range || 800;
}
