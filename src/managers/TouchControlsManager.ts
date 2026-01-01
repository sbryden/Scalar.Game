/**
 * Touch Controls Manager
 * Creates and manages on-screen touch controls for iPad and mobile devices
 */
import Phaser from 'phaser';
import gameState from '../utils/gameState';
import { changeSize } from '../player';
import { fireProjectile } from '../projectiles';

export class TouchControlsManager {
    scene: Phaser.Scene;
    private controlsContainer: Phaser.GameObjects.Container | null = null;
    private buttons: Map<string, TouchButton> = new Map();
    private dpad: VirtualDPad | null = null;
    private isUnderwater: boolean = false;
    
    // Button states
    private activeButtons: Set<string> = new Set();
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }
    
    /**
     * Create touch controls UI
     */
    create(isUnderwater: boolean = false): void {
        this.isUnderwater = isUnderwater;
        
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create D-Pad for movement (left side)
        this.dpad = new VirtualDPad(this.scene, 120, height - 120, 100);
        
        // Action buttons (right side)
        const buttonSize = 60;
        const buttonSpacing = 20;
        const rightMargin = 80;
        const bottomMargin = 80;
        
        // Jump/Up button (or Up thrust for underwater)
        const jumpButton = this.createButton(
            width - rightMargin,
            height - bottomMargin - buttonSize - buttonSpacing,
            buttonSize,
            this.isUnderwater ? '↑' : '⇧',
            0x4CAF50,
            () => this.handleJumpPress(),
            () => this.handleJumpRelease()
        );
        this.buttons.set('jump', jumpButton);
        
        // Fire button
        const fireButton = this.createButton(
            width - rightMargin - buttonSize - buttonSpacing,
            height - bottomMargin,
            buttonSize,
            '⚡',
            0xF44336,
            () => this.handleFirePress()
        );
        this.buttons.set('fire', fireButton);
        
        // Down thrust button (underwater only)
        if (this.isUnderwater) {
            const downButton = this.createButton(
                width - rightMargin,
                height - bottomMargin,
                buttonSize,
                '↓',
                0x2196F3,
                () => this.handleDownPress(),
                () => this.handleDownRelease()
            );
            this.buttons.set('down', downButton);
        }
        
        // Size buttons (top right)
        const shrinkButton = this.createButton(
            width - rightMargin - buttonSize - buttonSpacing,
            100,
            buttonSize * 0.8,
            'Q',
            0xFF9800,
            () => this.handleShrinkPress()
        );
        this.buttons.set('shrink', shrinkButton);
        
        const growButton = this.createButton(
            width - rightMargin,
            100,
            buttonSize * 0.8,
            'E',
            0x9C27B0,
            () => this.handleGrowPress()
        );
        this.buttons.set('grow', growButton);
    }
    
    /**
     * Create a touch button
     */
    private createButton(
        x: number,
        y: number,
        size: number,
        label: string,
        color: number,
        onPress: () => void,
        onRelease?: () => void
    ): TouchButton {
        const button = new TouchButton(this.scene, x, y, size, label, color, onPress, onRelease);
        return button;
    }
    
    /**
     * Get current D-Pad direction
     */
    getDirection(): { x: number; y: number } {
        return this.dpad ? this.dpad.getDirection() : { x: 0, y: 0 };
    }
    
    /**
     * Handle jump button press
     */
    private handleJumpPress(): void {
        this.activeButtons.add('jump');
    }
    
    /**
     * Handle jump button release
     */
    private handleJumpRelease(): void {
        this.activeButtons.delete('jump');
    }
    
    /**
     * Handle down button press (underwater)
     */
    private handleDownPress(): void {
        this.activeButtons.add('down');
    }
    
    /**
     * Handle down button release (underwater)
     */
    private handleDownRelease(): void {
        this.activeButtons.delete('down');
    }
    
    /**
     * Handle fire button press
     */
    private handleFirePress(): void {
        if (gameState.player) {
            fireProjectile(gameState.player.scene);
        }
    }
    
    /**
     * Handle shrink button press
     */
    private handleShrinkPress(): void {
        changeSize('smaller');
    }
    
    /**
     * Handle grow button press
     */
    private handleGrowPress(): void {
        changeSize('larger');
    }
    
    /**
     * Check if jump/up is pressed
     */
    isJumpPressed(): boolean {
        return this.activeButtons.has('jump');
    }
    
    /**
     * Check if down is pressed (underwater)
     */
    isDownPressed(): boolean {
        return this.activeButtons.has('down');
    }
    
    /**
     * Update controls (called from scene update)
     */
    update(): void {
        // D-Pad and buttons update themselves
        this.dpad?.update();
        this.buttons.forEach(button => button.update());
    }
    
    /**
     * Clean up touch controls
     */
    destroy(): void {
        this.dpad?.destroy();
        this.buttons.forEach(button => button.destroy());
        this.buttons.clear();
        this.activeButtons.clear();
    }
}

/**
 * Virtual D-Pad for movement
 */
class VirtualDPad {
    private scene: Phaser.Scene;
    private base: Phaser.GameObjects.Circle;
    private stick: Phaser.GameObjects.Circle;
    private centerX: number;
    private centerY: number;
    private radius: number;
    private isDragging: boolean = false;
    private currentDirection: { x: number; y: number } = { x: 0, y: 0 };
    
