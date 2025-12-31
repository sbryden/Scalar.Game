/**
 * Debug Display
 * Shows debug information during development
 */
import { WORLD_WIDTH } from '../config';

export class DebugDisplay {
    scene: any;
    debugText: any;
    enabled: boolean;

    constructor(scene) {
        this.scene = scene;
        this.debugText = null;
        this.enabled = true;
        
        this.create();
    }
    
    create() {
        this.debugText = this.scene.add.text(10, 10, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });
        this.debugText.setScrollFactor(0);
        this.debugText.setDepth(1001); // Above HUD
    }
    
    /**
     * Update debug display with player stats and position
     */
    update(playerX, playerStats) {
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
    toggle() {
        this.enabled = !this.enabled;
        if (this.debugText) {
            this.debugText.setVisible(this.enabled);
        }
    }
    
    /**
     * Show debug display
     */
    show() {
        this.enabled = true;
        if (this.debugText) {
            this.debugText.setVisible(true);
        }
    }
    
    /**
     * Hide debug display
     */
    hide() {
        this.enabled = false;
        if (this.debugText) {
            this.debugText.setVisible(false);
        }
    }
    
    /**
     * Clean up debug display
     */
    destroy() {
        if (this.debugText) {
            this.debugText.destroy();
        }
    }
}
