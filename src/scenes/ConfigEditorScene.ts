/**
 * Config Editor Scene
 * Dynamic configuration editor for development builds only
 * Automatically detects and creates input fields for config values
 */
import Phaser from 'phaser';
import * as config from '../config';

interface ConfigValue {
    path: string;
    key: string;
    value: any;
    type: 'number' | 'string' | 'object' | 'color';
}

export default class ConfigEditorScene extends Phaser.Scene {
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
            this.parseValue(key, value, key);
        }
    }
    
    parseValue(fullPath: string, value: any, key: string): void {
        if (typeof value === 'number') {
            // Check if it's a color (hex number > 0x1000)
            const isColor = value >= 0x100000 || (fullPath.toLowerCase().includes('color') && value >= 0x0);
            this.configValues.push({
                path: fullPath,
                key: key,
                value: value,
                type: isColor ? 'color' : 'number'
            });
        } else if (typeof value === 'object' && value !== null) {
            // Recursively parse nested objects
            for (const [subKey, subValue] of Object.entries(value)) {
                this.parseValue(`${fullPath}.${subKey}`, subValue, subKey);
            }
        }
    }
    
    createInputFields(): void {
        const startY = 20;
        const lineHeight = 50;
        const leftMargin = 50;
        const width = this.cameras.main.width;
        
        this.configValues.forEach((configValue, index) => {
            const y = startY + index * lineHeight;
            
            // Label
            const label = this.add.text(leftMargin, y, configValue.path, {
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
            input.style.top = `${120 + y - 15}px`;
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
                input.value = '0x' + currentValue.toString(16).toUpperCase().padStart(6, '0');
                input.placeholder = '0xFFFFFF';
            } else {
                input.type = 'number';
                input.value = currentValue.toString();
                input.step = configValue.value < 1 && configValue.value > 0 ? '0.1' : '1';
            }
            
            document.body.appendChild(input);
            this.inputElements.set(configValue.path, input);
        });
        
        // Calculate max scroll
        this.maxScrollY = Math.max(0, (this.configValues.length * lineHeight) - (this.cameras.main.height - 250));
    }
    
    setupScrolling(): void {
        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
            const scrollSpeed = 30;
            this.scrollY = Phaser.Math.Clamp(
                this.scrollY + (deltaY > 0 ? scrollSpeed : -scrollSpeed),
                0,
                this.maxScrollY
            );
            this.updateScrollPosition();
        });
    }
    
    updateScrollPosition(): void {
        this.scrollContainer.y = 120 - this.scrollY;
        
        // Update HTML input positions
        this.inputElements.forEach((input, path) => {
            const baseY = parseInt(input.style.top.replace('px', ''));
            const originalY = baseY + this.scrollY;
            input.style.top = `${originalY - this.scrollY}px`;
            
            // Hide inputs that are out of view
            const y = parseInt(input.style.top.replace('px', ''));
            input.style.display = (y < 100 || y > this.cameras.main.height - 150) ? 'none' : 'block';
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
        const configData: Record<string, any> = {};
        
        this.inputElements.forEach((input, path) => {
            const value = input.type === 'number' 
                ? parseFloat(input.value) 
                : parseInt(input.value, 16);
            
            if (!isNaN(value)) {
                configData[path] = value;
            }
        });
        
        // Store in localStorage
        localStorage.setItem('gameConfig', JSON.stringify(configData));
        
        // Visual feedback
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const savedText = this.add.text(width / 2, height / 2, 'Configuration Saved!', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#00ff88',
            stroke: '#ffffff',
            strokeThickness: 3
        });
        savedText.setOrigin(0.5);
        savedText.setDepth(2000);
        
        this.time.delayedCall(1500, () => {
            savedText.destroy();
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
                    input.value = '0x' + configValue.value.toString(16).toUpperCase().padStart(6, '0');
                } else {
                    input.value = configValue.value.toString();
                }
            }
        });
        
        // Visual feedback
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const resetText = this.add.text(width / 2, height / 2, 'Configuration Reset!', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ff8800',
            stroke: '#ffffff',
            strokeThickness: 3
        });
        resetText.setOrigin(0.5);
        resetText.setDepth(2000);
        
        this.time.delayedCall(1500, () => {
            resetText.destroy();
        });
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
}
