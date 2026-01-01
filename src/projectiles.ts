import { PROJECTILE_CONFIG, WORLD_WIDTH, PHYSICS_CONFIG, COMBAT_CONFIG, VISUAL_CONFIG } from './config';
import gameState from './utils/gameState';
import playerStatsSystem from './systems/PlayerStatsSystem';
import type { WASDKeys } from './types/game';

let lastProjectileTime = 0;

export function setInputs(c: Phaser.Types.Input.Keyboard.CursorKeys, w: WASDKeys): void { 
    gameState.cursors = c; 
    gameState.wasdKeys = w; 
}

export function fireProjectile(scene: Phaser.Scene): void {
    const now = Date.now();
    
    if (now - lastProjectileTime < PROJECTILE_CONFIG.basic.cooldown) {
        return;
    }
    
    lastProjectileTime = now;
    
    const config = PROJECTILE_CONFIG.basic;
    
    let direction = 1;
    if (gameState.wasdKeys.A.isDown || gameState.cursors.left.isDown) {
        direction = -1;
    }
    
    // Check if underwater for slower projectile speed
    const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                        gameState.currentSceneKey === 'UnderwaterMicroScene';
    const speedMultiplier = isUnderwater ? PHYSICS_CONFIG.underwater.speedMultiplier : 1.0;
    
    const velocityX = config.speed * direction * speedMultiplier;
    
    // Offset projectile spawn behind the vehicle (opposite of direction)
    const spawnOffsetX = direction === 1 ? PHYSICS_CONFIG.projectile.spawnOffsetX : -PHYSICS_CONFIG.projectile.spawnOffsetX;
    const projectileX = gameState.player.x + spawnOffsetX;
    
    // Projectile spawns at configured height ratio from top of tank
    const tankHeight = gameState.player.displayHeight;
    const projectileY = gameState.player.y - tankHeight / 2 + PHYSICS_CONFIG.projectile.heightRatio * tankHeight;
    
    // Create projectile (torpedo underwater, beam on land)
    const projectileTexture = isUnderwater ? 'torpedo' : 'beam';
    const projectile = scene.add.image(projectileX, projectileY, projectileTexture) as Projectile;
    projectile.setOrigin(0.5, 0.5);
    projectile.setDepth(PHYSICS_CONFIG.projectile.depth);
    
    // Scale projectile based on player scale
    const playerScale = gameState.player!.scaleX;
    projectile.setScale(playerScale);
    
    // Flip the image if firing left
    if (direction === -1) {
        projectile.setFlipX(true);
    }
    
    gameState.projectiles!.add(projectile);
    scene.physics.add.existing(projectile);
    projectile.body.setAllowGravity(false);
    projectile.body.setBounce(0, 0);
    projectile.body.setCollideWorldBounds(true);
    projectile.body.setVelocity(velocityX, 0);
    
    // Set damage (god mode damage or normal)
    projectile.damage = playerStatsSystem.isGodMode() ? COMBAT_CONFIG.godMode.damage : config.damage;
    
    // Track projectile spawn position and max range
    projectile.spawnX = projectileX;
    projectile.maxRange = VISUAL_CONFIG.screenWidth * PHYSICS_CONFIG.projectile.maxRangeMultiplier;
}

export function updateProjectiles(): void {
    gameState.projectiles!.children.entries.forEach(proj => {
        const projectile = proj as Projectile;
        // Destroy projectile if it exceeds max range or goes off world
        const distanceTraveled = Math.abs(projectile.x - projectile.spawnX);
        if (distanceTraveled > projectile.maxRange || projectile.x < 0 || projectile.x > WORLD_WIDTH) {
            projectile.destroy();
        }
    });
}
