/**
 * Game Over Screen
 * Displays when player dies with continue option
 */
import Phaser from 'phaser';

export class GameOverScreen {
    scene: Phaser.Scene;
    container: Phaser.GameObjects.Container | null;
    overlay: Phaser.GameObjects.Rectangle | null;
    titleImage: Phaser.GameObjects.Image | null;
    messageText: Phaser.GameObjects.Text | null;
    yKey: Phaser.Input.Keyboard.Key | null;
    nKey: Phaser.Input.Keyboard.Key | null;
    cKey: Phaser.Input.Keyboard.Key | null;
    isVisible: boolean;
    onContinue: (() => void) | null;
    onQuit: (() => void) | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.container = null;
        this.overlay = null;
        this.titleImage = null;
        this.messageText = null;
        this.yKey = null;
        this.nKey = null;
        this.cKey = null;
        this.isVisible = false;
        this.onContinue = null;
        this.onQuit = null;
    }

    /**
     * Create the game over screen (initially hidden)
     */
    create(): void {
        // Create semi-transparent overlay
        this.overlay = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.7
        );
        this.overlay.setDepth(2000);
        this.overlay.setScrollFactor(0);
        this.overlay.setVisible(false);

        // Create title image
        this.titleImage = this.scene.add.image(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 80,
            'water/gameover_1'
        );
        this.titleImage.setOrigin(0.5);
        this.titleImage.setDepth(2001);
        this.titleImage.setScrollFactor(0);
        this.titleImage.setVisible(false);
        // Scale the image if needed (adjust as necessary)
        this.titleImage.setScale(1.0);

        // Create message text
        this.messageText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height - 120,
            'Continue?\n\nPress Y for Yes\nPress N for No\nPress C for Credits',
            {
                fontSize: '32px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.messageText.setOrigin(0.5);
        this.messageText.setDepth(2001);
        this.messageText.setScrollFactor(0);
        this.messageText.setVisible(false);

        // Setup keyboard input for Y, N, and C
        this.yKey = this.scene.input.keyboard!.addKey('Y');
        this.nKey = this.scene.input.keyboard!.addKey('N');
        this.cKey = this.scene.input.keyboard!.addKey('C');

        // Add listeners for Y, N, and C keys
        this.yKey.on('down', () => {
            if (this.isVisible) {
                this.handleContinue();
            }
        });

        this.nKey.on('down', () => {
            if (this.isVisible) {
                this.handleQuit();
            }
        });

        this.cKey.on('down', () => {
            if (this.isVisible) {
                this.handleCredits();
            }
        });
    }

    /**
     * Show the game over screen
     */
    show(): void {
        if (this.overlay && this.titleImage && this.messageText) {
            this.overlay.setVisible(true);
            this.titleImage.setVisible(true);
            this.messageText.setVisible(true);
            this.isVisible = true;

            // Pause the game physics
            this.scene.physics.pause();
        }
    }

    /**
     * Hide the game over screen
     */
    hide(): void {
        if (this.overlay && this.titleImage && this.messageText) {
            this.overlay.setVisible(false);
            this.titleImage.setVisible(false);
            this.messageText.setVisible(false);
            this.isVisible = false;
        }
    }

    /**
     * Handle continue (Y key)
     */
    handleContinue(): void {
        this.hide();
        
        // Resume physics
        this.scene.physics.resume();

        // Call continue callback if set
        if (this.onContinue) {
            this.onContinue();
        }
    }

    /**
     * Handle quit (N key)
     */
    handleQuit(): void {
        this.hide();

        // Call quit callback if set
        if (this.onQuit) {
            this.onQuit();
        }
    }

    /**
     * Handle credits (C key)
     */
    handleCredits(): void {
        this.hide();
        this.scene.physics.resume();
        this.scene.scene.start('CreditsScene', { returnScene: 'MenuScene' });
    }

    /**
     * Set callback for continue action
     */
    setContinueCallback(callback: () => void): void {
        this.onContinue = callback;
    }

    /**
     * Set callback for quit action
     */
    setQuitCallback(callback: () => void): void {
        this.onQuit = callback;
    }

    /**
     * Clean up
     */
    destroy(): void {
        if (this.overlay) {
            this.overlay.destroy();
        }
        if (this.titleImage) {
            this.titleImage.destroy();
        }
        if (this.messageText) {
            this.messageText.destroy();
        }
        if (this.yKey) {
            this.yKey.removeAllListeners();
        }
        if (this.nKey) {
            this.nKey.removeAllListeners();
        }
        if (this.cKey) {
            this.cKey.removeAllListeners();
        }
    }
}
