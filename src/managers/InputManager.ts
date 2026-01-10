import Phaser from 'phaser';
import gameState from '../utils/GameContext';
import playerManager from './PlayerManager';
import projectileManager from './ProjectileManager';
import { SIZE_CONFIG, GOD_MODE_CONFIG, STAMINA_UI_CONFIG, COMBAT_CONFIG, PHYSICS_CONFIG, getOptions } from '../config';
import playerStatsSystem from '../systems/PlayerStatsSystem';
import { getStaminaSystem } from '../systems/StaminaSystem';
import type { WASDKeys } from '../types/game';

export class InputManager {
    scene: Phaser.Scene;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    wasdKeys!: WASDKeys;
    spaceKey!: Phaser.Input.Keyboard.Key;
    shiftKey!: Phaser.Input.Keyboard.Key;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.cursors = null as any;
        this.wasdKeys = null as any;
        this.spaceKey = null as any;
        this.shiftKey = null as any;
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
        this.scene.input.keyboard?.on('keydown-Q', () => {
            const currentSize = playerManager.getPlayerSize();
            const newSize = currentSize === 'large' ? 'normal' : 'small';
            playerManager.changeSize(newSize);
        });
        this.scene.input.keyboard?.on('keydown-E', () => {
            const currentSize = playerManager.getPlayerSize();
            const newSize = currentSize === 'small' ? 'normal' : 'large';
            playerManager.changeSize(newSize);
        });
        
        // Attack - F or K
        this.scene.input.keyboard?.on('keydown-F', () => {
            projectileManager.fireProjectile(this.scene);
        });
        this.scene.input.keyboard?.on('keydown-K', () => {
            projectileManager.fireProjectile(this.scene);
        });
    }
    
    /**
     * Handle jump action
     */
    handleJump(): void {
        const player = gameState.player;
        if (!player || !player.body) {
            return;
        }
        
        if (!player.body.touching.down) {
            return;
        }
        
        const body = player.body;
        const currentVelocityX = body.velocity.x;
        const sizeConfig = SIZE_CONFIG[playerManager.getPlayerSize()];
        if (!sizeConfig) return;
        
        const options = getOptions();
        const jumpPower = options.playerJumpHeight * sizeConfig.jumpMultiplier;
        body.setVelocityY(-jumpPower);
        body.setVelocityX(currentVelocityX);
    }
    
    /**
     * Handle player movement (called from update loop)
     */
    handleMovement(): void {
        if (!gameState.player) return;
        
        const staminaSystem = getStaminaSystem();
        const wasMeleeMode = gameState.player.isMeleeMode || false;
        const wantsToActivateMelee = this.shiftKey.isDown;
        
        // Determine if melee mode should be active
        let newMeleeMode = false;
        if (wantsToActivateMelee) {
            // Check if player can activate melee mode
            if (wasMeleeMode) {
                // Already in melee mode - can continue until stamina hits 0
                const staminaState = staminaSystem.getState();
                newMeleeMode = !staminaState.isDepleted;
            } else {
                // Trying to activate - check if allowed
                newMeleeMode = staminaSystem.canActivateMeleeMode();
            }
        } else {
            // Player released shift - reset the ability
            staminaSystem.resetAbility();
            newMeleeMode = false;
        }
        
        // Update melee mode state
        gameState.player.isMeleeMode = newMeleeMode;
        
        // Visual feedback when entering/exiting melee mode
        if (gameState.player.isMeleeMode && !wasMeleeMode) {
            // Entering melee mode - add enhanced melee tint
            gameState.player.setTint(COMBAT_CONFIG.visual.meleeModeTintColor);
        } else if (!gameState.player.isMeleeMode && wasMeleeMode) {
            // Exiting melee mode - check if due to exhaustion
            const staminaState = staminaSystem.getState();
            if (staminaState.isExhausted) {
                // Add orange/red tint to indicate exhaustion
                gameState.player.setTint(STAMINA_UI_CONFIG.colors.exhaustion);
                // Clear tint after configured delay
                this.scene.time.delayedCall(STAMINA_UI_CONFIG.exhaustionFlashDuration, () => {
                    if (gameState.player && !gameState.player.isMeleeMode) {
                        gameState.player.clearTint();
                    }
                });
            } else {
                // Normal exit - clear tint
                gameState.player.clearTint();
            }
        }
        
        // Check if player is stunned
        if (gameState.player.stunnedUntil && this.scene.time.now < gameState.player.stunnedUntil) {
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
    handleLandMovement(): void {
        if (!gameState.player || !gameState.player.body) return;
        
        const options = getOptions();
        const baseSpeed = options.playerSpeed;
        const sizeConfig = SIZE_CONFIG[playerManager.getPlayerSize()];
        if (!sizeConfig) return;
        
        let speedMultiplier = sizeConfig.speedMultiplier;
        
        // Apply god mode speed multiplier if active
        if (playerStatsSystem.isGodMode()) {
            speedMultiplier *= GOD_MODE_CONFIG.playerSpeedMultiplier;
        }
        
        const body = gameState.player.body;
        
        if (this.wasdKeys.A.isDown || this.cursors.left.isDown) {
            body.setVelocityX(-baseSpeed * speedMultiplier);
            gameState.player!.setFlipX(true);  // Face left
        } else if (this.wasdKeys.D.isDown || this.cursors.right.isDown) {
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
        const options = getOptions();
        const baseSpeed = options.playerSpeed * 0.875; // Slightly slower in water (140/160 ratio)
        const thrustPower = 150; // Vertical thrust power
        const sizeConfig = SIZE_CONFIG[playerManager.getPlayerSize()];
        if (!sizeConfig) return;
        
        let speedMultiplier = sizeConfig.speedMultiplier;
        
        // Apply god mode speed multiplier if active
        if (playerStatsSystem.isGodMode()) {
            speedMultiplier *= GOD_MODE_CONFIG.playerSpeedMultiplier;
        }
        
        const body = gameState.player!.body;
        
        // Horizontal movement
        if (this.wasdKeys.A.isDown || this.cursors.left.isDown) {
            body.setVelocityX(-baseSpeed * speedMultiplier);
            gameState.player!.setFlipX(true);  // Face left
        } else if (this.wasdKeys.D.isDown || this.cursors.right.isDown) {
            body.setVelocityX(baseSpeed * speedMultiplier);
            gameState.player!.setFlipX(false); // Face right
        } else {
            body.setVelocityX(0);
        }
        
        // Vertical thrust controls (W for up, S for down, Space also for up)
        if (this.wasdKeys.W.isDown || this.cursors.up.isDown || this.spaceKey.isDown) {
            // Thrust upward
            const currentVelY = body.velocity.y;
            body.setVelocityY(Math.max(currentVelY - thrustPower * 0.15, -thrustPower));
        } else if (this.wasdKeys.S.isDown || this.cursors.down.isDown) {
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
    }
}
