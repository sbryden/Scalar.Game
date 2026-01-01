/**
 * Combat System
 * Handles damage calculations and combat logic
 */
import { PROJECTILE_CONFIG, PLAYER_COMBAT_CONFIG, COMBAT_CONFIG } from '../config';
import playerStatsSystem from './PlayerStatsSystem';
import levelStatsTracker from './LevelStatsTracker';
import spawnSystem from './SpawnSystem';
import gameState from '../utils/gameState';
import { isSwimmingEnemy } from '../enemies';
import type { Player, Enemy, Projectile } from '../types/game';

/**
 * Union type for entities that can deal or receive damage
 * This maintains type safety while allowing flexibility for damage calculations
 */
type DamageEntity = Player | Enemy | Projectile;

export class CombatSystem {
    private onBossDefeat: (() => void) | null = null;
    private spawnerBossKilled: boolean = false;
    private minionsToKill: number = 0;

    /**
     * Set callback for when a boss is defeated
     */
    setBossDefeatCallback(callback: () => void): void {
        this.onBossDefeat = callback;
    }

    /**
     * Reset spawner boss tracking (call when starting a new level)
     */
    resetSpawnerTracking(): void {
        this.spawnerBossKilled = false;
        this.minionsToKill = 0;
    }

    /**
     * Check if player is moving toward enemy
     * Uses dot product to determine if player velocity is directed toward enemy
     */
    isPlayerMovingTowardEnemy(player: Player, enemy: Enemy): boolean {
        if (!player.body) return false;
        
        // Calculate direction vector from player to enemy
        const directionToEnemy = {
            x: enemy.x - player.x,
            y: enemy.y - player.y
        };
        
        // Get player velocity
        const playerVelocity = {
            x: player.body.velocity.x,
            y: player.body.velocity.y
        };
        
        // Calculate dot product: positive = moving toward, negative = moving away
        const dotProduct = 
            (directionToEnemy.x * playerVelocity.x) + 
            (directionToEnemy.y * playerVelocity.y);
        
        // Return true if moving toward with sufficient speed
        return dotProduct > PLAYER_COMBAT_CONFIG.requiredApproachSpeed;
    }
    
