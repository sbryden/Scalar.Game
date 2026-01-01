/**
 * Gesture Detection System
 * Detects swipe gestures for touch controls
 */
import Phaser from 'phaser';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeEvent {
    direction: SwipeDirection;
    distance: number;
    duration: number;
}

export class GestureDetector {
    private scene: Phaser.Scene;
    private startX: number = 0;
    private startY: number = 0;
    private startTime: number = 0;
    private isTracking: boolean = false;
    
    // Swipe thresholds
    private readonly MIN_SWIPE_DISTANCE = 50;
    private readonly MAX_SWIPE_TIME = 500; // milliseconds
    
    // Callbacks
    private onSwipeCallback?: (event: SwipeEvent) => void;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupListeners();
    }
    
    /**
     * Setup touch/pointer listeners
     */
    private setupListeners(): void {
        this.scene.input.on('pointerdown', this.handlePointerDown, this);
        this.scene.input.on('pointerup', this.handlePointerUp, this);
    }
    
    /**
     * Handle pointer down event
     */
    private handlePointerDown(pointer: Phaser.Input.Pointer): void {
        this.startX = pointer.x;
        this.startY = pointer.y;
        this.startTime = Date.now();
        this.isTracking = true;
    }
    
    /**
     * Handle pointer up event
     */
    private handlePointerUp(pointer: Phaser.Input.Pointer): void {
        if (!this.isTracking) return;
        
        const endX = pointer.x;
        const endY = pointer.y;
        const endTime = Date.now();
        
        const deltaX = endX - this.startX;
        const deltaY = endY - this.startY;
        const duration = endTime - this.startTime;
        
        // Check if it's a valid swipe
        if (duration <= this.MAX_SWIPE_TIME) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            
            // Determine if swipe is horizontal or vertical
            if (absX > this.MIN_SWIPE_DISTANCE || absY > this.MIN_SWIPE_DISTANCE) {
                let direction: SwipeDirection;
                let distance: number;
                
                if (absX > absY) {
                    // Horizontal swipe
                    direction = deltaX > 0 ? 'right' : 'left';
                    distance = absX;
                } else {
                    // Vertical swipe
                    direction = deltaY > 0 ? 'down' : 'up';
                    distance = absY;
                }
                
                if (this.onSwipeCallback) {
                    this.onSwipeCallback({ direction, distance, duration });
                }
            }
        }
        
        this.isTracking = false;
    }
    
    /**
     * Set callback for swipe events
     */
    onSwipe(callback: (event: SwipeEvent) => void): void {
        this.onSwipeCallback = callback;
    }
    
    /**
     * Clean up listeners
     */
    destroy(): void {
        this.scene.input.off('pointerdown', this.handlePointerDown, this);
        this.scene.input.off('pointerup', this.handlePointerUp, this);
        this.onSwipeCallback = undefined;
    }
}
