/**
 * Level Complete Screen
 * Displays when player defeats the boss with replay or exit options
 */
import Phaser from 'phaser';
import levelStatsTracker from '../systems/LevelStatsTracker';

export class LevelCompleteScreen {
    scene: Phaser.Scene;
    container: Phaser.GameObjects.Container | null;
    overlay: Phaser.GameObjects.Rectangle | null;
    titleText: Phaser.GameObjects.Text | null;
    statsText: Phaser.GameObjects.Text | null;
    messageText: Phaser.GameObjects.Text | null;
    rKey: Phaser.Input.Keyboard.Key | null;
    eKey: Phaser.Input.Keyboard.Key | null;
    isVisible: boolean;
    onReplay: (() => void) | null;
    onExit: (() => void) | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.container = null;
        this.overlay = null;
        this.titleText = null;
        this.statsText = null;
        this.messageText = null;
        this.rKey = null;
        this.eKey = null;
        this.isVisible = false;
        this.onReplay = null;
        this.onExit = null;
    }

    /**
     * Create the level complete screen (initially hidden)
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

        // Create title text
        this.titleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            80,
            'LEVEL COMPLETE!',
            {
                fontSize: '64px',
                color: '#FFD700',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 8
            }
        );
        this.titleText.setOrigin(0.5);
        this.titleText.setDepth(2001);
        this.titleText.setScrollFactor(0);
        this.titleText.setVisible(false);

        // Create stats text (will be updated when shown)
        this.statsText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            200,
            '',
            {
                fontSize: '28px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4,
                lineSpacing: 8
            }
        );
        this.statsText.setOrigin(0.5, 0);
        this.statsText.setDepth(2001);
        this.statsText.setScrollFactor(0);
        this.statsText.setVisible(false);

        // Create message text
        this.messageText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height - 80,
            'Press R to Replay\nPress E to Exit to Main Menu',
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

        // Setup keyboard input for R and E
        this.rKey = this.scene.input.keyboard!.addKey('R');
        this.eKey = this.scene.input.keyboard!.addKey('E');

        // Add listeners for R and E keys
        this.rKey.on('down', () => {
            if (this.isVisible) {
                this.handleReplay();
            }
        });

        this.eKey.on('down', () => {
            if (this.isVisible) {
                this.handleExit();
            }
        });
    }

    /**
     * Show the level complete screen
     */
    show(): void {
        if (this.overlay && this.titleText && this.statsText && this.messageText) {
            // Get stats from tracker
            const stats = levelStatsTracker.getStats();
            const completionTime = levelStatsTracker.getFormattedCompletionTime();
            
            // Build stats display text
            const statsDisplay = [
                'Level Statistics',
                '',
                `Time to Completion: ${completionTime}`,
                `Projectiles Fired: ${stats.projectilesFired}`,
                `Deaths: ${stats.deaths}`,
                `Enemies Destroyed: ${stats.enemiesDestroyed}`,
                `Bosses Destroyed: ${stats.bossesDestroyed}`,
                `Damage Dealt: ${Math.round(stats.damageDealt)}`,
                `Damage Taken: ${Math.round(stats.damageTaken)}`
            ].join('\n');
            
            this.statsText.setText(statsDisplay);
            
            this.overlay.setVisible(true);
            this.titleText.setVisible(true);
            this.statsText.setVisible(true);
            this.messageText.setVisible(true);
            this.isVisible = true;

            // Pause the game physics
            this.scene.physics.pause();
        }
    }

    /**
     * Hide the level complete screen
     */
    hide(): void {
        if (this.overlay && this.titleText && this.statsText && this.messageText) {
            this.overlay.setVisible(false);
            this.titleText.setVisible(false);
            this.statsText.setVisible(false);
            this.messageText.setVisible(false);
            this.isVisible = false;
        }
    }

    /**
     * Handle replay (R key)
     */
    handleReplay(): void {
        this.hide();
        
        // Resume physics
        this.scene.physics.resume();

        // Call replay callback if set
        if (this.onReplay) {
            this.onReplay();
        }
    }

    /**
     * Handle exit (E key)
     */
    handleExit(): void {
        this.hide();

        // Call exit callback if set
        if (this.onExit) {
            this.onExit();
        }
    }

    /**
     * Set the replay callback
     */
    setReplayCallback(callback: () => void): void {
        this.onReplay = callback;
    }

    /**
     * Set the exit callback
     */
    setExitCallback(callback: () => void): void {
        this.onExit = callback;
    }

    /**
     * Cleanup resources
     */
    destroy(): void {
        if (this.rKey) {
            this.rKey.removeAllListeners();
        }
        if (this.eKey) {
            this.eKey.removeAllListeners();
        }
        if (this.overlay) {
            this.overlay.destroy();
        }
        if (this.titleText) {
            this.titleText.destroy();
        }
        if (this.statsText) {
            this.statsText.destroy();
        }
        if (this.messageText) {
            this.messageText.destroy();
        }
    }
}
