/**
 * Menu Scene
 * Main menu with title, difficulty selection, and start button
 */
import Phaser from 'phaser';
import gameState from '../utils/GameContext';
import playerStatsSystem from '../systems/PlayerStatsSystem';
import stageProgressionSystem from '../systems/StageProgressionSystem';
import stageStatsTracker from '../systems/StageStatsTracker';
import { BUILD_NUMBER } from '../buildInfo';

export default class MenuScene extends Phaser.Scene {
    selectedDifficulty!: string;
    selectedEnvironment!: string;
    bossMode!: boolean;
    godMode!: boolean;
    dropdownOpen!: boolean;
    environmentDropdownOpen!: boolean;
    dropdownContainer!: Phaser.GameObjects.Container;
    dropdownBox!: Phaser.GameObjects.Rectangle;
    selectedText!: Phaser.GameObjects.Text;
    dropdownArrow!: Phaser.GameObjects.Text;
    optionsContainer!: Phaser.GameObjects.Container;
    optionElements!: Array<{ bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }>;
    environmentDropdownContainer!: Phaser.GameObjects.Container;
    environmentDropdownBox!: Phaser.GameObjects.Rectangle;
    environmentSelectedText!: Phaser.GameObjects.Text;
    environmentDropdownArrow!: Phaser.GameObjects.Text;
    environmentOptionsContainer!: Phaser.GameObjects.Container;
    environmentOptionElements!: Array<{ bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }>;

    private static readonly MENU_PREFS_STORAGE_KEY = 'scalar_game_menu_prefs';

    constructor() {
        super({ key: 'MenuScene' });
        this.selectedDifficulty = 'normal';
        this.selectedEnvironment = 'land';
        this.bossMode = false;
        this.godMode = false;
        this.dropdownOpen = false;
        this.environmentDropdownOpen = false;
    }
    
