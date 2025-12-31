/**
 * Combat System
 * Handles damage calculations and combat logic
 */
import { PROJECTILE_CONFIG, PLAYER_COMBAT_CONFIG } from '../config';
import playerStatsSystem from './PlayerStatsSystem';
import spawnSystem from './SpawnSystem';
import gameState from '../utils/gameState';
import type { Player, Enemy, Projectile } from '../types/game';

/**
 * Union type for entities that can deal or receive damage
 * This maintains type safety while allowing flexibility for damage calculations
 */
type DamageEntity = Player | Enemy | Projectile;

export class CombatSystem {
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
        
        const damage = projectile.damage || PROJECTILE_CONFIG.basic.damage;
        enemy.health -= damage;
        
        // Trigger aggro when hit by projectile
        if (!enemy.isAggroed && gameState.player) {
            enemy.isAggroed = true;
            enemy.aggroTarget = gameState.player;
        }
        
        // Visual feedback: flash enemy red
        enemy.setTint(0xff0000);
        enemy.scene.time.delayedCall(100, () => {
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
     */
    handlePlayerEnemyCollision(player: Player, enemy: Enemy): void {
        const now = Date.now();
        
        // Check if player is immune (after respawn)
        if (player.immuneUntil && now < player.immuneUntil) {
            // Player is immune, no collision effects
            return;
        }
        
        // Trigger aggro on collision if not already aggroed
        if (!enemy.isAggroed) {
            enemy.isAggroed = true;
            enemy.aggroTarget = player;
        }
        
        // Check if entities are stunned (prevent knockback spam)
        const playerStunned = player.stunnedUntil && now < player.stunnedUntil;
        const enemyStunned = enemy.stunnedUntil && now < enemy.stunnedUntil;
        
        // Apply knockback only if neither is stunned
        if (!playerStunned && !enemyStunned) {
            this.applyEnemyKnockback(player, enemy);
            this.applyPlayerKnockback(player, enemy);
            
            // Stun both entities
            player.stunnedUntil = now + PLAYER_COMBAT_CONFIG.stunDuration;
            enemy.stunnedUntil = now + PLAYER_COMBAT_CONFIG.stunDuration;
            
            // Freeze movement during stun
            if (player.body) player.stunVelocity = { x: player.body.velocity.x, y: player.body.velocity.y };
            if (enemy.body) enemy.stunVelocity = { x: enemy.body.velocity.x, y: enemy.body.velocity.y };
        }
        
        // Check if enemy can damage player (cooldown per enemy)
        if (!enemy.lastDamageTime || now - enemy.lastDamageTime >= PLAYER_COMBAT_CONFIG.enemyToPlayerCooldown) {
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
            enemy.lastDamageTime = now;
            
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
            const shakeIntensity = player.isMeleeMode ? 0.003 : 0.005;
            enemy.scene.cameras.main.shake(100, shakeIntensity);
        }
        
        // Check if player can damage enemy (cooldown per enemy)
        if (!enemy.lastPlayerDamageTime || now - enemy.lastPlayerDamageTime >= PLAYER_COMBAT_CONFIG.playerToEnemyCooldown) {
            let playerDamage = 0;
            
            if (player.isMeleeMode) {
                // Player in melee mode - deals full melee damage
                playerDamage = PLAYER_COMBAT_CONFIG.meleeModePlayerDamage;
            } else if (this.isPlayerMovingTowardEnemy(player, enemy)) {
                // Player moving toward enemy without melee mode - deals partial damage
                playerDamage = PLAYER_COMBAT_CONFIG.passiveModePlayerDamage;
            }
            // else: Player moving away or stationary - deals no damage
            
            if (playerDamage > 0) {
                enemy.health -= playerDamage;
                enemy.lastPlayerDamageTime = now;
                
                // Visual feedback: flash enemy white (different from projectile red)
                enemy.setTint(0xffffff);
                enemy.scene.time.delayedCall(100, () => {
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
     */
    updateStunEffects(entities: Phaser.Physics.Arcade.Group, player: Player): void {
        const now = Date.now();
        
        // Handle player stun
        if (player.stunnedUntil && now < player.stunnedUntil) {
            // Player is stunned, reduce movement
            if (player.body) {
                player.body.setVelocityX(player.body.velocity.x * 0.95);
            }
        }
        
        // Handle enemy stuns
        entities.forEach(enemy => {
            if (enemy.stunnedUntil && now < enemy.stunnedUntil) {
                // Enemy is stunned, freeze AI movement
                if (enemy.body) {
                    enemy.body.setVelocityX(enemy.body.velocity.x * 0.95);
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
     * Apply knockback force to player based on enemy position
     */
    applyPlayerKnockback(player: Player, enemy: Enemy): void {
        // Calculate direction from enemy to player (opposite of enemy knockback)
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        
        // Reduced knockback velocity for ~100px displacement
        const knockbackForce = 250;
        const knockbackX = Math.cos(angle) * knockbackForce;
        const knockbackY = Math.sin(angle) * knockbackForce * 0.5; // Less vertical knockback
        
        // Apply velocity to player body
        if (player.body) {
            player.body.setVelocity(
                player.body.velocity.x + knockbackX,
                player.body.velocity.y + knockbackY
            );
        }
    }
    
    /**
     * Kill an enemy and spawn XP orb
     */
    killEnemy(enemy: Enemy): void {
        // Spawn XP orb at enemy location
        if (enemy.scene && enemy.xpReward) {
            spawnSystem.spawnXPOrb(enemy.scene, enemy.x, enemy.y, enemy.xpReward);
        }
        
        // Destroy health bars
        if (enemy.healthBar) enemy.healthBar.destroy();
        if (enemy.healthBarBg) enemy.healthBarBg.destroy();
        
        // Destroy enemy
        enemy.destroy();
    }
    
    /**
     * Apply damage to player
     */
    damagePlayer(damage: number): void {
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
