import { ENEMY_CONFIG, PHYSICS_CONFIG, VISUAL_CONFIG } from "./config";
import gameState from "./utils/gameState";
import combatSystem from "./systems/CombatSystem";
import type { Enemy, Projectile } from './types/game';

/**
 * Helper function to check if an enemy type is a swimming enemy
 * Swimming enemies can move freely in all directions and don't have gravity
 */
function isSwimmingEnemy(enemyType: string): boolean {
    return enemyType === "micro" || enemyType === "fish" || enemyType === "plankton" ||
           enemyType === "boss_micro" || enemyType === "boss_fish" || enemyType === "boss_plankton";
}

export function spawnEnemy(scene: Phaser.Scene, x: number, y: number, enemyType: string = "generic"): Enemy {
    const config = ENEMY_CONFIG[enemyType];
    
    // Check if this is a boss enemy
    const isBoss = enemyType.startsWith('boss_');
    
    // Select appropriate texture based on enemy type
    let texture = "enemy";
    if (enemyType === "micro" || enemyType === "boss_micro") {
        texture = "bacteria";
    } else if (enemyType === "fish" || enemyType === "boss_fish") {
        // Configurable chance for water_enemy_fish_1.png vs water_enemy_needle_fish_1.png
        texture = Math.random() < VISUAL_CONFIG.fishSpawn.fishTextureThreshold ? "water_enemy_fish_1" : "water_enemy_needle_fish_1";
    } else if (enemyType === "plankton" || enemyType === "boss_plankton") {
        texture = "bacteria"; // Use bacteria as placeholder for plankton
    } else if (enemyType === "crab") {
        texture = "water_enemy_crab_1";
    }
    
    const enemy = scene.add.sprite(x, y, texture);
    // Boss enemies are scaled according to config
    const baseScale = PHYSICS_CONFIG.enemy.baseScale;
    enemy.setScale(isBoss ? baseScale * PHYSICS_CONFIG.enemy.bossScaleMultiplier : baseScale);
    scene.physics.add.existing(enemy);
    enemy.body.setBounce(PHYSICS_CONFIG.enemy.bounce);
    enemy.body.setCollideWorldBounds(true);

    // Swimming enemies don't have gravity
    if (isSwimmingEnemy(enemyType)) {
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
        
        const now = Date.now();
        const playerIsImmune = gameState.player.immuneUntil && now < gameState.player.immuneUntil;
        
        if (distanceToPlayer <= enemy.aggroRange && !playerIsImmune) {
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
    if (isSwimmingEnemy(enemy.enemyType)) {
        // Swimming enemies can move freely in all directions
        const velocityX = Math.cos(angleToPlayer) * aggroSpeed;
        const velocityY = Math.sin(angleToPlayer) * aggroSpeed;
        
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
        const horizontalDirection = Math.sign(enemy.aggroTarget.x - enemy.x);
        enemy.body.setVelocityX(aggroSpeed * horizontalDirection);
        enemy.setFlipX(horizontalDirection === -1);
        
        // Jump if player is above and enemy is on ground
        const verticalDistance = enemy.y - enemy.aggroTarget.y;
        const horizontalDistance = Math.abs(enemy.x - enemy.aggroTarget.x);
        
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

function updatePatrolAI(enemy: Enemy): void {
    // Different behavior for swimming enemies (fish, plankton, micro) vs ground enemies
    if (isSwimmingEnemy(enemy.enemyType)) {
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
        const floatSpeed = enemy.speed * (enemy.enemyType === "plankton" ? 
            PHYSICS_CONFIG.enemy.patrol.floatSpeedPlankton : 
            PHYSICS_CONFIG.enemy.patrol.floatSpeedOther);
        const verticalAmplitude = enemy.enemyType === "plankton" ? 
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

function updateEnemyHealthBar(enemy: Enemy): void {
    // Update health bar for all enemies
    if (enemy.healthBar && enemy.healthBarBg) {
        const barWidth = VISUAL_CONFIG.healthBar.width;
        const healthPercent = enemy.health / enemy.maxHealth;
        enemy.healthBar.setDisplayOrigin(barWidth / VISUAL_CONFIG.healthBar.yDivisor, 2);
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
