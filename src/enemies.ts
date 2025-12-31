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
    enemy.setScale(config.spriteScale);
    scene.physics.add.existing(enemy);
    enemy.body.setBounce(config.bounce);
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
    
    // Initialize aggro system properties
    enemy.isAggroed = false;
    enemy.aggroRange = enemy.displayHeight * config.aggroRangeMultiplier;
    enemy.aggroTarget = undefined;

    const barWidth = config.healthBarWidth;
    const barHeight = config.healthBarHeight;
    const healthBarOffsetY = enemy.displayHeight / 2 + config.healthBarOffsetY;
    enemy.healthBarBg = scene.add.rectangle(
        x,
        y - healthBarOffsetY,
        barWidth,
        barHeight,
        config.healthBarBgColor
    );
    enemy.healthBar = scene.add.rectangle(
        x,
        y - healthBarOffsetY,
        barWidth,
        barHeight,
        config.healthBarColor
    );
    enemy.healthBar.setDepth(config.healthBarDepth);
    enemy.healthBarBg.setDepth(config.healthBarDepth);
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
    
    // Check for proximity-based aggro if not already aggroed
    if (!enemy.isAggroed && gameState.player) {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            enemy.x, enemy.y,
            gameState.player.x, gameState.player.y
        );
        
        if (distanceToPlayer <= enemy.aggroRange) {
            enemy.isAggroed = true;
            enemy.aggroTarget = gameState.player;
        }
    }
    
    // If aggroed, use aggro AI instead of patrol AI
    if (enemy.isAggroed && enemy.aggroTarget && enemy.aggroTarget.active) {
        updateAggroAI(enemy);
        // Update health bar after aggro AI
        updateEnemyHealthBar(enemy);
        return;
    }
    
    // Reset aggro if target is no longer valid
    if (enemy.isAggroed && (!enemy.aggroTarget || !enemy.aggroTarget.active)) {
        enemy.isAggroed = false;
        enemy.aggroTarget = undefined;
    }
    
    // Default patrol behavior
    updatePatrolAI(enemy);
    updateEnemyHealthBar(enemy);
}

function updateAggroAI(enemy: Enemy): void {
    if (!enemy.aggroTarget) return;
    
    const config = ENEMY_CONFIG[enemy.enemyType];
    const aggroSpeed = enemy.speed * config.aggroSpeedMultiplier;
    
    // Calculate direction to player
    const angleToPlayer = Math.atan2(
        enemy.aggroTarget.y - enemy.y,
        enemy.aggroTarget.x - enemy.x
    );
    
    // Different behavior for swimming vs ground enemies
    if (enemy.enemyType === "micro" || enemy.enemyType === "fish" || enemy.enemyType === "plankton") {
        // Swimming enemies can move freely in all directions
        const velocityX = Math.cos(angleToPlayer) * aggroSpeed;
        const velocityY = Math.sin(angleToPlayer) * aggroSpeed;
        
        enemy.body.setVelocityX(velocityX);
        enemy.body.setVelocityY(velocityY);
        
        // Update sprite direction
        enemy.setFlipX(velocityX < 0);
        
        // Keep enemies within screen bounds
        if (enemy.y < config.screenBoundsTop) {
            enemy.y = config.screenBoundsTop;
            enemy.body.setVelocityY(Math.abs(enemy.body.velocity.y));
        } else if (enemy.y > config.groundY) {
            enemy.y = config.groundY;
            enemy.body.setVelocityY(-Math.abs(enemy.body.velocity.y));
        }
    } else {
        // Ground enemies (crab, generic) - respect gravity and jump
        const horizontalDirection = Math.sign(enemy.aggroTarget.x - enemy.x);
        enemy.body.setVelocityX(aggroSpeed * horizontalDirection);
        enemy.setFlipX(horizontalDirection === -1);
        
        // Jump if player is above and enemy is on ground
        const verticalDistance = enemy.y - enemy.aggroTarget.y;
        const horizontalDistance = Math.abs(enemy.x - enemy.aggroTarget.x);
        
        if (enemy.body.touching.down && 
            verticalDistance > config.jumpVerticalThreshold && 
            horizontalDistance < config.jumpHorizontalThreshold) {
            // Jump towards player
            enemy.body.setVelocityY(config.jumpVelocity);
        }
        
        // Keep enemy above ground
        const groundY = config.groundY;
        const enemyHalfHeight = enemy.displayHeight / 2;
        const minY = groundY - enemyHalfHeight;
        if (enemy.y > minY) {
            enemy.y = minY;
        }
    }
}

function updatePatrolAI(enemy: Enemy): void {
    const config = ENEMY_CONFIG[enemy.enemyType];
    
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
        enemy.floatAngle += config.floatAngleIncrement;
        const floatSpeed = enemy.speed * config.floatSpeedMultiplier;
        const verticalAmplitude = config.verticalAmplitude;

        enemy.body.setVelocityX(floatSpeed * enemy.direction);
        enemy.body.setVelocityY(Math.cos(enemy.floatAngle) * verticalAmplitude);

        // Keep enemies within screen bounds (but allow them to reach top)
        if (enemy.y < config.screenBoundsTop) {
            enemy.y = config.screenBoundsTop;
            enemy.body.setVelocityY(Math.abs(enemy.body.velocity.y));
        } else if (enemy.y > config.groundY) {
            enemy.y = config.groundY;
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

        // Occasional small jump
        if (enemy.body.touching.down && Math.random() < config.patrolJumpProbability) {
            enemy.body.setVelocityY(config.patrolJumpVelocity);
        }

        // Keep enemy above ground
        const groundY = config.groundY;
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
        const groundY = config.groundY;
        const enemyHalfHeight = enemy.displayHeight / 2;
        const minY = groundY - enemyHalfHeight;
        if (enemy.y > minY) {
            enemy.y = minY;
        }
    }
}

function updateEnemyHealthBar(enemy: Enemy): void {
    // Update health bar for all enemies
    if (enemy.healthBar && enemy.healthBarBg) {
        const config = ENEMY_CONFIG[enemy.enemyType];
        const barWidth = config.healthBarWidth;
        const healthPercent = enemy.health / enemy.maxHealth;
        enemy.healthBar.setDisplayOrigin(barWidth / 2, config.healthBarHeight / 2);
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
