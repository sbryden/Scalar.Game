/**
 * Menu Scene
 * Main menu with title, difficulty selection, and start button
 */
import Phaser from 'phaser';
import gameState from '../utils/gameState';

export default class MenuScene extends Phaser.Scene {
    selectedDifficulty!: string;
    selectedEnvironment!: string;
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
    infoScreenVisible: boolean;
    infoScreenContainer: Phaser.GameObjects.Container | null;

    constructor() {
        super({ key: 'MenuScene' });
        this.selectedDifficulty = 'normal';
        this.selectedEnvironment = 'land';
        this.dropdownOpen = false;
        this.environmentDropdownOpen = false;
        this.infoScreenVisible = false;
        this.infoScreenContainer = null;
    }
    
    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
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
        
        // Start button
        this.createStartButton(width / 2, 540);
        
        // Help text - click to view full controls and info
        const helpText = this.add.text(width / 2, 620, 'Click "INFO" for controls and gameplay details', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#00ff88'
        });
        helpText.setOrigin(0.5);
        helpText.setAlpha(0.7);
        
        // Info button
        this.createInfoButton(width / 2, 670);
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
        this.selectedText = this.add.text(-dropdownWidth / 2 + 15, 0, 'Normal', {
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
        
        // Create options
        const options = [
            { value: 'normal', label: 'Normal' },
            { value: 'godMode', label: 'God Mode' }
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
        this.environmentSelectedText = this.add.text(-dropdownWidth / 2 + 15, 0, 'Land', {
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
        this.toggleEnvironmentDropdown();
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
            // Store difficulty and environment in registry for access by other scenes
            this.registry.set('difficulty', this.selectedDifficulty);
            this.registry.set('gameEnvironment', this.selectedEnvironment);
            
            // Clear saved enemies when starting a new game
            gameState.savedEnemies = {
                BootScene: [],
                MenuScene: [],
                MainGameScene: [],
                MicroScene: [],
                UnderwaterScene: [],
                UnderwaterMicroScene: []
            };
            
            // Start the appropriate scene based on environment
            if (this.selectedEnvironment === 'water') {
                this.scene.start('UnderwaterScene');
            } else {
                this.scene.start('MainGameScene');
            }
        });
    }
    
    createInfoButton(centerX: number, y: number): void {
        const buttonWidth = 120;
        const buttonHeight = 40;
        
        const infoButton = this.add.rectangle(centerX, y, buttonWidth, buttonHeight, 0x2c3e50);
        infoButton.setStrokeStyle(2, 0x3498db);
        const infoText = this.add.text(centerX, y, 'INFO', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        infoText.setOrigin(0.5);
        
        infoButton.setInteractive({ useHandCursor: true });
        infoButton.on('pointerover', () => {
            infoButton.setFillStyle(0x34495e);
            infoButton.setScale(1.05);
            infoText.setScale(1.05);
        });
        infoButton.on('pointerout', () => {
            infoButton.setFillStyle(0x2c3e50);
            infoButton.setScale(1);
            infoText.setScale(1);
        });
        infoButton.on('pointerdown', () => {
            this.showInfoScreen();
        });
    }
    
    showInfoScreen(): void {
        if (this.infoScreenVisible) return;
        
        // Set state immediately to prevent duplicate calls
        this.infoScreenVisible = true;
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.infoScreenContainer = this.add.container(0, 0);
        this.infoScreenContainer.setDepth(1000);
        
        // Semi-transparent overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        overlay.setInteractive();
        
        // Background panel
        const panelWidth = 900;
        const panelHeight = 650;
        const panel = this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x1a1a2e);
        panel.setStrokeStyle(3, 0x00ff88);
        
        // Title
        const title = this.add.text(width / 2, 80, 'CONTROLS & GAMEPLAY', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#00ff88'
        });
        title.setOrigin(0.5);
        
        // Create three columns
        const leftX = width / 2 - 280;
        const centerX = width / 2;
        const rightX = width / 2 + 280;
        let yPos = 140;
        
        // Controls section (Left)
        const controlsTitle = this.add.text(leftX, yPos, '⌨️ CONTROLS', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        controlsTitle.setOrigin(0.5);
        
        yPos += 35;
        const controlsList = [
            'WASD / Arrow Keys - Move',
            'SPACE - Jump / Thrust',
            'Q / E - Shrink / Grow',
            'F - Fire',
            'SHIFT - Shield / Melee'
        ];
        
        const controlsText = this.add.text(leftX, yPos, controlsList.join('\n'), {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            lineSpacing: 6
        });
        controlsText.setOrigin(0.5, 0);
        
        // Land Gameplay section (Center)
        yPos = 140;
        const landTitle = this.add.text(centerX, yPos, '🚜 LAND GAMEPLAY', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        landTitle.setOrigin(0.5);
        
        yPos += 35;
        const landList = [
            '• Drive a tank',
            '• Fire beam projectiles',
            '• Jump and dodge',
            '• Change size to explore',
            '  different scales'
        ];
        
        const landText = this.add.text(centerX, yPos, landList.join('\n'), {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            lineSpacing: 6
        });
        landText.setOrigin(0.5, 0);
        
        // Underwater Gameplay section (Right)
        yPos = 140;
        const waterTitle = this.add.text(rightX, yPos, '🌊 UNDERWATER', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        waterTitle.setOrigin(0.5);
        
        yPos += 35;
        const waterList = [
            '• Pilot a submarine',
            '• Fire torpedoes',
            '• Thrust in all directions',
            '• Explore underwater',
            '  environments'
        ];
        
        const waterText = this.add.text(rightX, yPos, waterList.join('\n'), {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            lineSpacing: 6
        });
        waterText.setOrigin(0.5, 0);
        
        // Combat section (Full width at bottom)
        yPos = 320;
        const combatTitle = this.add.text(width / 2, yPos, '⚔️ COMBAT', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        combatTitle.setOrigin(0.5);
        
        yPos += 35;
        const combatList = [
            'Fire projectiles to damage enemies',
            '',
            'Hold SHIFT for shield/melee mode:',
            '  • Ram enemies for extra damage',
            '  • Take less damage from collisions',
            '  • Enemies are knocked back'
        ];
        
        const combatText = this.add.text(width / 2, yPos, combatList.join('\n'), {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 6
        });
        combatText.setOrigin(0.5, 0);
        
        // Close button
        const closeButton = this.add.rectangle(width / 2, height - 60, 150, 50, 0x2196F3);
        const closeText = this.add.text(width / 2, height - 60, 'CLOSE', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        closeText.setOrigin(0.5);
        
        closeButton.setInteractive({ useHandCursor: true });
        closeButton.on('pointerover', () => {
            closeButton.setFillStyle(0x42A5F5);
            closeButton.setScale(1.05);
            closeText.setScale(1.05);
        });
        closeButton.on('pointerout', () => {
            closeButton.setFillStyle(0x2196F3);
            closeButton.setScale(1);
            closeText.setScale(1);
        });
        closeButton.on('pointerdown', () => {
            this.hideInfoScreen();
        });
        
        // Add all elements to container
        this.infoScreenContainer.add([
            overlay, panel, title,
            controlsTitle, controlsText,
            landTitle, landText,
            waterTitle, waterText,
            combatTitle, combatText,
            closeButton, closeText
        ]);
    }
    
    hideInfoScreen(): void {
        this.infoScreenContainer?.destroy();
        this.infoScreenContainer = null;
        this.infoScreenVisible = false;
    }
}
