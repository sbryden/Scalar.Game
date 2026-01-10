/**
 * Debug Display
 * Shows debug information during development
 */
import Phaser from 'phaser';
import { WORLD_WIDTH } from '../config';
import type { PlayerStats } from '../types/game';

export class DebugDisplay {
    scene: Phaser.Scene;
    debugText: Phaser.GameObjects.Text | null;
    enabled: boolean;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.debugText = null;
        // Only enable debug display in development mode
        this.enabled = (import.meta as any).env?.DEV || false;
        
        if (this.enabled) {
            this.create();
        }
    }
    
    create(): void {
        const cameraHeight = this.scene.cameras.main.height;
        
        this.debugText = this.scene.add.text(10, cameraHeight - 30, '', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });
        this.debugText.setScrollFactor(0);
        this.debugText.setDepth(1001); // Above HUD
    }
    
    /**
     * Update debug display with player stats and position
     */
    update(playerX: number, playerStats: PlayerStats): void {
        if (!this.enabled || !this.debugText) return;
        
        const text = 
            `X: ${Math.round(playerX)} / ${WORLD_WIDTH} | ` +
            `LV: ${playerStats.level} | ` +
            `HP: ${playerStats.health}/${playerStats.maxHealth} | ` +
            `XP: ${playerStats.xp}/${playerStats.xpToLevel}`;
        
        this.debugText.setText(text);
    }
    
    /**
     * Toggle debug display visibility
     */
    toggle(): void {
        this.enabled = !this.enabled;
        if (this.debugText) {
            this.debugText.setVisible(this.enabled);
        }
    }
    
    /**
     * Show debug display
     */
    show(): void {
        this.enabled = true;
        if (this.debugText) {
            this.debugText.setVisible(true);
        }
    }
    
    /**
     * Hide debug display
     */
    hide(): void {
        this.enabled = false;
        if (this.debugText) {
            this.debugText.setVisible(false);
        }
    }
    
    /**
     * Clean up debug display
     */
    destroy(): void {
        if (this.debugText) {
            this.debugText.destroy();
        }
    }
}