    create(): void {
        // Restore last-used selections (difficulty/environment/boss/god) so returning
        // from Hacks doesn't wipe menu state.
        this.loadMenuPreferences();
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background with version-based color
        const versionColor = this.getVersionColor(BUILD_NUMBER);
        this.add.rectangle(width / 2, height / 2, width, height, versionColor);
        
        // Add secure robot image on the right side
        const robot = this.add.image(width * 0.8, height / 2, 'secure_robot');
        robot.setScale(0.75); // Adjust scale as needed
        robot.setAlpha(0.8); // Make it semi-transparent for background effect
        
        // Title
        const title = this.add.text(width / 2, 150, 'SCALAR', {
            fontSize: '72px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#00ff88',
            stroke: '#ffffff',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        
        // Subtitle
        const subtitle = this.add.text(width / 2, 230, 'Size-Shifting Adventure', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        subtitle.setOrigin(0.5);
        subtitle.setAlpha(0.8);
        
        // Difficulty label
        const difficultyLabel = this.add.text(width / 2, 300, 'SELECT DIFFICULTY', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        difficultyLabel.setOrigin(0.5);
        
        // Create difficulty dropdown
        this.createDifficultyDropdown(width / 2, 345);
        
        // Environment label
        const environmentLabel = this.add.text(width / 2, 420, 'SELECT ENVIRONMENT', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        environmentLabel.setOrigin(0.5);
        
        // Create environment dropdown
        this.createEnvironmentDropdown(width / 2, 465);
        
        // Start button (moved up slightly)
        this.createStartButton(width / 2, 545);
        
        // Boss Mode checkbox
        this.createBossModeCheckbox(width / 2, 600);
        
        // God Mode checkbox
        this.createGodModeCheckbox(width / 2, 630);
        
        // Hacks button (bottom right, below robot image)
        this.createOptionsButton(width * 0.8, height - 60);
        
        // Instructions
        const instructions = this.add.text(width / 2, 675, 'Q/E - Change Size  |  A/D - Move  |  SPACE - Jump  |  F/K - Fire', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        instructions.setOrigin(0.5);
        instructions.setAlpha(0.6);
        
        // Build number
        const buildNumber = this.add.text(width / 2, 705, `Build: ${BUILD_NUMBER}`, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888'
        });
        buildNumber.setOrigin(0.5);
        buildNumber.setAlpha(0.5);
    }
    
    /**
     * Generate a subtle color tint based on version string
     * Returns a color with reduced saturation for subtle background effect
     */
    getVersionColor(version: string): number {
        // Create a simple hash from the version string
        let hash = 0;
        for (let i = 0; i < version.length; i++) {
            hash = ((hash << 5) - hash) + version.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Use hash to generate hue (0-360 degrees)
        const hue = Math.abs(hash) % 360;
        
        // Low saturation (15-25%) and dark value (20-30%) for subtle tint
        const saturation = 15 + (Math.abs(hash >> 8) % 10);
        const value = 20 + (Math.abs(hash >> 16) % 10);
        
        // Convert HSV to RGB
        const c = (value / 100) * (saturation / 100);
        const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
        const m = (value / 100) - c;
        
        let r = 0, g = 0, b = 0;
        if (hue >= 0 && hue < 60) { r = c; g = x; b = 0; }
        else if (hue >= 60 && hue < 120) { r = x; g = c; b = 0; }
        else if (hue >= 120 && hue < 180) { r = 0; g = c; b = x; }
        else if (hue >= 180 && hue < 240) { r = 0; g = x; b = c; }
        else if (hue >= 240 && hue < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        // Convert to 0-255 range
        const red = Math.round((r + m) * 255);
        const green = Math.round((g + m) * 255);
        const blue = Math.round((b + m) * 255);
        
        // Return as hex color
        return (red << 16) | (green << 8) | blue;
    }
    
    createDifficultyDropdown(centerX: number, y: number): void {
        const dropdownWidth = 250;
        const dropdownHeight = 50;
        const optionHeight = 45;
        
        // Container for dropdown
        this.dropdownContainer = this.add.container(centerX, y);
        
        // Main dropdown box
        this.dropdownBox = this.add.rectangle(0, 0, dropdownWidth, dropdownHeight, 0x2c3e50);
        this.dropdownBox.setStrokeStyle(2, 0x3498db);
        
        // Selected text
        const selectedDifficultyLabel = this.getDifficultyLabel(this.selectedDifficulty);
        this.selectedText = this.add.text(-dropdownWidth / 2 + 15, 0, selectedDifficultyLabel, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        this.selectedText.setOrigin(0, 0.5);
        
        // Arrow indicator
        this.dropdownArrow = this.add.text(dropdownWidth / 2 - 15, 0, '▼', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        this.dropdownArrow.setOrigin(1, 0.5);
        
        // Options container (hidden by default)
        // Position it relative to the dropdown position, not as a child of dropdownContainer
        this.optionsContainer = this.add.container(centerX, y + dropdownHeight / 2 + 5);
        this.optionsContainer.setVisible(false);
        this.optionsContainer.setDepth(200); // Higher depth to appear above environment dropdown
        
        // Create options - 4 difficulty levels
        const options = [
            { value: 'easy', label: 'Easy' },
            { value: 'normal', label: 'Normal' },
            { value: 'hard', label: 'Hard' },
            { value: 'brutal', label: 'Brutal' }
        ];
        
        this.optionElements = [];
        options.forEach((option, index) => {
            const optionY = index * optionHeight;
            
            // Option background
            const optionBg = this.add.rectangle(0, optionY + optionHeight / 2, dropdownWidth, optionHeight, 0x34495e);
            optionBg.setStrokeStyle(1, 0x2c3e50);
            
            // Option text
            const optionText = this.add.text(-dropdownWidth / 2 + 15, optionY + optionHeight / 2, option.label, {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff'
            });
            optionText.setOrigin(0, 0.5);
            
            // Make interactive
            optionBg.setInteractive({ useHandCursor: true });
            optionBg.on('pointerover', () => {
                optionBg.setFillStyle(0x3498db);
            });
            optionBg.on('pointerout', () => {
                optionBg.setFillStyle(0x34495e);
            });
            optionBg.on('pointerdown', () => {
                this.selectOption(option.value, option.label);
            });
            
            this.optionsContainer.add([optionBg, optionText]);
            this.optionElements.push({ bg: optionBg, text: optionText });
        });
        
        // Make main dropdown interactive
        this.dropdownBox.setInteractive({ useHandCursor: true });
        this.dropdownBox.on('pointerover', () => {
            this.dropdownBox.setStrokeStyle(2, 0x5dade2);
        });
        this.dropdownBox.on('pointerout', () => {
            this.dropdownBox.setStrokeStyle(2, 0x3498db);
        });
        this.dropdownBox.on('pointerdown', () => {
            this.toggleDropdown();
        });
        
        // Add elements to container (not including optionsContainer as it's positioned independently)
        this.dropdownContainer.add([this.dropdownBox, this.selectedText, this.dropdownArrow]);
        
        // Set depth to ensure dropdown appears on top
        this.dropdownContainer.setDepth(100);
    }
    
    toggleDropdown(): void {
        this.dropdownOpen = !this.dropdownOpen;
        this.optionsContainer.setVisible(this.dropdownOpen);
        this.dropdownArrow.setText(this.dropdownOpen ? '▲' : '▼');
    }
    
    selectOption(value: string, label: string): void {
        this.selectedDifficulty = value;
        this.selectedText.setText(label);
        this.saveMenuPreferences();
        this.toggleDropdown();
    }
    
    createEnvironmentDropdown(centerX: number, y: number): void {
        const dropdownWidth = 250;
        const dropdownHeight = 50;
        const optionHeight = 45;
        
        // Container for dropdown
        this.environmentDropdownContainer = this.add.container(centerX, y);
        
        // Main dropdown box
        this.environmentDropdownBox = this.add.rectangle(0, 0, dropdownWidth, dropdownHeight, 0x2c3e50);
        this.environmentDropdownBox.setStrokeStyle(2, 0x3498db);
        
        // Selected text
        const selectedEnvironmentLabel = this.getEnvironmentLabel(this.selectedEnvironment);
        this.environmentSelectedText = this.add.text(-dropdownWidth / 2 + 15, 0, selectedEnvironmentLabel, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        this.environmentSelectedText.setOrigin(0, 0.5);
        
        // Arrow indicator
        this.environmentDropdownArrow = this.add.text(dropdownWidth / 2 - 15, 0, '▼', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        this.environmentDropdownArrow.setOrigin(1, 0.5);
        
        // Options container (hidden by default)
        this.environmentOptionsContainer = this.add.container(0, dropdownHeight / 2 + 5);
        this.environmentOptionsContainer.setVisible(false);
        
        // Create options
        const options = [
            { value: 'land', label: 'Land' },
            { value: 'water', label: 'Water' },
            { value: 'air', label: 'Air (Coming Soon)', disabled: true }
        ];
        
        this.environmentOptionElements = [];
        options.forEach((option, index) => {
            const optionY = index * optionHeight;
            
            // Option background
            const optionBg = this.add.rectangle(0, optionY + optionHeight / 2, dropdownWidth, optionHeight, 0x34495e);
            optionBg.setStrokeStyle(1, 0x2c3e50);
            
            // Option text
            const optionText = this.add.text(-dropdownWidth / 2 + 15, optionY + optionHeight / 2, option.label, {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: option.disabled ? '#888888' : '#ffffff'
            });
            optionText.setOrigin(0, 0.5);
            
            if (!option.disabled) {
                // Make interactive
                optionBg.setInteractive({ useHandCursor: true });
                optionBg.on('pointerover', () => {
                    optionBg.setFillStyle(0x3498db);
                });
                optionBg.on('pointerout', () => {
                    optionBg.setFillStyle(0x34495e);
                });
                optionBg.on('pointerdown', () => {
                    this.selectEnvironmentOption(option.value, option.label);
                });
            }
            
            this.environmentOptionsContainer.add([optionBg, optionText]);
            this.environmentOptionElements.push({ bg: optionBg, text: optionText });
        });
        
        // Make main dropdown interactive
        this.environmentDropdownBox.setInteractive({ useHandCursor: true });
        this.environmentDropdownBox.on('pointerover', () => {
            this.environmentDropdownBox.setStrokeStyle(2, 0x5dade2);
        });
        this.environmentDropdownBox.on('pointerout', () => {
            this.environmentDropdownBox.setStrokeStyle(2, 0x3498db);
        });
        this.environmentDropdownBox.on('pointerdown', () => {
            this.toggleEnvironmentDropdown();
        });
        
        // Add elements to container
        this.environmentDropdownContainer.add([
            this.environmentDropdownBox,
            this.environmentSelectedText,
            this.environmentDropdownArrow,
            this.environmentOptionsContainer
        ]);
        
        // Set depth to ensure dropdown appears on top
        this.environmentDropdownContainer.setDepth(100);
    }
    
    toggleEnvironmentDropdown(): void {
        this.environmentDropdownOpen = !this.environmentDropdownOpen;
        this.environmentOptionsContainer.setVisible(this.environmentDropdownOpen);
        this.environmentDropdownArrow.setText(this.environmentDropdownOpen ? '▲' : '▼');
    }
    
    selectEnvironmentOption(value: string, label: string): void {
        this.selectedEnvironment = value;
        this.environmentSelectedText.setText(label);
        this.saveMenuPreferences();
        this.toggleEnvironmentDropdown();
    }

    createBossModeCheckbox(centerX: number, y: number): void {
        const checkboxSize = 24;
        const spacing = 10;
        
        // Checkbox background
        const checkbox = this.add.rectangle(centerX - 80, y, checkboxSize, checkboxSize, 0x2c3e50);
        checkbox.setStrokeStyle(2, 0x3498db);
        checkbox.setInteractive({ useHandCursor: true });
        
        // Checkmark (initially hidden)
        const checkmark = this.add.text(centerX - 80, y, '✓', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#00ff88',
            fontStyle: 'bold'
        });
        checkmark.setOrigin(0.5);
        checkmark.setVisible(this.bossMode);
        
        // Label
        const label = this.add.text(centerX - 80 + checkboxSize / 2 + spacing, y, 'Boss Mode', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        label.setOrigin(0, 0.5);
        
        // Toggle functionality
        checkbox.on('pointerover', () => {
            checkbox.setStrokeStyle(2, 0x5dade2);
        });
        checkbox.on('pointerout', () => {
            checkbox.setStrokeStyle(2, 0x3498db);
        });
        checkbox.on('pointerdown', () => {
            this.bossMode = !this.bossMode;
            checkmark.setVisible(this.bossMode);
            this.saveMenuPreferences();
        });
    }
    
    createGodModeCheckbox(centerX: number, y: number): void {
        const checkboxSize = 24;
        const spacing = 10;
        
        // Checkbox background
        const checkbox = this.add.rectangle(centerX - 80, y, checkboxSize, checkboxSize, 0x2c3e50);
        checkbox.setStrokeStyle(2, 0x3498db);
        checkbox.setInteractive({ useHandCursor: true });
        
        // Checkmark (initially hidden)
        const checkmark = this.add.text(centerX - 80, y, '✓', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#00ff88',
            fontStyle: 'bold'
        });
        checkmark.setOrigin(0.5);
        checkmark.setVisible(this.godMode);
        
        // Label
        const label = this.add.text(centerX - 80 + checkboxSize / 2 + spacing, y, 'God Mode', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        label.setOrigin(0, 0.5);
        
        // Toggle functionality
        checkbox.on('pointerover', () => {
            checkbox.setStrokeStyle(2, 0x5dade2);
        });
        checkbox.on('pointerout', () => {
            checkbox.setStrokeStyle(2, 0x3498db);
        });
        checkbox.on('pointerdown', () => {
            this.godMode = !this.godMode;
            checkmark.setVisible(this.godMode);
            this.saveMenuPreferences();
        });
    }
    
    createStartButton(centerX: number, y: number): void {
        const buttonWidth = 200;
        const buttonHeight = 70;
        
        const startButton = this.add.rectangle(centerX, y, buttonWidth, buttonHeight, 0x2196F3);
        const startText = this.add.text(centerX, y, 'START', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        startText.setOrigin(0.5);
        
        startButton.setInteractive({ useHandCursor: true });
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x42A5F5);
            startButton.setScale(1.05);
            startText.setScale(1.05);
        });
        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x2196F3);
            startButton.setScale(1);
            startText.setScale(1);
        });
        startButton.on('pointerdown', () => {
            // Apply god mode as difficulty if checkbox is checked
            const finalDifficulty = this.godMode ? 'godMode' : this.selectedDifficulty;
            
            // Store difficulty, environment, and boss mode in registry for access by other scenes
            this.registry.set('difficulty', finalDifficulty);
            this.registry.set('gameEnvironment', this.selectedEnvironment);
            this.registry.set('bossMode', this.bossMode);
            
            // FULL GAME STATE RESET - Clear everything from any previous game
            gameState.fullReset();
            
            // Reset player stats system
            playerStatsSystem.reset();
            
            // Reset to stage 1
            stageProgressionSystem.resetToStage1();
            
            // Reset stage stats tracker
            stageStatsTracker.reset();
            
            // Start the appropriate scene based on environment
            if (this.selectedEnvironment === 'water') {
                this.scene.start('UnderwaterScene');
            } else {
                this.scene.start('MainGameScene');
            }
        });
    }
    
    createOptionsButton(centerX: number, y: number): void {
        const buttonWidth = 200;
        const buttonHeight = 50;
        
        const optionsButton = this.add.rectangle(centerX, y, buttonWidth, buttonHeight, 0x8e44ad);
        const optionsText = this.add.text(centerX, y, 'HACKS', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        optionsText.setOrigin(0.5);
        
        optionsButton.setInteractive({ useHandCursor: true });
        optionsButton.on('pointerover', () => {
            optionsButton.setFillStyle(0x9b59b6);
            optionsButton.setScale(1.05);
            optionsText.setScale(1.05);
        });
        optionsButton.on('pointerout', () => {
            optionsButton.setFillStyle(0x8e44ad);
            optionsButton.setScale(1);
            optionsText.setScale(1);
        });
        optionsButton.on('pointerdown', () => {
            this.saveMenuPreferences();
            this.scene.start('OptionsScene');
        });
    }

    private getDifficultyLabel(value: string): string {
        switch (value) {
            case 'easy':
                return 'Easy';
            case 'hard':
                return 'Hard';
            case 'brutal':
                return 'Brutal';
            case 'normal':
            default:
                return 'Normal';
        }
    }

    private getEnvironmentLabel(value: string): string {
        switch (value) {
            case 'water':
                return 'Water';
            case 'air':
                return 'Air (Coming Soon)';
            case 'land':
            default:
                return 'Land';
        }
    }

    private loadMenuPreferences(): void {
        // Defaults
        this.selectedDifficulty = 'normal';
        this.selectedEnvironment = 'land';
        this.bossMode = false;
        this.godMode = false;

        try {
            const stored = localStorage.getItem(MenuScene.MENU_PREFS_STORAGE_KEY);
            if (!stored) {
                return;
            }

            const parsed = JSON.parse(stored) as Partial<{
                selectedDifficulty: string;
                selectedEnvironment: string;
                bossMode: boolean;
                godMode: boolean;
            }>;

            const validDifficulties = new Set(['easy', 'normal', 'hard', 'brutal']);
            if (typeof parsed.selectedDifficulty === 'string' && validDifficulties.has(parsed.selectedDifficulty)) {
                this.selectedDifficulty = parsed.selectedDifficulty;
            }
            const validEnvironments = new Set(['land', 'water', 'air']);
            if (typeof parsed.selectedEnvironment === 'string' && validEnvironments.has(parsed.selectedEnvironment)) {
                this.selectedEnvironment = parsed.selectedEnvironment;
            }
            if (typeof parsed.bossMode === 'boolean') {
                this.bossMode = parsed.bossMode;
            }
            if (typeof parsed.godMode === 'boolean') {
                this.godMode = parsed.godMode;
            }
        } catch {
            // Ignore malformed storage and keep defaults
        }
    }

    private saveMenuPreferences(): void {
        try {
            localStorage.setItem(
                MenuScene.MENU_PREFS_STORAGE_KEY,
                JSON.stringify({
                    selectedDifficulty: this.selectedDifficulty,
                    selectedEnvironment: this.selectedEnvironment,
                    bossMode: this.bossMode,
                    godMode: this.godMode
                })
            );
        } catch {
            // Ignore storage errors (e.g., disabled storage)
        }
    }
}
