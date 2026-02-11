/**
 * Size Transition System
 * Orchestrates cinematic grow/shrink animations when the player changes size.
 * 
 * Two-phase animation:
 * Phase 1 (departure): Camera zoom + background cross-fade + player scale tween in current scene
 * Phase 2 (arrival): Reverse camera zoom back to 1.0 in the new scene
 * 
 * Total duration: ~1.5 seconds (750ms per phase)
 */
import Phaser from 'phaser';
import gameState from '../utils/GameContext';
import stageProgressionSystem from './StageProgressionSystem';
import {
    WORLD_WIDTH,
    WORLD_HEIGHT,
    SIZE_TRANSITION_DURATION,
    GROW_ZOOM_TARGET,
    SHRINK_ZOOM_TARGET,
    TRANSITION_EASE
} from '../config';
import {
    generateSkyBackground,
    generateQuantumBackground,
    generateUnderwaterBackground,
    generateUnderwaterMicroBackground
} from '../utils/backgroundGenerator';
import type { SceneKey } from '../types/game';

/** Transition texture key used for the cross-fade overlay */
const TRANSITION_BG_KEY = 'transitionBackground';

/**
 * Map from target scene key to the background generator function to use
 */
const BACKGROUND_GENERATOR_MAP: Record<string, (scene: Phaser.Scene, seed?: number, textureKey?: string, textureOnly?: boolean) => void> = {
    'MainGameScene': generateSkyBackground,
    'MicroScene': generateQuantumBackground,
    'MainGameMacroScene': generateSkyBackground,
    'UnderwaterScene': generateUnderwaterBackground,
    'UnderwaterMicroScene': generateUnderwaterMicroBackground,
    'UnderwaterMacroScene': generateUnderwaterBackground,
};

/**
 * Target player scales per scene (must match each scene's getSceneConfig().playerScale)
 */
const TARGET_PLAYER_SCALE: Record<string, number> = {
    'MainGameScene': 0.25,
    'MicroScene': 0.15,
    'MainGameMacroScene': 0.35,
    'UnderwaterScene': 0.25,
    'UnderwaterMicroScene': 0.15,
    'UnderwaterMacroScene': 0.35,
};

class SizeTransitionSystem {
    private _isTransitioning: boolean = false;
    private transitionOverlay: Phaser.GameObjects.Image | null = null;

    /**
     * Whether a size transition is currently in progress.
     * Used by InputManager, CameraManager, and BaseGameScene to freeze gameplay.
     */
    get isTransitioning(): boolean {
        return this._isTransitioning;
    }

    /**
     * Start the departure phase of a size transition.
     * Called by PlayerManager instead of a direct scene.start().
     * 
     * @param scene - The current active Phaser scene
     * @param direction - Whether the player is growing or shrinking
     * @param targetSceneKey - The scene key to transition to
     * @param newPlayerScale - The player scale in the target scene
     */
    startTransition(
        scene: Phaser.Scene,
        direction: 'grow' | 'shrink',
        targetSceneKey: SceneKey
    ): void {
        if (this._isTransitioning) return;

        this._isTransitioning = true;
        gameState.isInSizeTransition = true;

        const camera = scene.cameras.main;
        const player = gameState.player;
        const currentStage = stageProgressionSystem.getCurrentStage();

        // Determine zoom target based on direction
        const targetZoom = direction === 'grow' ? GROW_ZOOM_TARGET : SHRINK_ZOOM_TARGET;

        // The player scale we're tweening toward (partial — we go halfway toward target)
        const currentScale = player ? player.scaleX : 0.25;
        const finalScale = TARGET_PLAYER_SCALE[targetSceneKey] ?? 0.25;
        // Tween toward a mid-point during departure (the arrival scene will set the final scale)
        const departureScale = currentScale + (finalScale - currentScale) * 0.5;

        // --- Generate the target scene's background as a texture ---
        // Remove old transition texture if it exists
        if (scene.textures.exists(TRANSITION_BG_KEY)) {
            scene.textures.remove(TRANSITION_BG_KEY);
        }

        const generator = BACKGROUND_GENERATOR_MAP[targetSceneKey];
        if (generator) {
            generator(scene, currentStage, TRANSITION_BG_KEY, true);
        }

        // --- Create cross-fade overlay ---
        if (scene.textures.exists(TRANSITION_BG_KEY)) {
            this.transitionOverlay = scene.add.image(
                WORLD_WIDTH / 2,
                WORLD_HEIGHT / 2,
                TRANSITION_BG_KEY
            );
            this.transitionOverlay.setOrigin(0.5, 0.5);
            this.transitionOverlay.setScrollFactor(0);
            this.transitionOverlay.setDepth(1); // Above current background, below game objects
            this.transitionOverlay.setAlpha(0);
        }

        // --- Pause enemy/projectile physics so they freeze in place ---
        if (gameState.enemies) {
            gameState.enemies.children.entries.forEach(obj => {
                const body = (obj as Phaser.Physics.Arcade.Sprite).body;
                if (body) {
                    body.enable = false;
                }
            });
        }
        if (gameState.projectiles) {
            gameState.projectiles.children.entries.forEach(obj => {
                const body = (obj as Phaser.Physics.Arcade.Sprite).body;
                if (body) {
                    body.enable = false;
                }
            });
        }

        // --- Capture player's current screen position so we can pin it during zoom ---
        const playerX = player ? player.x : camera.scrollX + camera.width / 2;
        const playerY = player ? player.y : camera.scrollY + camera.height / 2;
        const playerScreenX = (playerX - camera.scrollX) * camera.zoom;
        const playerScreenY = (playerY - camera.scrollY) * camera.zoom;

        // --- Run parallel tweens ---
        let tweensComplete = 0;
        const totalTweens = this.transitionOverlay ? 3 : 2; // zoom + player scale + optional bg fade

        const onTweenComplete = () => {
            tweensComplete++;
            if (tweensComplete >= totalTweens) {
                this.finishDeparture(scene, direction, targetSceneKey, targetZoom);
            }
        };

        // 1. Camera zoom tween — recalculate scroll each frame to keep player pinned
        scene.tweens.add({
            targets: camera,
            zoom: targetZoom,
            duration: SIZE_TRANSITION_DURATION,
            ease: TRANSITION_EASE,
            onUpdate: () => {
                // Keep the player at the same screen position as zoom changes
                const newScrollX = playerX - playerScreenX / camera.zoom;
                const newScrollY = playerY - playerScreenY / camera.zoom;
                camera.setScroll(
                    Phaser.Math.Clamp(newScrollX, 0, WORLD_WIDTH - camera.width / camera.zoom),
                    Phaser.Math.Clamp(newScrollY, 0, WORLD_HEIGHT - camera.height / camera.zoom)
                );
            },
            onComplete: onTweenComplete
        });

        // 2. Background cross-fade
        if (this.transitionOverlay) {
            scene.tweens.add({
                targets: this.transitionOverlay,
                alpha: 1,
                duration: SIZE_TRANSITION_DURATION,
                ease: TRANSITION_EASE,
                onComplete: onTweenComplete
            });
        }

        // 3. Player scale tween
        if (player) {
            scene.tweens.add({
                targets: player,
                scaleX: departureScale,
                scaleY: departureScale,
                duration: SIZE_TRANSITION_DURATION,
                ease: TRANSITION_EASE,
                onComplete: onTweenComplete
            });
        } else {
            // No player — complete immediately
            onTweenComplete();
        }
    }

