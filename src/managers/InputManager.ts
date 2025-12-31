/**
 * Input Manager
 * Handles all keyboard input setup and player movement controls
 */
import gameState from '../utils/gameState';
import { changeSize, getPlayerSize } from '../player';
import { fireProjectile } from '../projectiles';
import { SIZE_CONFIG } from '../config';

export class InputManager {
    scene: Phaser.Scene;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    wasdKeys!: any;
    spaceKey!: Phaser.Input.Keyboard.Key;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.cursors = null;
        this.wasdKeys = null;
        this.spaceKey = null;
    }
    
    /**
     * Setup all input handlers
     */
    setupInput() {
        // Create cursor keys and WASD
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.wasdKeys = this.scene.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.scene.input.keyboard.addKey('SPACE');
        
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
        // Check if we're underwater for different control scheme
        const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                            gameState.currentSceneKey === 'UnderwaterMicroScene';
        
        if (!isUnderwater) {
            // Jump (only for land environments)
            this.scene.input.keyboard.on('keydown-SPACE', () => {
                this.handleJump();
            });
        }
        
        // Size changes - Q for smaller, E for larger (one step at a time)
        this.scene.input.keyboard.on('keydown-Q', () => changeSize('smaller'));
        this.scene.input.keyboard.on('keydown-E', () => changeSize('larger'));
        
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
        
        // Check if player is stunned
        const now = Date.now();
        if (gameState.player.stunnedUntil && now < gameState.player.stunnedUntil) {
            // Player is stunned, no input allowed
            return;
        }
        
        // Check if we're underwater for different movement physics
        const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                            gameState.currentSceneKey === 'UnderwaterMicroScene';
        
        if (isUnderwater) {
            this.handleUnderwaterMovement();
        } else {
            this.handleLandMovement();
        }
    }
    
    /**
     * Handle land-based movement (original behavior)
     */
    handleLandMovement() {
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
     * Handle underwater submarine movement with thrust controls
     */
    handleUnderwaterMovement() {
        const baseSpeed = 140; // Slightly slower in water
        const thrustPower = 150; // Vertical thrust power
        const speedMultiplier = SIZE_CONFIG[getPlayerSize()].speedMultiplier;
        
        // Horizontal movement
        if (this.wasdKeys.A.isDown || this.cursors.left.isDown) {
            gameState.player.body.setVelocityX(-baseSpeed * speedMultiplier);
            gameState.player.setFlipX(true);  // Face left
        } else if (this.wasdKeys.D.isDown || this.cursors.right.isDown) {
            gameState.player.body.setVelocityX(baseSpeed * speedMultiplier);
            gameState.player.setFlipX(false); // Face right
        } else {
            gameState.player.body.setVelocityX(0);
        }
        
        // Vertical thrust controls (W for up, S for down, Space also for up)
        if (this.wasdKeys.W.isDown || this.cursors.up.isDown || this.spaceKey.isDown) {
            // Thrust upward
            const currentVelY = gameState.player.body.velocity.y;
            gameState.player.body.setVelocityY(Math.max(currentVelY - thrustPower * 0.15, -thrustPower));
        } else if (this.wasdKeys.S.isDown || this.cursors.down.isDown) {
            // Thrust downward
            const currentVelY = gameState.player.body.velocity.y;
            gameState.player.body.setVelocityY(Math.min(currentVelY + thrustPower * 0.15, thrustPower));
        }
    }
    
    /**
     * Cleanup input handlers
     */
    destroy() {
        this.scene.input.keyboard.removeAllListeners();
    }
}
