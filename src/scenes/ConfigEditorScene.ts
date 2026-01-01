/**
 * Config Editor Scene
 * Dynamic configuration editor for development builds only
 * Automatically detects and creates input fields for config values
 */
import Phaser from 'phaser';
import * as config from '../config';

interface ConfigValue {
    path: string;
    value: any;
    type: 'number' | 'color';
}

export default class ConfigEditorScene extends Phaser.Scene {
    // Layout constants
    private static readonly HEADER_HEIGHT = 120;
    private static readonly FOOTER_HEIGHT = 150;
    private static readonly LINE_HEIGHT = 50;
    private static readonly START_Y = 20;
    private static readonly LEFT_MARGIN = 50;
    private static readonly INPUT_OFFSET_Y = 15;
    private static readonly SCROLL_SPEED = 30;
    
    private configValues: ConfigValue[] = [];
    private scrollContainer!: Phaser.GameObjects.Container;
    private inputElements: Map<string, HTMLInputElement> = new Map();
    private scrollY: number = 0;
    private maxScrollY: number = 0;
    
    constructor() {
        super({ key: 'ConfigEditorScene' });
    }
    
    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
        // Title
        const title = this.add.text(width / 2, 40, 'CONFIG EDITOR', {
            fontSize: '36px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ff8800',
            stroke: '#ffffff',
            strokeThickness: 2
        });
        title.setOrigin(0.5);
        title.setDepth(1000);
        
