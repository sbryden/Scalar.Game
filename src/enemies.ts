import { ENEMY_CONFIG, PROJECTILE_CONFIG } from "./config";
import gameState from "./utils/gameState";
import combatSystem from "./systems/CombatSystem";
import type { Enemy, Projectile } from './types/game';

export function spawnEnemy(scene: Phaser.Scene, x: number, y: number, enemyType: string = "generic"): Enemy {
    const config = ENEMY_CONFIG[enemyType];
    
    // Select appropriate texture based on enemy type
    let texture = "enemy";
    if (enemyType === "micro") {
        texture = "bacteria";
    } else if (enemyType === "fish" || enemyType === "plankton") {
        texture = "bacteria"; // Use bacteria as placeholder for swimming enemies
    } else if (enemyType === "crab") {
        texture = "enemy"; // Use enemy as placeholder for crabs
    }
    
    const enemy = scene.add.sprite(x, y, texture);
    enemy.setScale(0.2);
    scene.physics.add.existing(enemy);
    enemy.body.setBounce(0.2);
    enemy.body.setCollideWorldBounds(true);

    // Swimming enemies don't have gravity
    if (enemyType === "micro" || enemyType === "fish" || enemyType === "plankton") {
        enemy.body.setAllowGravity(false);
    }

    enemy.health = config.health;
    enemy.maxHealth = config.health;
    enemy.damage = config.damage;
    enemy.xpReward = config.xpReward;
    enemy.speed = config.speed;
    enemy.patrolDistance = config.patrolDistance;
    enemy.knockbackResistance = config.knockbackResistance;
    enemy.startX = x;
    enemy.startY = y;
    enemy.enemyType = enemyType;
    enemy.direction = 1;
    enemy.hasHitBoundary = false;
    enemy.floatAngle = Math.random() * Math.PI * 2; // Random starting angle for floating
    enemy.setFlipX(false); // Start facing right

    const barWidth = 30;
    const barHeight = 4;
    const healthBarOffsetY = enemy.displayHeight / 2 + 10;
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
    enemy.healthBar.setDepth(50);
    enemy.healthBarBg.setDepth(50);
    enemy.healthBarOffsetY = healthBarOffsetY;

    gameState.enemies.add(enemy);
    return enemy;
}

export function updateEnemyAI(enemy: Enemy): void {
    // Check if enemy is stunned
    const now = Date.now();
    if (enemy.stunnedUntil && now < enemy.stunnedUntil) {
        // Enemy is stunned, don't update AI
        return;
    }
    
    // Different behavior for swimming enemies (fish, plankton, micro) vs ground enemies
    if (enemy.enemyType === "micro" || enemy.enemyType === "fish" || enemy.enemyType === "plankton") {
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
        enemy.floatAngle += 0.02;
        const floatSpeed = enemy.speed * (enemy.enemyType === "plankton" ? 0.3 : 0.5);
        const verticalAmplitude = enemy.enemyType === "plankton" ? 30 : 50;

        enemy.body.setVelocityX(floatSpeed * enemy.direction);
        enemy.body.setVelocityY(Math.cos(enemy.floatAngle) * verticalAmplitude);

        // Keep enemies within screen bounds (but allow them to reach top)
        if (enemy.y < 50) {
            enemy.y = 50;
            enemy.body.setVelocityY(Math.abs(enemy.body.velocity.y));
        } else if (enemy.y > 750) {
            enemy.y = 750;
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

        // Occasional small jump (10% chance per frame when on ground)
        if (enemy.body.touching.down && Math.random() < 0.01) {
            enemy.body.setVelocityY(-150); // Small jump
        }

        // Keep enemy above ground
        const groundY = 750;
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
        const groundY = 750;
        const enemyHalfHeight = enemy.displayHeight / 2;
        const minY = groundY - enemyHalfHeight;
        if (enemy.y > minY) {
            enemy.y = minY;
        }
    }

    // Update health bar for all enemies
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

export async function damageEnemy(projectile: Projectile, enemy: Enemy): Promise<void> {
    combatSystem.damageEnemy(projectile, enemy);
}
