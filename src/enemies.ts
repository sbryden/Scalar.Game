import { ENEMY_CONFIG, HARD_MODE_CONFIG, PHYSICS_CONFIG, VISUAL_CONFIG, DETECTION_CONFIG, BOSS_TEXTURE_CONFIG } from "./config";
import gameState from "./utils/gameState";
import combatSystem from "./systems/CombatSystem";
import type { Enemy, Projectile } from './types/game';
import playerStatsSystem from './systems/PlayerStatsSystem';

/**
 * Helper function to check if an enemy type is a swimming enemy
 * Swimming enemies can move freely in all directions and don't have gravity
 */
function isSwimmingEnemy(enemyType: string): boolean {
    return enemyType === "micro" || enemyType === "fish" || enemyType === "plankton" ||
           enemyType === "boss_micro" || enemyType === "boss_fish" || enemyType === "boss_plankton" ||
           enemyType === "boss_shark";
}

/**
 * Select a texture for an enemy based on weighted random selection
 * Supports both boss textures (with multiple weighted options) and regular enemy textures
 */
function selectEnemyTexture(enemyType: string): string {
    // Check if this enemy type has weighted texture options (boss enemies)
    if (BOSS_TEXTURE_CONFIG[enemyType]) {
        const options = BOSS_TEXTURE_CONFIG[enemyType];
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (const option of options) {
            cumulativeWeight += option.weight;
            if (random < cumulativeWeight) {
                return option.texture;
            }
        }
        // Fallback to last option if no match (shouldn't happen with proper weights)
        return options[options.length - 1]?.texture ?? "enemy";
    }
    
    // Regular (non-boss) enemy textures
    if (enemyType === "micro") {
        return "bacteria";
    } else if (enemyType === "fish") {
        // 25% chance for water_enemy_fish_1.png, 75% chance for water_enemy_needle_fish_1.png
        return Math.random() < 0.25 ? "water_enemy_fish_1" : "water_enemy_needle_fish_1";
    } else if (enemyType === "plankton") {
        return "bacteria"; // Use bacteria as placeholder for plankton
    } else if (enemyType === "crab") {
        return "water_enemy_crab_1";
    } else {
        return "enemy"; // Default fallback
    }
}