    /**
     * Called when all departure tweens finish.
     * Stores transition metadata and triggers the scene switch.
     */
    private finishDeparture(
        scene: Phaser.Scene,
        direction: 'grow' | 'shrink',
        targetSceneKey: SceneKey,
        endZoom: number
    ): void {
        // Store transition state so the new scene can run the arrival animation
        gameState.transitionZoom = endZoom;
        gameState.transitionDirection = direction;

        // Clean up overlay
        if (this.transitionOverlay) {
            this.transitionOverlay.destroy();
            this.transitionOverlay = null;
        }

        // Remove transition texture
        if (scene.textures.exists(TRANSITION_BG_KEY)) {
            scene.textures.remove(TRANSITION_BG_KEY);
        }

        // Trigger the actual scene switch
        scene.scene.start(targetSceneKey);
    }

    /**
     * Run the arrival phase in the new scene.
     * Called from BaseGameScene.create() when transitioning in.
     * Starts the camera at the stored zoom and tweens back to 1.0.
     * 
     * @param scene - The newly created scene
     */
    finishTransition(scene: Phaser.Scene): void {
        const startZoom = gameState.transitionZoom;
        const direction = gameState.transitionDirection;

        if (startZoom === null || direction === null) {
            // Not arriving from a transition — nothing to do
            this._isTransitioning = false;
            gameState.isInSizeTransition = false;
            return;
        }

        // Set camera to the departure end-zoom
        const camera = scene.cameras.main;
        camera.setZoom(startZoom);

        // Capture player's screen position at current zoom so we can pin it during the tween
        const player = gameState.player;
        const playerX = player ? player.x : camera.scrollX + camera.width / 2;
        const playerY = player ? player.y : camera.scrollY + camera.height / 2;
        const playerScreenX = (playerX - camera.scrollX) * camera.zoom;
        const playerScreenY = (playerY - camera.scrollY) * camera.zoom;

        // Tween back to normal zoom — recalculate scroll each frame to keep player pinned
        scene.tweens.add({
            targets: camera,
            zoom: 1,
            duration: SIZE_TRANSITION_DURATION,
            ease: TRANSITION_EASE,
            onUpdate: () => {
                const newScrollX = playerX - playerScreenX / camera.zoom;
                const newScrollY = playerY - playerScreenY / camera.zoom;
                camera.setScroll(
                    Phaser.Math.Clamp(newScrollX, 0, WORLD_WIDTH - camera.width / camera.zoom),
                    Phaser.Math.Clamp(newScrollY, 0, WORLD_HEIGHT - camera.height / camera.zoom)
                );
            },
            onComplete: () => {
                // Clear transition state
                gameState.transitionZoom = null;
                gameState.transitionDirection = null;
                gameState.isInSizeTransition = false;
                this._isTransitioning = false;
            }
        });
    }

    /**
     * Clean up any transition state (e.g. on scene shutdown or menu exit).
     */
    cleanup(): void {
        if (this.transitionOverlay) {
            this.transitionOverlay.destroy();
            this.transitionOverlay = null;
        }
        this._isTransitioning = false;
        gameState.isInSizeTransition = false;
        gameState.transitionZoom = null;
        gameState.transitionDirection = null;
    }
}

// Export singleton instance
const sizeTransitionSystem = new SizeTransitionSystem();
export default sizeTransitionSystem;
export { SizeTransitionSystem };
