/**
 * Credits Scene
 * Displays game credits with a scrolling or static layout.
 * Accessible from the main menu, game over screen, and stage complete screen.
 */
import Phaser from 'phaser';

export default class CreditsScene extends Phaser.Scene {
    private returnScene: string;

    constructor() {
        super({ key: 'CreditsScene' });
        this.returnScene = 'MenuScene';
    }

    init(data: { returnScene?: string }): void {
        this.returnScene = data?.returnScene || 'MenuScene';
    }

    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

        // Decorative top/bottom lines
        this.add.rectangle(width / 2, 60, width * 0.6, 2, 0x00ff88).setAlpha(0.4);
        this.add.rectangle(width / 2, height - 60, width * 0.6, 2, 0x00ff88).setAlpha(0.4);

        // Title
        const title = this.add.text(width / 2, 100, 'CREDITS', {
            fontSize: '56px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#00ff88',
            stroke: '#ffffff',
            strokeThickness: 3
        });
        title.setOrigin(0.5);

        // Credits entries
        const credits = [
            { name: 'Steven Bryden', role: 'Developer' },
            { name: 'James Bryden', role: 'Game Designer and Architect' }
        ];

        let yOffset = 240;
        const entrySpacing = 140;

        credits.forEach((entry) => {
            // Name
            const nameText = this.add.text(width / 2, yOffset, entry.name, {
                fontSize: '36px',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                color: '#ffffff'
            });
            nameText.setOrigin(0.5);

            // Role
            const roleText = this.add.text(width / 2, yOffset + 48, entry.role, {
                fontSize: '22px',
                fontFamily: 'Arial, sans-serif',
                color: '#aaaaaa'
            });
            roleText.setOrigin(0.5);

            yOffset += entrySpacing;
        });

        // "Made with Phaser" note
        const engineText = this.add.text(width / 2, yOffset + 40, 'Built with Phaser 3', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#555555'
        });
        engineText.setOrigin(0.5);

        // Back button
        this.createBackButton(width / 2, height - 120);

        // ESC key to go back
        const escKey = this.input.keyboard!.addKey('ESC');
        escKey.on('down', () => {
            this.goBack();
        });
    }

    private createBackButton(centerX: number, y: number): void {
        const buttonWidth = 200;
        const buttonHeight = 50;

        const backButton = this.add.rectangle(centerX, y, buttonWidth, buttonHeight, 0x2c3e50);
        backButton.setStrokeStyle(2, 0x3498db);

        const backText = this.add.text(centerX, y, 'BACK (ESC)', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        backText.setOrigin(0.5);

        backButton.setInteractive({ useHandCursor: true });
        backButton.on('pointerover', () => {
            backButton.setFillStyle(0x3498db);
            backButton.setScale(1.05);
            backText.setScale(1.05);
        });
        backButton.on('pointerout', () => {
            backButton.setFillStyle(0x2c3e50);
            backButton.setScale(1);
            backText.setScale(1);
        });
        backButton.on('pointerdown', () => {
            this.goBack();
        });
    }

    private goBack(): void {
        this.scene.start(this.returnScene);
    }
}
