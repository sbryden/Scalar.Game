import { ENEMY_CONFIG, PROJECTILE_CONFIG } from './config.js';

let enemies;
let platforms;

export function setEnemies(e) { enemies = e; }
export function setPlatforms(p) { platforms = p; }

export function spawnEnemy(scene, x, y) {
    const config = ENEMY_CONFIG.generic;
    const enemy = scene.add.sprite(x, y, 'enemy');
    enemy.setScale(0.2);
    scene.physics.add.existing(enemy);
    enemy.body.setBounce(0.2);
    enemy.body.setCollideWorldBounds(true);
    
    enemy.health = config.health;
    enemy.maxHealth = config.health;
    enemy.damage = config.damage;
    enemy.xpReward = config.xpReward;
    enemy.speed = config.speed;
    enemy.patrolDistance = config.patrolDistance;
    enemy.startX = x;
    enemy.direction = 1;
    enemy.hasHitBoundary = false;
    enemy.setFlipX(false); // Start facing right
    
    const barWidth = 30;
    const barHeight = 4;
    const healthBarOffsetY = enemy.displayHeight/2 + 10;
    enemy.healthBarBg = scene.add.rectangle(x, y - healthBarOffsetY, barWidth, barHeight, 0x333333);
    enemy.healthBar = scene.add.rectangle(x, y - healthBarOffsetY, barWidth, barHeight, 0xFF0000);
    enemy.healthBar.setDepth(50);
    enemy.healthBarBg.setDepth(50);
    enemy.healthBarOffsetY = healthBarOffsetY;
    
    enemies.add(enemy);
    return enemy;
}

export function updateEnemyAI(enemy) {
    const maxDistance = enemy.patrolDistance / 2;
    const distFromStart = Math.abs(enemy.x - enemy.startX);
    
    if (distFromStart > maxDistance) {
        if (!enemy.hasHitBoundary) {
            enemy.direction *= -1;
            enemy.hasHitBoundary = true;
            enemy.setFlipX(enemy.direction === -1); // Flip based on direction (opposite)
        }
    } else {
        enemy.hasHitBoundary = false;
    }
    
    enemy.body.setVelocityX(enemy.speed * enemy.direction);
    
    // Keep enemy above ground
    const groundY = 750;
    const enemyHalfHeight = enemy.displayHeight / 2;
    const minY = groundY - enemyHalfHeight;
    if (enemy.y > minY) {
        enemy.y = minY;
    }
    
    if (enemy.healthBar && enemy.healthBarBg) {
        const barWidth = 30;
        const healthPercent = enemy.health / enemy.maxHealth;
        enemy.healthBar.setDisplayOrigin(barWidth / 2, 2);
        enemy.healthBar.setScale(healthPercent, 1);
        const healthBarY = enemy.y - enemy.healthBarOffsetY;
        enemy.healthBar.x = enemy.x;
        enemy.healthBar.y = healthBarY;
        enemy.healthBarBg.x = enemy.x;
        enemy.healthBarBg.y = healthBarY;
    }
}

export async function damageEnemy(projectile, enemy) {
    if (!projectile.active) return;
    
    const damage = projectile.damage || PROJECTILE_CONFIG.basic.damage;
    enemy.health -= damage;
    
    projectile.destroy();
    
    if (enemy.health <= 0) {
        const { spawnXPOrb } = await import('./xpOrbs.js');
        spawnXPOrb(enemy.scene, enemy.x, enemy.y, enemy.xpReward);
        if (enemy.healthBar) enemy.healthBar.destroy();
        if (enemy.healthBarBg) enemy.healthBarBg.destroy();
        enemy.destroy();
    }
}
