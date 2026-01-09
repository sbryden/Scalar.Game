/**
 * Magnetism System
 * Handles XP orb attraction to the player
 */
import Phaser from 'phaser';
import gameState from '../utils/GameContext';
import { XP_CONFIG } from '../config';
import type { XPOrb } from '../types/game';

export class MagnetismSystem {
    /**
     * Update all XP orbs - attract them to player if in range
     * Companion orbs float upward first, then magnetize
     */
    update(): void {
        if (!gameState.player || !gameState.xpOrbs) return;
        
        gameState.xpOrbs.children.entries.forEach(obj => {
            const orb = obj as XPOrb;
            
            // Special handling for companion orbs - float up first
            if (orb.isCompanionOrb && !orb.hasReachedFloatHeight) {
                // Check if orb has reached target height
                if (orb.floatTargetY && orb.y <= orb.floatTargetY) {
                    orb.hasReachedFloatHeight = true;
                    // Stop vertical movement and allow magnetism
                    orb.body.setVelocity(0, 0);
                }
                // Skip magnetism while floating up
                return;
            }
            
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

// Singleton instance management
let magnetismSystemInstance: MagnetismSystem | null = null;

/**
 * Get the MagnetismSystem instance, creating it if necessary
 */
export function getMagnetismSystem(): MagnetismSystem {
    if (!magnetismSystemInstance) {
        magnetismSystemInstance = new MagnetismSystem();
    }
    return magnetismSystemInstance;
}

/**
 * Reset the MagnetismSystem instance (useful for testing)
 */
export function resetMagnetismSystem(): void {
    magnetismSystemInstance = null;
}

// Default export for backward compatibility
export default getMagnetismSystem();