    /**
     * Apply damage to an enemy from a projectile
     */
    damageEnemy(projectile: Projectile, enemy: Enemy): void {
        if (!projectile.active) return;
        
        // Skip damage for dead enemies
        if (enemy.isDead) {
            projectile.destroy();
            return;
        }
        
        const damage = projectile.damage || PROJECTILE_CONFIG.basic.damage;
        enemy.health -= damage;
        
        // Track damage dealt
        levelStatsTracker.recordDamageDealt(damage);
        
        // Trigger chase when hit by projectile
        if (!enemy.isChasing && gameState.player) {
            enemy.isChasing = true;
            enemy.chaseTarget = gameState.player;
        }
        
        // Visual feedback: flash enemy red
        enemy.setTint(0xff0000);
        enemy.scene.time.delayedCall(COMBAT_CONFIG.visual.enemyFlashDuration, () => {
            if (enemy.active) {
                enemy.clearTint();
            }
        });
        
        projectile.destroy();
        
        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        }
    }
    
    /**
     * Handle player-enemy collision
     * Both player and enemy take damage, enemy gets knocked back
     * @param gameTime - Current game time from Phaser scene (scene.time.now)
     */
    handlePlayerEnemyCollision(player: Player, enemy: Enemy, gameTime: number): void {
        // Skip collision for dead enemies
        if (enemy.isDead) {
            return;
        }
        
        // Check if player is immune (after respawn)
        if (player.immuneUntil && gameTime < player.immuneUntil) {
            // Player is immune, no collision effects
            return;
        }
        
        // Trigger chase on collision if not already chasing
        if (!enemy.isChasing) {
            enemy.isChasing = true;
            enemy.chaseTarget = player;
        }
        
        // Check if entities are stunned (prevent knockback spam)
        const playerStunned = player.stunnedUntil && gameTime < player.stunnedUntil;
        const enemyStunned = enemy.stunnedUntil && gameTime < enemy.stunnedUntil;
        
        // Apply knockback only if neither is stunned
        if (!playerStunned && !enemyStunned) {
            this.applyEnemyKnockback(player, enemy);
            this.applyPlayerKnockback(player, enemy);
            
            // Stun both entities
            player.stunnedUntil = gameTime + PLAYER_COMBAT_CONFIG.stunDuration;
            enemy.stunnedUntil = gameTime + PLAYER_COMBAT_CONFIG.stunDuration;
            
            // Freeze movement during stun
            if (player.body) player.stunVelocity = { x: player.body.velocity.x, y: player.body.velocity.y };
            if (enemy.body) enemy.stunVelocity = { x: enemy.body.velocity.x, y: enemy.body.velocity.y };
        }
        
        // Check if enemy can damage player (cooldown per enemy)
        if (!enemy.lastDamageTime || gameTime - enemy.lastDamageTime >= PLAYER_COMBAT_CONFIG.enemyToPlayerCooldown) {
            // Determine damage based on melee mode
            const enemyDamage = enemy.damage || 10;
            let damageToPlayer: number;
            
            if (player.isMeleeMode) {
                // Player in melee mode - takes reduced damage
                damageToPlayer = enemyDamage * PLAYER_COMBAT_CONFIG.meleeModeDamageReduction;
            } else {
                // Player not in melee mode - takes full damage
                damageToPlayer = enemyDamage;
            }
            
            this.damagePlayer(damageToPlayer);
            enemy.lastDamageTime = gameTime;
            
            // Visual feedback: flash player red and shake camera
            // Don't override melee mode tint if active
            if (!player.isMeleeMode) {
                player.setTint(0xff0000);
                enemy.scene.time.delayedCall(PLAYER_COMBAT_CONFIG.invulnerabilityDuration, () => {
                    if (player.active && !player.isMeleeMode) {
                        player.clearTint();
                    }
                });
            }
            
            // Camera shake effect (more intense if taking full damage)
            const shakeIntensity = player.isMeleeMode ? COMBAT_CONFIG.visual.cameraShakeIntensityMelee : COMBAT_CONFIG.visual.cameraShakeIntensityNormal;
            enemy.scene.cameras.main.shake(COMBAT_CONFIG.visual.cameraShakeDuration, shakeIntensity);
        }
        
        // Check if player can damage enemy (cooldown per enemy)
        if (!enemy.lastPlayerDamageTime || gameTime - enemy.lastPlayerDamageTime >= PLAYER_COMBAT_CONFIG.playerToEnemyCooldown) {
            let playerDamage = 0;
            
            // God mode deals configured damage on collision
            if (playerStatsSystem.isGodMode()) {
                playerDamage = COMBAT_CONFIG.godMode.damage;
            } else if (player.isMeleeMode) {
                // Player in melee mode - deals full melee damage
                playerDamage = PLAYER_COMBAT_CONFIG.meleeModePlayerDamage;
            } else if (this.isPlayerMovingTowardEnemy(player, enemy)) {
                // Player moving toward enemy without melee mode - deals partial damage
                playerDamage = PLAYER_COMBAT_CONFIG.passiveModePlayerDamage;
            }
            // else: Player moving away or stationary - deals no damage
            
            if (playerDamage > 0) {
                enemy.health -= playerDamage;
                enemy.lastPlayerDamageTime = gameTime;
                
                // Track damage dealt
                levelStatsTracker.recordDamageDealt(playerDamage);
                
                // Visual feedback: flash enemy white (different from projectile red)
                enemy.setTint(0xffffff);
                enemy.scene.time.delayedCall(COMBAT_CONFIG.visual.enemyFlashDuration, () => {
                    if (enemy.active) {
                        enemy.clearTint();
                    }
                });
                
                // Check if enemy died from collision
                if (enemy.health <= 0) {
                    this.killEnemy(enemy);
                }
            }
        }
    }
    
    /**
     * Update stun effects for entities
     * Call this every frame to handle stun state
     * @param gameTime - Current game time from Phaser scene (scene.time.now)
     */
    updateStunEffects(entities: Phaser.Physics.Arcade.Group, player: Player, gameTime: number): void {
        // Handle player stun
        if (player.stunnedUntil && gameTime < player.stunnedUntil) {
            // Player is stunned, reduce movement
            if (player.body) {
                player.body.setVelocityX(player.body.velocity.x * COMBAT_CONFIG.stun.velocityDecay);
            }
        }
        
        // Handle enemy stuns
        entities.children.entries.forEach(obj => {
            const enemy = obj as Enemy;
            if (enemy.stunnedUntil && gameTime < enemy.stunnedUntil) {
                // Enemy is stunned, freeze AI movement
                if (enemy.body) {
                    enemy.body.setVelocityX(enemy.body.velocity.x * COMBAT_CONFIG.stun.velocityDecay);
                }
            }
        });
    }
    
    /**
     * Apply knockback force to enemy based on player position
     */
    applyEnemyKnockback(player: Player, enemy: Enemy): void {
        // Calculate direction from player to enemy
        const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        
        // Get knockback resistance (0 = immune, 1 = normal, >1 = more knockback)
        const resistance = enemy.knockbackResistance || 1.0;
        
        // Apply knockback force
        const knockbackForce = PLAYER_COMBAT_CONFIG.baseKnockbackForce * resistance;
        const knockbackX = Math.cos(angle) * knockbackForce;
        const knockbackY = Math.sin(angle) * knockbackForce;
        
        // Apply velocity to enemy body
        if (enemy.body) {
            enemy.body.setVelocity(knockbackX, knockbackY);
        }
    }
    
    /**
     * Handle enemy projectile hitting player
     * Shield completely blocks damage from enemy projectiles
     */
    handleEnemyProjectileHit(projectile: Projectile, player: Player, gameTime: number): void {
        if (!projectile.active) return;
        
        // Check if player is immune (after respawn)
        if (player.immuneUntil && gameTime < player.immuneUntil) {
            projectile.destroy();
            return;
        }
        
        // Check if player is in melee mode (shield active)
        if (player.isMeleeMode) {
            // Shield completely blocks the projectile
            projectile.destroy();
            // Visual feedback: flash the player blue briefly to show shield block
            player.setTint(0x0099FF);
            player.scene.time.delayedCall(100, () => {
                if (player.active && player.isMeleeMode) {
                    // Restore melee mode tint
                    player.setTint(0x00FF00);
                }
            });
            return;
        }
        
        // Player not shielded - take damage
        const damage = projectile.damage;
        this.damagePlayer(damage);
        
        // Visual feedback: flash player red and shake camera
        player.setTint(0xff0000);
        player.scene.time.delayedCall(PLAYER_COMBAT_CONFIG.invulnerabilityDuration, () => {
            if (player.active && !player.isMeleeMode) {
                player.clearTint();
            }
        });
        
        // Camera shake effect
        player.scene.cameras.main.shake(COMBAT_CONFIG.visual.cameraShakeDuration, COMBAT_CONFIG.visual.cameraShakeIntensityNormal);
        
        projectile.destroy();
    }
    
    /**
     * Apply knockback force to player based on enemy position
     */
    applyPlayerKnockback(player: Player, enemy: Enemy): void {
        // Calculate direction from enemy to player (opposite of enemy knockback)
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        
        // Apply configured knockback force
        const knockbackForce = COMBAT_CONFIG.playerKnockback.force;
        const knockbackX = Math.cos(angle) * knockbackForce;
        const knockbackY = Math.sin(angle) * knockbackForce * COMBAT_CONFIG.playerKnockback.verticalMultiplier;
        
        // Apply velocity to player body
        if (player.body) {
            player.body.setVelocity(
                player.body.velocity.x + knockbackX,
                player.body.velocity.y + knockbackY
            );
        }
    }
    
    /**
     * Spawn minions around a dead boss enemy
     * Handles both ground-based (x-axis spread) and swimming (full circle) spawns
     */
    private spawnMinionsOnDeath(boss: Enemy): void {
        if (!boss.scene || !boss.minionType || !boss.minionCount) return;
        
        const minionCount = boss.minionCount;
        const spawnRadius = boss.spawnRadius || 100; // Default 100 pixel radius
        
        // Check if minions are swimming enemies (need full circle spawn)
        const isSwimmingMinion = isSwimmingEnemy(boss.minionType);
        
        for (let i = 0; i < minionCount; i++) {
            let minionX: number;
            let minionY: number;
            
            if (isSwimmingMinion) {
                // Full circle spawn for swimming enemies (includes y-axis)
                const angle = (Math.PI * 2 / minionCount) * i;
                minionX = boss.x + Math.cos(angle) * spawnRadius;
                minionY = boss.y + Math.sin(angle) * spawnRadius;
            } else {
                // Ground-based spawn (x-axis line only)
                // Spread minions in a horizontal line
                const spacing = minionCount > 1 ? (spawnRadius * 2) / (minionCount - 1) : 0;
                minionX = boss.x - spawnRadius + (spacing * i);
                minionY = boss.y; // Same Y position as boss
            }
            
            // Spawn minion using the gameState spawn function
            if (gameState.spawnEnemyFunc) {
                const minion = gameState.spawnEnemyFunc(boss.scene, minionX, minionY, boss.minionType);
                
                // Make minion immediately chase player
                if (gameState.player) {
                    minion.isChasing = true;
                    minion.chaseTarget = gameState.player;
                }
            }
        }
    }
    
    /**
     * Kill an enemy and spawn XP orb
     */
    killEnemy(enemy: Enemy): void {
        // Check if this is a boss enemy
        const isBoss = enemy.enemyType?.startsWith('boss_');
        
        // Check if this is a spawner boss
        const isSpawnerBoss = enemy.isSpawnerBoss === true;
        
        // Track enemy destruction with enemy type for scoring
        levelStatsTracker.recordEnemyDestroyed(isBoss, enemy.enemyType);
        
        // Mark enemy as dead to prevent further AI/damage processing
        enemy.health = 0;
        enemy.isDead = true;
        
        // Disable physics body so player can pass through during fade-out
        if (enemy.body) {
            enemy.body.setVelocity(0, 0);
            enemy.body.setEnable(false);
        }
        
        // Handle spawner boss death
        if (isSpawnerBoss && enemy.minionType && enemy.minionCount) {
            // Mark that a spawner boss was killed
            this.spawnerBossKilled = true;
            this.minionsToKill = enemy.minionCount;
            
            // Spawn minions
            this.spawnMinionsOnDeath(enemy);
        } else if (this.spawnerBossKilled && !isBoss) {
            // This is a minion being killed, decrement counter
            this.minionsToKill--;
        }
        
        // Spawn XP orb immediately at enemy location
        if (enemy.scene && enemy.xpReward) {
            spawnSystem.spawnXPOrb(enemy.scene, enemy.x, enemy.y, enemy.xpReward);
            
            // Set depth for XP orbs to ensure they appear above dying enemies
            if (gameState.xpOrbs) {
                gameState.xpOrbs.children.entries.forEach((obj) => {
                    const orb = obj as Phaser.GameObjects.Arc;
                    orb.setDepth(100);
                });
            }
        }
        
        // Destroy health bars immediately
        if (enemy.healthBar) enemy.healthBar.destroy();
        if (enemy.healthBarBg) enemy.healthBarBg.destroy();
        
        // Spawn floating skull death effect
        const skull = enemy.scene.add.image(enemy.x, enemy.y, 'dead_skull');
        skull.setDepth(150); // Above XP orbs and enemies
        skull.setScale(0.3); // Smaller skull size
        
        // Float skull up 100px and fade out over 2 seconds
        enemy.scene.tweens.add({
            targets: skull,
            y: skull.y - 100,
            alpha: 0,
            duration: 2000,
            ease: 'Linear',
            onComplete: () => {
                skull.destroy();
            }
        });
        
        // Fade out enemy faster (1 second), then destroy
        enemy.scene.tweens.add({
            targets: enemy,
            alpha: 0,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                enemy.destroy();
            }
        });
        
        // Trigger boss defeat callback logic
        if (isBoss && this.onBossDefeat) {
            if (isSpawnerBoss) {
                // For spawner bosses, don't trigger level complete yet
                console.log('Spawner boss defeated, waiting for minions to be destroyed');
            } else {
                // Regular boss defeated, trigger level complete immediately
                this.onBossDefeat();
            }
        } else if (this.spawnerBossKilled && this.minionsToKill === 0 && this.onBossDefeat) {
            // All minions from spawner boss are destroyed, trigger level complete
            console.log('All minions destroyed, level complete!');
            this.onBossDefeat();
            // Reset tracking
            this.resetSpawnerTracking();
        }
    }
    
    /**
     * Apply damage to player
     */
    damagePlayer(damage: number): void {
        // Track damage taken
        levelStatsTracker.recordDamageTaken(damage);
        
        playerStatsSystem.takeDamage(damage);
    }
    
    /**
     * Calculate damage with potential modifiers
     * @param baseDamage - Base damage value before modifiers
     * @param attacker - Entity dealing damage (Player, Enemy, or Projectile)
     * @param target - Entity receiving damage (Player, Enemy, or Projectile)
     * @returns Final calculated damage with modifiers applied
     */
    calculateDamage(baseDamage: number, attacker: DamageEntity, target: DamageEntity): number {
        let finalDamage = baseDamage;
        
        // Future: Add damage modifiers here based on entity properties
        // Example: Type guards can be used to check for properties on specific entity types
        // if ('damage' in attacker && attacker.damage > 10) finalDamage *= 1.5; // Critical hit for high damage attackers
        // if ('maxHealth' in target && target.maxHealth > 100) finalDamage *= 0.8; // Armored targets take less damage
        
        return finalDamage;
    }
}

// Export singleton instance
export default new CombatSystem();
