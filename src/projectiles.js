import { PROJECTILE_CONFIG, WORLD_WIDTH } from './config.js';
import gameState from './utils/gameState.js';

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
    
    const velocityX = config.speed * direction;
    
    // Offset projectile spawn behind the vehicle (opposite of direction)
    const spawnOffsetX = direction === 1 ? 40 : -40;
    const projectileX = gameState.player.x + spawnOffsetX;
    
    // Projectile spawns at 1/6 height of tank (1/6 from top)
    const tankHeight = gameState.player.displayHeight;
    const projectileY = gameState.player.y - tankHeight / 2 + (1 / 6) * tankHeight;
    
    // Create centered triangle projectile
    const size = 6;
    let points;
    if (direction === 1) {
        // Triangle pointing right - centered
        points = [
            size, 0,           // Right tip (center-y)
            -size, -size,      // Top left
            -size, size        // Bottom left
        ];
    } else {
        // Triangle pointing left - centered
        points = [
            -size, 0,          // Left tip (center-y)
            size, -size,       // Top right
            size, size         // Bottom right
        ];
    }
    
    const projectile = scene.add.polygon(projectileX, projectileY, points, 0x000000); // Black
    projectile.setOrigin(0.5, 0.5); // Center the origin
    projectile.setDepth(0); // Same level as car
    
    gameState.projectiles.add(projectile);
    scene.physics.add.existing(projectile);
    projectile.body.setAllowGravity(false);
    projectile.body.setBounce(0, 0);
    projectile.body.setCollideWorldBounds(true);
    projectile.body.setVelocity(velocityX, 0);
    projectile.damage = config.damage;
}

export function updateProjectiles() {
    gameState.projectiles.children.entries.forEach(proj => {
        if (proj.x < 0 || proj.x > WORLD_WIDTH) {
            proj.destroy();
        }
    });
}
