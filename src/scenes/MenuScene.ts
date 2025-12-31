/**
 * Menu Scene
 * Main menu with title, difficulty selection, and start button
 */
import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    selectedDifficulty!: string;
    dropdownOpen!: boolean;
    dropdownContainer!: Phaser.GameObjects.Container;
    dropdownBox!: Phaser.GameObjects.Rectangle;
    selectedText!: Phaser.GameObjects.Text;
    dropdownArrow!: Phaser.GameObjects.Text;
    optionsContainer!: Phaser.GameObjects.Container;
    optionElements!: Array<{ bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }>;

    constructor() {
        super({ key: 'MenuScene' });
        this.selectedDifficulty = 'normal';
        this.dropdownOpen = false;
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
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
        const difficultyLabel = this.add.text(width / 2, 320, 'SELECT DIFFICULTY', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        difficultyLabel.setOrigin(0.5);
        
        // Create difficulty dropdown
        this.createDifficultyDropdown(width / 2, 380);
        
        // Start button
        this.createStartButton(width / 2, 520);
        
        // Instructions
        const instructions = this.add.text(width / 2, 650, 'Q/E - Change Size  |  A/D - Move  |  SPACE - Jump  |  F - Fire', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        instructions.setOrigin(0.5);
        instructions.setAlpha(0.6);
    }
    
    createDifficultyDropdown(centerX, y) {
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
        this.optionsContainer = this.add.container(0, dropdownHeight / 2 + 5);
        this.optionsContainer.setVisible(false);
        
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
        
        // Add elements to container
        this.dropdownContainer.add([this.dropdownBox, this.selectedText, this.dropdownArrow, this.optionsContainer]);
        
        // Set depth to ensure dropdown appears on top
        this.dropdownContainer.setDepth(100);
    }
    
    toggleDropdown() {
        this.dropdownOpen = !this.dropdownOpen;
        this.optionsContainer.setVisible(this.dropdownOpen);
        this.dropdownArrow.setText(this.dropdownOpen ? '▲' : '▼');
    }
    
    selectOption(value, label) {
        this.selectedDifficulty = value;
        this.selectedText.setText(label);
        this.toggleDropdown();
    }
    
    createStartButton(centerX, y) {
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
            // Store difficulty in registry for access by other scenes
            this.registry.set('difficulty', this.selectedDifficulty);
            
            // Start the game
            this.scene.start('MainGameScene');
        });
    }
}
