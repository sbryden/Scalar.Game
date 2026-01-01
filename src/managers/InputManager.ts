/**
 * Input Manager
 * Handles all keyboard input setup and player movement controls
 * Now supports touch controls for iPad and mobile devices
 */
import Phaser from 'phaser';
import gameState from '../utils/gameState';
import { changeSize, getPlayerSize } from '../player';
import { fireProjectile } from '../projectiles';
import { SIZE_CONFIG } from '../config';
import type { WASDKeys } from '../types/game';
import { TouchControlsManager } from './TouchControlsManager';
import { shouldEnableTouchControls } from '../utils/deviceDetection';
import { GestureDetector } from '../utils/gestureDetection';

export class InputManager {
    scene: Phaser.Scene;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    wasdKeys!: WASDKeys;
    spaceKey!: Phaser.Input.Keyboard.Key;
    shiftKey!: Phaser.Input.Keyboard.Key;
    
    // Touch controls
    touchControls: TouchControlsManager | null = null;
    gestureDetector: GestureDetector | null = null;
    useTouchControls: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.cursors = null as any;
        this.wasdKeys = null as any;
        this.spaceKey = null as any;
        this.shiftKey = null as any;
        this.useTouchControls = shouldEnableTouchControls();
    }
    
    /**
     * Setup all input handlers
     */
    setupInput(): void {
        // Create cursor keys and WASD
        this.cursors = this.scene.input.keyboard!.createCursorKeys();
        this.wasdKeys = this.scene.input.keyboard!.addKeys('W,A,S,D') as WASDKeys;
        this.spaceKey = this.scene.input.keyboard!.addKey('SPACE');
        this.shiftKey = this.scene.input.keyboard!.addKey('SHIFT');
        
        // Store in gameState for other modules
        gameState.cursors = this.cursors;
        gameState.wasdKeys = this.wasdKeys;
        
        // Setup action key handlers
        this.setupActionKeys();
        
        // Setup touch controls if on a touch device
        if (this.useTouchControls) {
            this.setupTouchControls();
        }
    }
    
    /**
     * Setup touch controls for iPad and mobile devices
     */
    setupTouchControls(): void {
        const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                            gameState.currentSceneKey === 'UnderwaterMicroScene';
        
        // Create touch controls UI
        this.touchControls = new TouchControlsManager(this.scene);
        this.touchControls.create(isUnderwater);
        
        // Setup gesture detector
        this.gestureDetector = new GestureDetector(this.scene);
        this.gestureDetector.onSwipe((event) => {
            // Handle swipe gestures
            switch (event.direction) {
                case 'up':
                    if (!isUnderwater) {
                        this.handleJump();
                    }
                    break;
                case 'left':
                    changeSize('smaller');
                    break;
                case 'right':
                    changeSize('larger');
                    break;
            }
        });
    }
    
    /**
     * Setup action key handlers (jump, size change, attack)
     */
    setupActionKeys(): void {
        // Check if we're underwater for different control scheme
        const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                            gameState.currentSceneKey === 'UnderwaterMicroScene';
        
        if (!isUnderwater) {
            // Jump (only for land environments)
            this.scene.input.keyboard?.on('keydown-SPACE', () => {
                this.handleJump();
            });
        }
        
        // Size changes - Q for smaller, E for larger (one step at a time)
        this.scene.input.keyboard?.on('keydown-Q', () => changeSize('smaller'));
        this.scene.input.keyboard?.on('keydown-E', () => changeSize('larger'));
        
        // Attack
        this.scene.input.keyboard?.on('keydown-F', () => {
            if (gameState.player) {
                fireProjectile(gameState.player.scene);
            }
        });
    }
    
    /**
     * Handle jump action
     */
    handleJump(): void {
        const player = gameState.player;
        if (!player || !player.body.touching.down) {
            return;
        }
        
        const body = player.body;
        const currentVelocityX = body.velocity.x;
        const sizeConfig = SIZE_CONFIG[getPlayerSize()];
        if (!sizeConfig) return;
        
        const jumpPower = 330 * sizeConfig.jumpMultiplier;
        body.setVelocityY(-jumpPower);
        body.setVelocityX(currentVelocityX);
    }
    
    /**
     * Handle player movement (called from update loop)
     */
    handleMovement(): void {
        if (!gameState.player) return;
        
        // Update melee mode state based on Shift key
        const wasMeleeMode = gameState.player.isMeleeMode || false;
        gameState.player.isMeleeMode = this.shiftKey.isDown;
        
        // Visual feedback when entering/exiting melee mode
        if (gameState.player.isMeleeMode && !wasMeleeMode) {
            // Entering melee mode - add blue tint
            gameState.player.setTint(0x88ccff);
        } else if (!gameState.player.isMeleeMode && wasMeleeMode) {
            // Exiting melee mode - clear tint
            gameState.player.clearTint();
        }
        
        // Check if player is stunned
        const now = Date.now();
        if (gameState.player.stunnedUntil && now < gameState.player.stunnedUntil) {
            // Player is stunned, no input allowed
            return;
        }
        
        // Update touch controls if enabled
        if (this.useTouchControls && this.touchControls) {
            this.touchControls.update();
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
    handleLandMovement(): void {
        const baseSpeed = 160;
        const sizeConfig = SIZE_CONFIG[getPlayerSize()];
        if (!sizeConfig) return;
        
        const speedMultiplier = sizeConfig.speedMultiplier;
        const body = gameState.player!.body;
        
        // Check for touch controls input
        let moveLeft = this.wasdKeys.A.isDown || this.cursors.left.isDown;
        let moveRight = this.wasdKeys.D.isDown || this.cursors.right.isDown;
        
        if (this.useTouchControls && this.touchControls) {
            const direction = this.touchControls.getDirection();
            if (direction.x < -0.3) {
                moveLeft = true;
            } else if (direction.x > 0.3) {
                moveRight = true;
            }
        }
        
        if (moveLeft) {
            body.setVelocityX(-baseSpeed * speedMultiplier);
            gameState.player!.setFlipX(true);  // Face left
        } else if (moveRight) {
            body.setVelocityX(baseSpeed * speedMultiplier);
            gameState.player!.setFlipX(false); // Face right
        } else {
            body.setVelocityX(0);
        }
    }
    
    /**
     * Handle underwater submarine movement with thrust controls
     */
    handleUnderwaterMovement(): void {
        const baseSpeed = 140; // Slightly slower in water
        const thrustPower = 150; // Vertical thrust power
        const sizeConfig = SIZE_CONFIG[getPlayerSize()];
        if (!sizeConfig) return;
        
        const speedMultiplier = sizeConfig.speedMultiplier;
        const body = gameState.player!.body;
        
        // Check for touch controls input
        let moveLeft = this.wasdKeys.A.isDown || this.cursors.left.isDown;
        let moveRight = this.wasdKeys.D.isDown || this.cursors.right.isDown;
        let moveUp = this.wasdKeys.W.isDown || this.cursors.up.isDown || this.spaceKey.isDown;
        let moveDown = this.wasdKeys.S.isDown || this.cursors.down.isDown;
        
        if (this.useTouchControls && this.touchControls) {
            const direction = this.touchControls.getDirection();
            if (direction.x < -0.3) {
                moveLeft = true;
            } else if (direction.x > 0.3) {
                moveRight = true;
            }
            
            if (this.touchControls.isJumpPressed()) {
                moveUp = true;
            }
            if (this.touchControls.isDownPressed()) {
                moveDown = true;
            }
        }
        
        // Horizontal movement
        if (moveLeft) {
            body.setVelocityX(-baseSpeed * speedMultiplier);
            gameState.player!.setFlipX(true);  // Face left
        } else if (moveRight) {
            body.setVelocityX(baseSpeed * speedMultiplier);
            gameState.player!.setFlipX(false); // Face right
        } else {
            body.setVelocityX(0);
        }
        
        // Vertical thrust controls (W for up, S for down, Space also for up)
        if (moveUp) {
            // Thrust upward
            const currentVelY = body.velocity.y;
            body.setVelocityY(Math.max(currentVelY - thrustPower * 0.15, -thrustPower));
        } else if (moveDown) {
            // Thrust downward
            const currentVelY = body.velocity.y;
            body.setVelocityY(Math.min(currentVelY + thrustPower * 0.15, thrustPower));
        }
    }
    
    /**
     * Cleanup input handlers
     */
    destroy(): void {
        this.scene.input.keyboard?.removeAllListeners();
        
        // Clean up touch controls
        if (this.touchControls) {
            this.touchControls.destroy();
            this.touchControls = null;
        }
        
        if (this.gestureDetector) {
            this.gestureDetector.destroy();
            this.gestureDetector = null;
        }
    }
}
