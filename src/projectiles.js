import { PROJECTILE_CONFIG, WORLD_WIDTH } from './config.js';

let player;
let projectiles;
let cursors;
let wasdKeys;
let lastProjectileTime = 0;

export function setPlayer(p) { player = p; }
export function setProjectiles(pr) { projectiles = pr; }
export function setInputs(c, w) { cursors = c; wasdKeys = w; }

export function fireProjectile(scene) {
    const now = Date.now();
    
    if (now - lastProjectileTime < PROJECTILE_CONFIG.basic.cooldown) {
        return;
    }
    
    lastProjectileTime = now;
    
    const config = PROJECTILE_CONFIG.basic;
    
    let direction = 1;
    if (wasdKeys.A.isDown || cursors.left.isDown) {
        direction = -1;
    }
    
    const velocityX = config.speed * direction;
    
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
    
    const projectile = scene.add.polygon(player.x, player.y, points, 0x000000); // Black
    projectile.setOrigin(0.5, 0.5); // Center the origin
    
    projectiles.add(projectile);
    scene.physics.add.existing(projectile);
    projectile.body.setAllowGravity(false);
    projectile.body.setBounce(0, 0);
    projectile.body.setCollideWorldBounds(true);
    projectile.body.setVelocity(velocityX, 0);
    projectile.damage = config.damage;
}

export function updateProjectiles() {
    projectiles.children.entries.forEach(proj => {
        if (proj.x < 0 || proj.x > WORLD_WIDTH) {
            proj.destroy();
        }
    });
}
