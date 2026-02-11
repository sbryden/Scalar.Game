/**
 * Targeting System
 * Manages tab-targeting of enemies for aimed projectile fire.
 * Pressing Tab cycles through visible enemies nearest-to-farthest.
 * When a target is locked, projectiles fire toward its center instead of straight ahead.
 * Target auto-clears on enemy death, despawn, or leaving the screen.
 */
import gameState from '../utils/GameContext';
import type { Enemy } from '../types/game';

class TargetingSystem {
    private targetedEnemy: Enemy | null = null;
    private reticle: Phaser.GameObjects.Graphics | null = null;
    private cycleIndex: number = -1;
    private lastSortedEnemies: Enemy[] = [];

    /** Pulse animation state for the reticle */
    private pulseTime: number = 0;

    /**
     * Cycle to the next target among visible enemies sorted by distance.
     * Order: nearest → farthest → no target → nearest ...
     */
    cycleTarget(scene: Phaser.Scene): void {
        const player = gameState.player;
        if (!player) {
            this.clearTarget();
            return;
        }

        const cam = scene.cameras.main;
        const worldView = cam.worldView;

        // Gather active, alive, on-screen enemies
        const visibleEnemies = this.getVisibleEnemies(worldView);

        if (visibleEnemies.length === 0) {
            this.clearTarget();
            return;
        }

        // Sort by distance from the player (nearest first)
        visibleEnemies.sort((a, b) => {
            const distA = Phaser.Math.Distance.Between(player.x, player.y, a.x, a.y);
            const distB = Phaser.Math.Distance.Between(player.x, player.y, b.x, b.y);
            return distA - distB;
        });

        this.lastSortedEnemies = visibleEnemies;

        // Advance cycle index
        this.cycleIndex++;

        // Past the last enemy → deselect (no target)
        if (this.cycleIndex >= visibleEnemies.length) {
            this.clearTarget();
            return;
        }

        this.targetedEnemy = visibleEnemies[this.cycleIndex]!;
        this.showReticle();
    }

    /**
     * Get the currently targeted enemy, or null if none.
     */
    getTargetedEnemy(): Enemy | null {
        return this.targetedEnemy;
    }

    /**
     * Clear the current target and hide the reticle.
     */
    clearTarget(): void {
        this.targetedEnemy = null;
        this.cycleIndex = -1;
        this.lastSortedEnemies = [];
        this.hideReticle();
    }

    /**
     * Clear the target only if the given enemy is the current target.
     * Called when an enemy dies or despawns.
     */
    clearIfTarget(enemy: Enemy): void {
        if (this.targetedEnemy === enemy) {
            this.clearTarget();
        }
    }

    /**
     * Initialize the reticle graphics object for a scene.
     * Call this when a gameplay scene is created.
     */
    initReticle(scene: Phaser.Scene): void {
        this.destroyReticle();
        this.reticle = scene.add.graphics();
        this.reticle.setDepth(200);
        this.reticle.setVisible(false);
    }

    /**
     * Destroy the reticle graphics and reset targeting state.
     * Call this on scene shutdown.
     */
    destroyReticle(): void {
        if (this.reticle) {
            this.reticle.destroy();
            this.reticle = null;
        }
        this.clearTarget();
    }

    /**
     * Per-frame update: validate the current target and update the reticle position.
     * Call in the scene's update() loop before projectile updates.
     */
    update(scene: Phaser.Scene): void {
        if (!this.targetedEnemy) return;

        // Validate target is still alive and active
        if (!this.targetedEnemy.active || this.targetedEnemy.isDead) {
            this.clearTarget();
            return;
        }

        // Validate target is still visible on screen
        const cam = scene.cameras.main;
        const worldView = cam.worldView;
        if (!worldView.contains(this.targetedEnemy.x, this.targetedEnemy.y)) {
            this.clearTarget();
            return;
        }

        // Update reticle position and pulse effect
        this.updateReticle(scene);
    }

    // ============================================
    // PRIVATE HELPERS
    // ============================================

    /**
     * Get all active, alive enemies whose position is within the camera's world view.
     */
    private getVisibleEnemies(worldView: Phaser.Geom.Rectangle): Enemy[] {
        if (!gameState.enemies) return [];

        return gameState.enemies.children.entries
            .filter(obj => {
                const enemy = obj as Enemy;
                return enemy.active && !enemy.isDead && worldView.contains(enemy.x, enemy.y);
            })
            .map(obj => obj as Enemy);
    }

    /**
     * Show the reticle (set visible).
     */
    private showReticle(): void {
        if (this.reticle) {
            this.reticle.setVisible(true);
        }
    }

    /**
     * Hide the reticle (set hidden).
     */
    private hideReticle(): void {
        if (this.reticle) {
            this.reticle.setVisible(false);
            this.reticle.clear();
        }
    }

    /**
     * Redraw the reticle at the targeted enemy's position with a pulsing ring effect.
     */
    private updateReticle(scene: Phaser.Scene): void {
        if (!this.reticle || !this.targetedEnemy) return;

        this.reticle.clear();

        // Pulse animation: radius oscillates over time
        this.pulseTime += scene.game.loop.delta;
        const pulseFactor = 1 + 0.15 * Math.sin(this.pulseTime * 0.005);
        const baseRadius = Math.max(this.targetedEnemy.displayWidth, this.targetedEnemy.displayHeight) * 0.6;
        const radius = baseRadius * pulseFactor;

        const x = this.targetedEnemy.x;
        const y = this.targetedEnemy.y;

        // Outer ring (red)
        this.reticle.lineStyle(3, 0xff3333, 0.9);
        this.reticle.strokeCircle(x, y, radius);

        // Inner ring (yellow, thinner)
        this.reticle.lineStyle(1.5, 0xffcc00, 0.6);
        this.reticle.strokeCircle(x, y, radius * 0.7);

        // Crosshair lines
        const crossLen = radius * 0.35;
        this.reticle.lineStyle(2, 0xff3333, 0.7);
        // top
        this.reticle.beginPath();
        this.reticle.moveTo(x, y - radius);
        this.reticle.lineTo(x, y - radius + crossLen);
        this.reticle.strokePath();
        // bottom
        this.reticle.beginPath();
        this.reticle.moveTo(x, y + radius);
        this.reticle.lineTo(x, y + radius - crossLen);
        this.reticle.strokePath();
        // left
        this.reticle.beginPath();
        this.reticle.moveTo(x - radius, y);
        this.reticle.lineTo(x - radius + crossLen, y);
        this.reticle.strokePath();
        // right
        this.reticle.beginPath();
        this.reticle.moveTo(x + radius, y);
        this.reticle.lineTo(x + radius - crossLen, y);
        this.reticle.strokePath();
    }
}

const targetingSystem = new TargetingSystem();
export default targetingSystem;
export { targetingSystem, TargetingSystem };
