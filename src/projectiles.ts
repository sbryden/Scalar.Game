import { PROJECTILE_CONFIG, WORLD_WIDTH } from './config';
import gameState from './utils/gameState';

let lastProjectileTime = 0;

export function setInputs(c, w) { 
    gameState.cursors = c; 
    gameState.wasdKeys = w; 
}

export function fireProjectile(scene) {
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
    const speedMultiplier = isUnderwater ? 0.5 : 1.0; // Half speed underwater
    
    const velocityX = config.speed * direction * speedMultiplier;
    
    // Offset projectile spawn behind the vehicle (opposite of direction)
    const spawnOffsetX = direction === 1 ? 40 : -40;
    const projectileX = gameState.player.x + spawnOffsetX;
    
    // Projectile spawns at 1/6 height of tank (1/6 from top)
    const tankHeight = gameState.player.displayHeight;
    const projectileY = gameState.player.y - tankHeight / 2 + (1 / 6) * tankHeight;
    
    // Create projectile (torpedo underwater, beam on land)
    const projectileTexture = isUnderwater ? 'torpedo' : 'beam';
    const projectile = scene.add.image(projectileX, projectileY, projectileTexture);
    projectile.setOrigin(0.5, 0.5);
    projectile.setDepth(0);
    
    // Scale projectile based on player scale
    const playerScale = gameState.player.scaleX;
    projectile.setScale(playerScale);
    
    // Flip the image if firing left
    if (direction === -1) {
        projectile.setFlipX(true);
    }
    
    gameState.projectiles.add(projectile);
    scene.physics.add.existing(projectile);
    projectile.body.setAllowGravity(false);
    projectile.body.setBounce(0, 0);
    projectile.body.setCollideWorldBounds(true);
    projectile.body.setVelocity(velocityX, 0);
    projectile.damage = config.damage;
    
    // Track projectile spawn position and max range (1.5x screen width)
    projectile.spawnX = projectileX;
    projectile.maxRange = 1024 * 1.5; // 1.5x screen width
}

export function updateProjectiles() {
    gameState.projectiles.children.entries.forEach(proj => {
        // Destroy projectile if it exceeds max range or goes off world
        const distanceTraveled = Math.abs(proj.x - proj.spawnX);
        if (distanceTraveled > proj.maxRange || proj.x < 0 || proj.x > WORLD_WIDTH) {
            proj.destroy();
        }
    });
}
