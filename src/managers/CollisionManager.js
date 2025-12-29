/**
 * Collision Manager
 * Sets up and manages all physics collisions in the game
 */
import gameState from '../utils/gameState.js';
import { damageEnemy } from '../enemies.js';
import { damagePlayer } from '../xpOrbs.js';

export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }
    
    /**
     * Setup all collision handlers
     */
    setupCollisions() {
        const { player, enemies, projectiles, xpOrbs, platforms } = gameState;
        
        if (!player || !enemies || !projectiles || !platforms) {
            console.error('CollisionManager: Required game objects not initialized');
            return;
        }
        
        // Enemy collisions
        this.scene.physics.add.collider(enemies, platforms);
        
        // Projectile collisions
        this.scene.physics.add.collider(projectiles, platforms, (proj) => {
            proj.destroy();
        });
        
        this.scene.physics.add.collider(projectiles, enemies, (proj, enemy) => {
            damageEnemy(proj, enemy);
        }, null, this.scene);
        
        // Player-Enemy collision (damage player)
        this.scene.physics.add.overlap(player, enemies, (p, enemy) => {
            const now = Date.now();
            
            // Check if enemy can damage player (1 second cooldown per enemy)
            if (!enemy.lastDamageTime || now - enemy.lastDamageTime >= 1000) {
                damagePlayer(enemy.damage || 10);
                enemy.lastDamageTime = now;
                
                // Visual feedback: flash player red and shake camera
                player.setTint(0xff0000);
                this.scene.time.delayedCall(150, () => {
                    if (player.active) {
                        player.clearTint();
                    }
                });
                
                // Camera shake effect
                this.scene.cameras.main.shake(100, 0.005);
            }
        });
    }
}