        // Dev mode indicator
        const devIndicator = this.add.text(width / 2, 80, '[DEVELOPMENT BUILD ONLY]', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffaa00'
        });
        devIndicator.setOrigin(0.5);
        devIndicator.setDepth(1000);
        
        // Parse config values
        this.parseConfig();
        
        // Create scrollable container
        this.scrollContainer = this.add.container(0, 120);
        
        // Create input fields
        this.createInputFields();
        
        // Add scroll support
        this.setupScrolling();
        
        // Create buttons
        this.createButtons(width, height);
        
        // Instructions
        const instructions = this.add.text(width / 2, height - 120, 'Changes will apply to the next game session', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        instructions.setOrigin(0.5);
        instructions.setAlpha(0.6);
        instructions.setDepth(1000);
    }
    
    parseConfig(): void {
        this.configValues = [];
        
        // Get all exported values from config
        const configEntries = Object.entries(config);
        
        for (const [key, value] of configEntries) {
            this.parseValue(key, value);
        }
    }
    
    parseValue(fullPath: string, value: any): void {
        if (typeof value === 'number') {
            // Check if it's a color: numeric hex-like value with 'color' in the path
            const isColor = value >= 0x1000 && /color/i.test(fullPath);
            this.configValues.push({
                path: fullPath,
                value: value,
                type: isColor ? 'color' : 'number'
            });
        } else if (typeof value === 'object' && value !== null) {
            // Recursively parse nested objects
            for (const [subKey, subValue] of Object.entries(value)) {
                this.parseValue(`${fullPath}.${subKey}`, subValue);
            }
        }
    }
    
    createInputFields(): void {
        const width = this.cameras.main.width;
        
        this.configValues.forEach((configValue, index) => {
            const y = ConfigEditorScene.START_Y + index * ConfigEditorScene.LINE_HEIGHT;
            
            // Label
            const label = this.add.text(ConfigEditorScene.LEFT_MARGIN, y, configValue.path, {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff'
            });
            label.setOrigin(0, 0.5);
            this.scrollContainer.add(label);
            
            // Get current value from storage or use default
            const storedValue = this.getStoredValue(configValue.path);
            const currentValue = storedValue !== null ? storedValue : configValue.value;
            
            // Create HTML input element
            const input = document.createElement('input');
            input.style.position = 'absolute';
            input.style.left = `${width - 300}px`;
            input.style.top = `${ConfigEditorScene.HEADER_HEIGHT + y - ConfigEditorScene.INPUT_OFFSET_Y}px`;
            input.style.width = '200px';
            input.style.height = '30px';
            input.style.fontSize = '14px';
            input.style.padding = '5px';
            input.style.backgroundColor = '#2c3e50';
            input.style.color = '#ffffff';
            input.style.border = '2px solid #3498db';
            input.style.borderRadius = '4px';
            input.dataset.configPath = configValue.path;
            
            if (configValue.type === 'color') {
                input.type = 'text';
                // Normalize to a 6-digit RGB hex string (RRGGBB), zero-padded for values < 0x100000.
                const hexValue = currentValue >= 0 ? currentValue.toString(16).toUpperCase().padStart(6, '0') : '000000';
                input.value = '0x' + hexValue;
                input.placeholder = '0xFFFFFF';
            } else {
                input.type = 'number';
                input.value = currentValue.toString();
                // Determine step based on decimal places in original value
                input.step = this.getStepValue(configValue.value);
            }
            
            document.body.appendChild(input);
            this.inputElements.set(configValue.path, input);
        });
        
        // Calculate max scroll
        this.maxScrollY = Math.max(0, (this.configValues.length * ConfigEditorScene.LINE_HEIGHT) - 
            (this.cameras.main.height - ConfigEditorScene.HEADER_HEIGHT - ConfigEditorScene.FOOTER_HEIGHT));
    }
    
    /**
     * Determine appropriate step value for number inputs based on the original value
     */
    private getStepValue(value: number): string {
        if (value === 0) return '0.1';
        
        const absValue = Math.abs(value);
        if (absValue < 1) return '0.1';
        if (absValue < 10) return '0.5';
        return '1';
    }
    
    setupScrolling(): void {
        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
            // Prevent default browser scrolling
            if (pointer.event) {
                pointer.event.preventDefault();
            }
            
            this.scrollY = Phaser.Math.Clamp(
                this.scrollY + (deltaY > 0 ? ConfigEditorScene.SCROLL_SPEED : -ConfigEditorScene.SCROLL_SPEED),
                0,
                this.maxScrollY
            );
            this.updateScrollPosition();
        });
    }
    
    updateScrollPosition(): void {
        this.scrollContainer.y = ConfigEditorScene.HEADER_HEIGHT - this.scrollY;
        
        // Update HTML input positions
        this.inputElements.forEach((input, path) => {
            const configValueIndex = this.configValues.findIndex(cv => cv.path === path);
            if (configValueIndex >= 0) {
                const baseY = ConfigEditorScene.HEADER_HEIGHT + ConfigEditorScene.START_Y + 
                             configValueIndex * ConfigEditorScene.LINE_HEIGHT - ConfigEditorScene.INPUT_OFFSET_Y;
                input.style.top = `${baseY - this.scrollY}px`;
                
                // Hide inputs that are out of view (above header or below footer)
                const y = baseY - this.scrollY;
                const isVisible = y >= ConfigEditorScene.HEADER_HEIGHT && 
                                y <= this.cameras.main.height - ConfigEditorScene.FOOTER_HEIGHT;
                input.style.display = isVisible ? 'block' : 'none';
            }
        });
    }
    
    createButtons(width: number, height: number): void {
        const buttonY = height - 70;
        
        // Save button
        this.createButton(width / 2 - 110, buttonY, 'SAVE', 0x27ae60, () => {
            this.saveConfig();
        });
        
        // Reset button
        this.createButton(width / 2 + 110, buttonY, 'RESET', 0xe74c3c, () => {
            this.resetConfig();
        });
        
        // Back button (top right)
        this.createButton(width - 100, 40, 'BACK', 0x95a5a6, () => {
            this.cleanup();
            this.scene.start('MenuScene');
        });
    }
    
    createButton(x: number, y: number, text: string, color: number, callback: () => void): void {
        const buttonWidth = 120;
        const buttonHeight = 50;
        
        const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, color);
        const buttonText = this.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        buttonText.setOrigin(0.5);
        button.setDepth(1000);
        buttonText.setDepth(1001);
        
        button.setInteractive({ useHandCursor: true });
        button.on('pointerover', () => {
            button.setScale(1.05);
            buttonText.setScale(1.05);
        });
        button.on('pointerout', () => {
            button.setScale(1);
            buttonText.setScale(1);
        });
        button.on('pointerdown', callback);
    }
    
    saveConfig(): void {
        const configData: Record<string, number> = {};
        
        this.inputElements.forEach((input, path) => {
            let value: number;
            
            if (input.type === 'number') {
                value = parseFloat(input.value);
            } else {
                // Parse hex color value with validation
                const hexStr = input.value.replace(/^0x/i, '');
                
                // Validate hex string format
                if (!/^[0-9A-Fa-f]{1,6}$/.test(hexStr)) {
                    console.warn(`Invalid hex color format for ${path}: ${input.value}`);
                    return;
                }
                
                value = parseInt(hexStr, 16);
                
                // Validate color range (0x000000 to 0xFFFFFF)
                if (value < 0 || value > 0xFFFFFF) {
                    console.warn(`Color value out of range for ${path}: 0x${hexStr}`);
                    return;
                }
            }
            
            // Only save valid numbers
            if (!isNaN(value)) {
                configData[path] = value;
            }
        });
        
        // Store in localStorage
        localStorage.setItem('gameConfig', JSON.stringify(configData));
        
        // Visual feedback
        this.showFeedbackMessage('Configuration Saved!', '#00ff88', 1500);
    }
    
    /**
     * Show a temporary feedback message to the user
     */
    private showFeedbackMessage(message: string, color: string, duration: number): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const feedbackText = this.add.text(width / 2, height / 2, message, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: color,
            stroke: '#ffffff',
            strokeThickness: 3
        });
        feedbackText.setOrigin(0.5);
        feedbackText.setDepth(2000);
        
        this.time.delayedCall(duration, () => {
            feedbackText.destroy();
        });
    }
    
    resetConfig(): void {
        // Clear stored config
        localStorage.removeItem('gameConfig');
        
        // Reset input values to defaults
        this.configValues.forEach(configValue => {
            const input = this.inputElements.get(configValue.path);
            if (input) {
                if (configValue.type === 'color') {
                    const hexValue = configValue.value >= 0 ? configValue.value.toString(16).toUpperCase().padStart(6, '0') : '000000';
                    input.value = '0x' + hexValue;
                } else {
                    input.value = configValue.value.toString();
                }
            }
        });
        
        // Visual feedback
        this.showFeedbackMessage('Configuration Reset!', '#ff8800', 1500);
    }
    
    getStoredValue(path: string): number | null {
        try {
            const stored = localStorage.getItem('gameConfig');
            if (stored) {
                const configData = JSON.parse(stored);
                return configData[path] ?? null;
            }
        } catch (e) {
            console.error('Error reading stored config:', e);
        }
        return null;
    }
    
    cleanup(): void {
        // Remove all HTML input elements
        this.inputElements.forEach(input => {
            input.remove();
        });
        this.inputElements.clear();
    }
    
    shutdown(): void {
        this.cleanup();
    }
    
    destroy(): void {
        this.cleanup();
        super.destroy();
    }
}
