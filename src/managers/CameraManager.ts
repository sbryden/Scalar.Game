/**
 * Camera Manager
 * Handles camera setup and following behavior
 */
import gameState from '../utils/gameState';
import { WORLD_WIDTH, WORLD_HEIGHT, CAMERA_PADDING } from '../config';

export class CameraManager {
    scene: Phaser.Scene;
    camera: Phaser.Cameras.Scene2D.Camera;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.camera = scene.cameras.main;
    }
    
    /**
     * Setup camera bounds and following
     */
    setupCamera() {
        if (!gameState.player) {
            console.error('CameraManager: Player not initialized');
            return;
        }
        
        this.camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.camera.startFollow(gameState.player);
        this.camera.setLerp(0.1, 0);
    }
    
    /**
     * Update camera position (called from game loop)
     */
    update() {
        if (!gameState.player) return;
        
        const targetPlayerScreenX = CAMERA_PADDING;
        let targetCameraX = gameState.player.x - targetPlayerScreenX;
        targetCameraX = Phaser.Math.Clamp(targetCameraX, 0, WORLD_WIDTH - this.camera.width);
        this.camera.setScroll(targetCameraX, 0);
    }
}
