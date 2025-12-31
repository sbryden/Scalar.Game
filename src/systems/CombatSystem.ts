/**
 * Combat System
 * Handles damage calculations and combat logic
 */
import { PROJECTILE_CONFIG, PLAYER_COMBAT_CONFIG } from '../config';
import playerStatsSystem from './PlayerStatsSystem';
import spawnSystem from './SpawnSystem';

export class CombatSystem {
    /**
     * Apply damage to an enemy from a projectile
     */
    damageEnemy(projectile, enemy) {
        if (!projectile.active) return;
        
        const damage = projectile.damage || PROJECTILE_CONFIG.basic.damage;
        enemy.health -= damage;
        
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
    handlePlayerEnemyCollision(player, enemy) {
        const now = Date.now();
        
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
            // Enemy damages player
            const enemyDamage = enemy.damage || 10;
            this.damagePlayer(enemyDamage);
            enemy.lastDamageTime = now;
            
            // Visual feedback: flash player red and shake camera
            player.setTint(0xff0000);
            enemy.scene.time.delayedCall(PLAYER_COMBAT_CONFIG.invulnerabilityDuration, () => {
                if (player.active) {
                    player.clearTint();
                }
            });
            
            // Camera shake effect
            enemy.scene.cameras.main.shake(100, 0.005);
        }
        
        // Check if player can damage enemy (cooldown per enemy)
        if (!enemy.lastPlayerDamageTime || now - enemy.lastPlayerDamageTime >= PLAYER_COMBAT_CONFIG.playerToEnemyCooldown) {
            // Player damages enemy (melee contact damage)
            const playerDamage = PLAYER_COMBAT_CONFIG.baseMeleeDamage;
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
    
    /**
     * Update stun effects for entities
     * Call this every frame to handle stun state
     */
    updateStunEffects(entities, player) {
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
    applyEnemyKnockback(player, enemy) {
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
    applyPlayerKnockback(player, enemy) {
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
    killEnemy(enemy) {
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
    damagePlayer(damage) {
        playerStatsSystem.takeDamage(damage);
    }
    
    /**
     * Calculate damage with potential modifiers
     * (Can be extended for critical hits, damage boosts, etc.)
     */
    calculateDamage(baseDamage, attacker, target) {
        let finalDamage = baseDamage;
        
        // Future: Add damage modifiers here
        // if (attacker.hasCritical) finalDamage *= 2;
        // if (target.hasArmor) finalDamage *= 0.5;
        
        return finalDamage;
    }
}

// Export singleton instance
export default new CombatSystem();
