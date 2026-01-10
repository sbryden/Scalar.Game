/**
 * Options Scene
 * Allows players to customize game parameters
 */
import Phaser from 'phaser';
import { getOptions, saveOptions, resetOptions, getDefaultOptions, type GameOptions } from '../config/options';

export default class OptionsScene extends Phaser.Scene {
    private options!: GameOptions;
    private sliders: Map<keyof GameOptions, { slider: Phaser.GameObjects.Rectangle, valueText: Phaser.GameObjects.Text, track: Phaser.GameObjects.Rectangle }> = new Map();
    private isDragging: Map<keyof GameOptions, boolean> = new Map();
    
    constructor() {
        super({ key: 'OptionsScene' });
    }
    
    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Load current options
        this.options = { ...getOptions() };
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
        // Title
        const title = this.add.text(width / 2, 40, 'HACKS', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#00ff88',
            stroke: '#ffffff',
            strokeThickness: 3
        });
        title.setOrigin(0.5);
        
        // Create scrollable container for options
        const startY = 100;
        const spacing = 50;
        let currentY = startY;
        
        // Define option configurations
        const optionConfigs: Array<{ key: keyof GameOptions, label: string, min: number, max: number, step: number }> = [
            { key: 'playerSpeed', label: 'Player Speed', min: 80, max: 400, step: 10 },
            { key: 'playerJumpHeight', label: 'Jump Height', min: 100, max: 400, step: 10 },
            { key: 'playerProjectileSpeed', label: 'Projectile Speed', min: 150, max: 600, step: 10 },
            { key: 'playerProjectileDamage', label: 'Projectile Damage', min: 5, max: 50, step: 1 },
            { key: 'landGravity', label: 'Land Gravity', min: 100, max: 800, step: 10 },
            { key: 'waterGravity', label: 'Water Gravity', min: 20, max: 300, step: 10 },
            { key: 'microLandGravity', label: 'Micro Land Gravity', min: 50, max: 400, step: 10 },
            { key: 'microWaterGravity', label: 'Micro Water Gravity', min: 10, max: 150, step: 5 },
            { key: 'macroLandGravity', label: 'Macro Land Gravity', min: 200, max: 1000, step: 10 },
            { key: 'macroWaterGravity', label: 'Macro Water Gravity', min: 30, max: 200, step: 5 },
            { key: 'startingHP', label: 'Starting HP', min: 50, max: 500, step: 10 }
        ];
        
        // Create sliders for each option
        optionConfigs.forEach(config => {
            this.createSlider(width / 2, currentY, config.key, config.label, config.min, config.max, config.step);
            currentY += spacing;
        });
        
        // Buttons at bottom
        const buttonY = height - 80;
        
        // Save button
        this.createButton(width / 2 - 120, buttonY, 'SAVE', 0x27ae60, () => {
            saveOptions(this.options);
            // Show confirmation briefly
            const confirm = this.add.text(width / 2, buttonY - 50, 'Settings Saved!', {
                fontSize: '20px',
                fontFamily: 'Arial, sans-serif',
                color: '#00ff88'
            });
            confirm.setOrigin(0.5);
            this.time.delayedCall(1000, () => confirm.destroy());
        });
        
        // Reset button
        this.createButton(width / 2, buttonY, 'RESET', 0xe67e22, () => {
            this.options = resetOptions();
            this.updateAllSliders();
            // Show confirmation briefly
            const confirm = this.add.text(width / 2, buttonY - 50, 'Reset to Defaults!', {
                fontSize: '20px',
                fontFamily: 'Arial, sans-serif',
                color: '#ff9500'
            });
            confirm.setOrigin(0.5);
            this.time.delayedCall(1000, () => confirm.destroy());
        });
        
        // Back button
        this.createButton(width / 2 + 120, buttonY, 'BACK', 0x3498db, () => {
            this.scene.start('MenuScene');
        });
    }
    
    private createSlider(
        centerX: number, 
        y: number, 
        key: keyof GameOptions, 
        label: string, 
        min: number, 
        max: number, 
        step: number
    ): void {
        const trackWidth = 300;
        const trackHeight = 8;
        const sliderSize = 20;
        
        // Label
        const labelText = this.add.text(centerX - trackWidth / 2 - 10, y, label, {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        labelText.setOrigin(1, 0.5);
        
        // Track
        const track = this.add.rectangle(centerX, y, trackWidth, trackHeight, 0x34495e);
        
        // Value text
        const valueText = this.add.text(centerX + trackWidth / 2 + 10, y, this.options[key].toString(), {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#00ff88',
            fontStyle: 'bold'
        });
        valueText.setOrigin(0, 0.5);
        
        // Calculate slider position based on current value
        const normalizedValue = (this.options[key] - min) / (max - min);
        const sliderX = centerX - trackWidth / 2 + normalizedValue * trackWidth;
        
        // Slider handle
        const slider = this.add.rectangle(sliderX, y, sliderSize, sliderSize, 0x3498db);
        slider.setInteractive({ useHandCursor: true, draggable: true });
        
        // Store references
        this.sliders.set(key, { slider, valueText, track });
        this.isDragging.set(key, false);
        
        // Drag events
        slider.on('pointerover', () => {
            slider.setFillStyle(0x5dade2);
        });
        
        slider.on('pointerout', () => {
            if (!this.isDragging.get(key)) {
                slider.setFillStyle(0x3498db);
            }
        });
        
        slider.on('dragstart', () => {
            this.isDragging.set(key, true);
            slider.setFillStyle(0x5dade2);
        });
        
        slider.on('drag', (pointer: Phaser.Input.Pointer) => {
            // Calculate new position
            const trackLeft = centerX - trackWidth / 2;
            const trackRight = centerX + trackWidth / 2;
            const newX = Phaser.Math.Clamp(pointer.x, trackLeft, trackRight);
            
            slider.x = newX;
            
            // Calculate new value
            const normalizedValue = (newX - trackLeft) / trackWidth;
            let newValue = min + normalizedValue * (max - min);
            
            // Snap to step
            newValue = Math.round(newValue / step) * step;
            newValue = Phaser.Math.Clamp(newValue, min, max);
            
            // Update option and display
            this.options[key] = newValue as any;
            valueText.setText(newValue.toString());
        });
        
        slider.on('dragend', () => {
            this.isDragging.set(key, false);
            slider.setFillStyle(0x3498db);
        });
    }
    
    private updateAllSliders(): void {
        this.sliders.forEach((sliderData, key) => {
            const value = this.options[key];
            sliderData.valueText.setText(value.toString());
            
            // Update slider position based on the option config
            // We need to recalculate min/max for proper positioning
            // For now, just update the text - proper implementation would store min/max
            // This is a simplified version
        });
    }
    
    private createButton(
        x: number, 
        y: number, 
        text: string, 
        color: number, 
        onClick: () => void
    ): void {
        const buttonWidth = 100;
        const buttonHeight = 40;
        
        const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, color);
        const buttonText = this.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        buttonText.setOrigin(0.5);
        
        button.setInteractive({ useHandCursor: true });
        
        button.on('pointerover', () => {
            button.setScale(1.05);
            buttonText.setScale(1.05);
        });
        
        button.on('pointerout', () => {
            button.setScale(1);
            buttonText.setScale(1);
        });
        
        button.on('pointerdown', onClick);
    }
}
