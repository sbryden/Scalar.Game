/**
 * Input Manager
 * Handles all keyboard input setup and player movement controls
 */
import gameState from '../utils/gameState.js';
import { changeSize, getPlayerSize } from '../player.js';
import { fireProjectile } from '../projectiles.js';
import { SIZE_CONFIG } from '../config.js';

export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.cursors = null;
        this.wasdKeys = null;
    }
    
    /**
     * Setup all input handlers
     */
    setupInput() {
        // Create cursor keys and WASD
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.wasdKeys = this.scene.input.keyboard.addKeys('W,A,S,D');
        
        // Store in gameState for other modules
        gameState.cursors = this.cursors;
        gameState.wasdKeys = this.wasdKeys;
        
        // Setup action key handlers
        this.setupActionKeys();
    }
    
    /**
     * Setup action key handlers (jump, size change, attack)
     */
    setupActionKeys() {
        // Jump
        this.scene.input.keyboard.on('keydown-SPACE', () => {
            this.handleJump();
        });
        
        // Size changes
        this.scene.input.keyboard.on('keydown-Q', () => changeSize('small'));
        this.scene.input.keyboard.on('keydown-E', () => changeSize('large'));
        this.scene.input.keyboard.on('keydown-R', () => changeSize('normal'));
        
        // Attack
        this.scene.input.keyboard.on('keydown-F', () => {
            if (gameState.player) {
                fireProjectile(gameState.player.scene);
            }
        });
    }
    
    /**
     * Handle jump action
     */
    handleJump() {
        if (!gameState.player || !gameState.player.body.touching.down) {
            return;
        }
        
        const currentVelocityX = gameState.player.body.velocity.x;
        const jumpPower = 330 * SIZE_CONFIG[getPlayerSize()].jumpMultiplier;
        gameState.player.body.setVelocityY(-jumpPower);
        gameState.player.body.setVelocityX(currentVelocityX);
    }
    
    /**
     * Handle player movement (called from update loop)
     */
    handleMovement() {
        if (!gameState.player) return;
        
        const baseSpeed = 160;
        const speedMultiplier = SIZE_CONFIG[getPlayerSize()].speedMultiplier;
        
        if (this.wasdKeys.A.isDown || this.cursors.left.isDown) {
            gameState.player.body.setVelocityX(-baseSpeed * speedMultiplier);
            gameState.player.setFlipX(true);  // Face left
        } else if (this.wasdKeys.D.isDown || this.cursors.right.isDown) {
            gameState.player.body.setVelocityX(baseSpeed * speedMultiplier);
            gameState.player.setFlipX(false); // Face right
        } else {
            gameState.player.body.setVelocityX(0);
        }
    }
    
    /**
     * Cleanup input handlers
     */
    destroy() {
        this.scene.input.keyboard.removeAllListeners();
    }
}