export function spawnEnemy(scene: Phaser.Scene, x: number, y: number, enemyType: string = "generic"): Enemy {
    const config = ENEMY_CONFIG[enemyType];
    
    // Guard against unknown enemy types
    if (!config) {
        console.error(`Unknown enemy type: ${enemyType}`);
        throw new Error(`Unknown enemy type: ${enemyType}`);
    }
    
    // Check if this is a boss enemy
    const isBoss = enemyType.startsWith('boss_');
    
    // Apply hard mode multipliers if in hard mode
    const isHardMode = playerStatsSystem.difficulty === 'hard';
    const healthMultiplier = isHardMode ? HARD_MODE_CONFIG.enemyHealthMultiplier : 1;
    const speedMultiplier = isHardMode ? HARD_MODE_CONFIG.enemySpeedMultiplier : 1;
    const lineOfSightMultiplier = isHardMode ? HARD_MODE_CONFIG.enemyLineOfSightMultiplier : 1;
    
    // Select appropriate texture based on enemy type
    const texture = selectEnemyTexture(enemyType);
    
    const enemy = scene.add.sprite(x, y, texture) as Enemy;
    // Boss enemies are scaled according to config
    const baseScale = PHYSICS_CONFIG.enemy.baseScale;
    enemy.setScale(isBoss ? baseScale * PHYSICS_CONFIG.enemy.bossScaleMultiplier : baseScale);
    scene.physics.add.existing(enemy);
    (enemy.body as Phaser.Physics.Arcade.Body).setBounce(PHYSICS_CONFIG.enemy.bounce);
    (enemy.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    // Swimming enemies don't have gravity
    if (isSwimmingEnemy(enemyType)) {
        (enemy.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }

    enemy.health = config.health * healthMultiplier;
    enemy.maxHealth = config.health * healthMultiplier;
    enemy.damage = config.damage;
    enemy.xpReward = config.xpReward;
    enemy.speed = config.speed * speedMultiplier;
    enemy.patrolDistance = config.patrolDistance;
    enemy.knockbackResistance = config.knockbackResistance;
    enemy.startX = x;
    enemy.startY = y;
    enemy.enemyType = enemyType;
    enemy.direction = 1;
    enemy.hasHitBoundary = false;
    enemy.floatAngle = Math.random() * Math.PI * 2; // Random starting angle for floating
    enemy.setFlipX(false); // Start facing right
    
    // Initialize chase system properties
    // Calculate line of sight based on larger of width and height
    const largerDimension = Math.max(enemy.displayWidth, enemy.displayHeight);
    let calculatedLineOfSight = largerDimension * config.lineOfSightMultiplier * lineOfSightMultiplier;
    
    // Apply minimum line of sight
    calculatedLineOfSight = Math.max(calculatedLineOfSight, DETECTION_CONFIG.minLineOfSight);
    
    // Bosses get enhanced line of sight based on screen width
    if (isBoss && enemy.scene && enemy.scene.cameras.main) {
        const screenWidth = enemy.scene.cameras.main.width;
        const bossLineOfSight = screenWidth * DETECTION_CONFIG.bossLineOfSightScreenPercent;
        const maxLineOfSight = screenWidth * DETECTION_CONFIG.maxLineOfSightScreenPercent;
        // Use the larger of calculated or boss-specific, but cap at max
        calculatedLineOfSight = Math.min(Math.max(calculatedLineOfSight, bossLineOfSight), maxLineOfSight);
    }
    
    enemy.isChasing = false;
    enemy.lineOfSight = calculatedLineOfSight;
    enemy.chaseTarget = undefined;

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

    if (!gameState.enemies) {
        console.error('gameState.enemies is not initialized');
        throw new Error('gameState.enemies is not initialized');
    }
    
    gameState.enemies.add(enemy);
    return enemy;
}

export function updateEnemyAI(enemy: Enemy, gameTime: number): void {
    // Check if enemy is stunned
    if (enemy.stunnedUntil && gameTime < enemy.stunnedUntil) {
        // Enemy is stunned, don't update AI
        return;
    }
    
    // Check for proximity-based detection if not already chasing
    if (!enemy.isChasing && gameState.player) {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            enemy.x, enemy.y,
            gameState.player.x, gameState.player.y
        );
        
        const playerIsImmune = gameState.player.immuneUntil && gameTime < gameState.player.immuneUntil;
        
        if (distanceToPlayer <= enemy.lineOfSight && !playerIsImmune) {
            enemy.isChasing = true;
            enemy.chaseTarget = gameState.player;
        }
    }
    
    // If chasing, use chase AI instead of patrol AI
    if (enemy.isChasing && enemy.chaseTarget && enemy.chaseTarget.active) {
        updateChaseAI(enemy);
        // Update health bar after chase AI
        updateEnemyHealthBar(enemy);
        return;
    }
    
    // Reset chase state if target is no longer valid
    if (enemy.isChasing && (!enemy.chaseTarget || !enemy.chaseTarget.active)) {
        enemy.isChasing = false;
        enemy.chaseTarget = undefined;
    }
    
    // Default patrol behavior
    updatePatrolAI(enemy);
    updateEnemyHealthBar(enemy);
}

function updateChaseAI(enemy: Enemy): void {
    if (!enemy.chaseTarget) return;
    
    const config = ENEMY_CONFIG[enemy.enemyType];
    
    // Guard against unknown enemy types
    if (!config) {
        console.error(`Unknown enemy type: ${enemy.enemyType}`);
        return;
    }
    
    const chaseSpeed = enemy.speed * config.chaseSpeedMultiplier;
    
    // Calculate direction to player
    const angleToPlayer = Math.atan2(
        enemy.chaseTarget.y - enemy.y,
        enemy.chaseTarget.x - enemy.x
    );
    
    // Different behavior for swimming vs ground enemies
    if (isSwimmingEnemy(enemy.enemyType)) {
        // Swimming enemies can move freely in all directions
        const velocityX = Math.cos(angleToPlayer) * chaseSpeed;
        const velocityY = Math.sin(angleToPlayer) * chaseSpeed;
        
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
        const horizontalDirection = Math.sign(enemy.chaseTarget.x - enemy.x);
        enemy.body.setVelocityX(chaseSpeed * horizontalDirection);
        enemy.setFlipX(horizontalDirection === -1);
        
        // Jump if player is above and enemy is on ground
        const verticalDistance = enemy.y - enemy.chaseTarget.y;
        const horizontalDistance = Math.abs(enemy.x - enemy.chaseTarget.x);
        
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
        enemy.healthBar.setDisplayOrigin(barWidth / 2, VISUAL_CONFIG.healthBar.displayOriginY);
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
