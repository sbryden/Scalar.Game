/**
 * Magnetism System
 * Handles XP orb attraction to the player
 */
import gameState from '../utils/gameState.js';

const MAGNETISM_RANGE = 150; // Distance to start pulling orbs
const MAGNETISM_SPEED = 250; // Speed to pull orbs

export class MagnetismSystem {
    /**
     * Update all XP orbs - attract them to player if in range
     */
    update() {
        if (!gameState.player || !gameState.xpOrbs) return;
        
        gameState.xpOrbs.children.entries.forEach(orb => {
            const distance = Phaser.Math.Distance.Between(
                gameState.player.x, 
                gameState.player.y, 
                orb.x, 
                orb.y
            );
            
            if (distance < MAGNETISM_RANGE) {
                const angle = Phaser.Math.Angle.Between(
                    orb.x, 
                    orb.y, 
                    gameState.player.x, 
                    gameState.player.y
                );
                
                orb.body.setVelocity(
                    Math.cos(angle) * MAGNETISM_SPEED,
                    Math.sin(angle) * MAGNETISM_SPEED
                );
            }
        });
    }
}

// Export singleton instance
export default new MagnetismSystem();