    constructor(scene: Phaser.Scene, x: number, y: number, radius: number) {
        this.scene = scene;
        this.centerX = x;
        this.centerY = y;
        this.radius = radius;
        
        // Create base
        this.base = this.scene.add.circle(x, y, radius, 0x333333, 0.5);
        this.base.setStrokeStyle(3, 0xffffff, 0.8);
        this.base.setDepth(2000);
        this.base.setScrollFactor(0);
        
        // Create stick
        this.stick = this.scene.add.circle(x, y, radius * 0.4, 0x666666, 0.8);
        this.stick.setStrokeStyle(2, 0xffffff, 0.9);
        this.stick.setDepth(2001);
        this.stick.setScrollFactor(0);
        
        // Make interactive with larger hit area
        // Use world coordinates for hit area (0, 0 in the hitArea means center of the circle)
        this.base.setInteractive(
            new Phaser.Geom.Circle(0, 0, radius * 1.2),
            Phaser.Geom.Circle.Contains
        );
        
        this.setupListeners();
    }
    
    private setupListeners(): void {
        this.base.on('pointerdown', this.handlePointerDown, this);
        this.scene.input.on('pointermove', this.handlePointerMove, this);
        this.scene.input.on('pointerup', this.handlePointerUp, this);
    }
    
    private handlePointerDown(pointer: Phaser.Input.Pointer): void {
        this.isDragging = true;
        this.updateStickPosition(pointer.x, pointer.y);
    }
    
    private handlePointerMove(pointer: Phaser.Input.Pointer): void {
        if (this.isDragging) {
            this.updateStickPosition(pointer.x, pointer.y);
        }
    }
    
    private handlePointerUp(): void {
        this.isDragging = false;
        this.stick.setPosition(this.centerX, this.centerY);
        this.currentDirection = { x: 0, y: 0 };
    }
    
    private updateStickPosition(pointerX: number, pointerY: number): void {
        const dx = pointerX - this.centerX;
        const dy = pointerY - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.radius * 0.6) {
            // Clamp to radius
            const angle = Math.atan2(dy, dx);
            const maxDistance = this.radius * 0.6;
            this.stick.setPosition(
                this.centerX + Math.cos(angle) * maxDistance,
                this.centerY + Math.sin(angle) * maxDistance
            );
            this.currentDirection = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            };
        } else {
            this.stick.setPosition(pointerX, pointerY);
            this.currentDirection = {
                x: distance > 10 ? dx / this.radius : 0,
                y: distance > 10 ? dy / this.radius : 0
            };
        }
    }
    
    getDirection(): { x: number; y: number } {
        return this.currentDirection;
    }
    
    update(): void {
        // Animation or visual feedback could go here
    }
    
    destroy(): void {
        this.scene.input.off('pointermove', this.handlePointerMove, this);
        this.scene.input.off('pointerup', this.handlePointerUp, this);
        this.base.off('pointerdown', this.handlePointerDown, this);
        this.base.destroy();
        this.stick.destroy();
    }
}

/**
 * Touch Button
 */
class TouchButton {
    private scene: Phaser.Scene;
    private button: Phaser.GameObjects.Circle;
    private label: Phaser.GameObjects.Text;
    private isPressed: boolean = false;
    private onPressCallback: () => void;
    private onReleaseCallback?: () => void;
    private normalColor: number;
    
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        size: number,
        labelText: string,
        color: number,
        onPress: () => void,
        onRelease?: () => void
    ) {
        this.scene = scene;
        this.onPressCallback = onPress;
        this.onReleaseCallback = onRelease;
        this.normalColor = color;
        
        // Create button
        this.button = this.scene.add.circle(x, y, size / 2, color, 0.6);
        this.button.setStrokeStyle(3, 0xffffff, 0.9);
        this.button.setDepth(2000);
        this.button.setScrollFactor(0);
        
        // Create label
        this.label = this.scene.add.text(x, y, labelText, {
            fontSize: `${size * 0.5}px`,
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.label.setOrigin(0.5);
        this.label.setDepth(2001);
        this.label.setScrollFactor(0);
        
        // Make interactive with larger hit area (1.5x size for easier touch)
        // Use (0, 0) for hit area center since it's relative to the circle's position
        this.button.setInteractive(
            new Phaser.Geom.Circle(0, 0, size * 0.75),
            Phaser.Geom.Circle.Contains
        );
        
        this.setupListeners();
    }
    
    private setupListeners(): void {
        this.button.on('pointerdown', () => {
            this.isPressed = true;
            this.button.setFillStyle(this.normalColor, 0.9);
            this.button.setScale(0.95);
            this.label.setScale(0.95);
            this.onPressCallback();
        });
        
        this.button.on('pointerup', () => {
            if (this.isPressed) {
                this.isPressed = false;
                this.button.setFillStyle(this.normalColor, 0.6);
                this.button.setScale(1);
                this.label.setScale(1);
                if (this.onReleaseCallback) {
                    this.onReleaseCallback();
                }
            }
        });
        
        this.button.on('pointerout', () => {
            if (this.isPressed) {
                this.isPressed = false;
                this.button.setFillStyle(this.normalColor, 0.6);
                this.button.setScale(1);
                this.label.setScale(1);
                if (this.onReleaseCallback) {
                    this.onReleaseCallback();
                }
            }
        });
    }
    
    update(): void {
        // Could add animations here
    }
    
    destroy(): void {
        this.button.destroy();
        this.label.destroy();
    }
}
