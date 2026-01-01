/**
 * Magnetism System
 * Handles XP orb attraction to the player
 */
import Phaser from 'phaser';
import gameState from '../utils/gameState';
import { XP_CONFIG } from '../config';
import type { XPOrb } from '../types/game';

export class MagnetismSystem {
    /**
     * Update all XP orbs - attract them to player if in range
     */
    update(): void {
        if (!gameState.player || !gameState.xpOrbs) return;
        
        gameState.xpOrbs.children.entries.forEach(obj => {
            const orb = obj as XPOrb;
            const distance = Phaser.Math.Distance.Between(
                gameState.player!.x, 
                gameState.player!.y, 
                orb.x, 
                orb.y
            );
            
            if (distance < XP_CONFIG.magnetism.range) {
                const angle = Phaser.Math.Angle.Between(
                    orb.x, 
                    orb.y, 
                    gameState.player!.x, 
                    gameState.player!.y
                );
                
                orb.body.setVelocity(
                    Math.cos(angle) * XP_CONFIG.magnetism.speed,
                    Math.sin(angle) * XP_CONFIG.magnetism.speed
                );
            }
        });
    }
}

// Export singleton instance
export default new MagnetismSystem();
