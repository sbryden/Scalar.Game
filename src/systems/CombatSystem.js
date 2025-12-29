/**
 * Combat System
 * Handles damage calculations and combat logic
 */
import { PROJECTILE_CONFIG } from '../config.js';
import playerStatsSystem from './PlayerStatsSystem.js';
import spawnSystem from './SpawnSystem.js';

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
