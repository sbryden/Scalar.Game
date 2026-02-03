/**
 * Stage Complete Screen
 * Displays when player defeats the boss with next-stage or exit options.
 * Note: "Stage" refers to game world/scene progression, distinct from player level (XP-based).
 */
import Phaser from 'phaser';
import stageStatsTracker from '../systems/StageStatsTracker';
import stageProgressionSystem from '../systems/StageProgressionSystem';

export class StageCompleteScreen {
    scene: Phaser.Scene;
    container: Phaser.GameObjects.Container | null;
    overlay: Phaser.GameObjects.Rectangle | null;
    titleText: Phaser.GameObjects.Text | null;
    statsText: Phaser.GameObjects.Text | null;
    messageText: Phaser.GameObjects.Text | null;
    nKey: Phaser.Input.Keyboard.Key | null;
    mKey: Phaser.Input.Keyboard.Key | null;
    isVisible: boolean;
    onNextStage: (() => void) | null;
    onExit: (() => void) | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.container = null;
        this.overlay = null;
        this.titleText = null;
        this.statsText = null;
        this.messageText = null;
        this.nKey = null;
        this.mKey = null;
        this.isVisible = false;
        this.onNextStage = null;
        this.onExit = null;
    }

    /**
     * Create the stage complete screen (initially hidden)
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
        const currentStage = stageProgressionSystem.getCurrentStage();
        this.titleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            80,
            `STAGE ${currentStage} COMPLETE!`,
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
            170,
            '',
            {
                fontSize: '22px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4,
                lineSpacing: 2
            }
        );
        this.statsText.setOrigin(0.5, 0);
        this.statsText.setDepth(2001);
        this.statsText.setScrollFactor(0);
        this.statsText.setVisible(false);

        // Create message text
        this.messageText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height - 100,
            'Press N for Next Stage\nPress M to Exit to Main Menu',
            {
                fontSize: '24px',
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

        // Setup keyboard input for N and M
        this.nKey = this.scene.input.keyboard!.addKey('N');
        this.mKey = this.scene.input.keyboard!.addKey('M');

        // Add listeners for N and M keys
        this.nKey.on('down', () => {
            if (this.isVisible) {
                this.handleNextStage();
            }
        });

        this.mKey.on('down', () => {
            if (this.isVisible) {
                this.handleExit();
            }
        });
    }

    /**
     * Show the stage complete screen
     */
    show(): void {
        if (this.overlay && this.titleText && this.statsText && this.messageText) {
            // Update title with current stage
            const currentStage = stageProgressionSystem.getCurrentStage();
            this.titleText.setText(`STAGE ${currentStage} COMPLETE!`);
            
            // Get stats from tracker
            const stats = stageStatsTracker.getStats();
            const completionTime = stageStatsTracker.getFormattedCompletionTime();
            
            // Calculate score
            const score = stageStatsTracker.calculateScore(currentStage);
            const runTotalScore = Math.round(stageStatsTracker.getCumulativeScore(currentStage));
            
            // Build stats display text with score breakdown
            const statsDisplay = [
                'Stage Statistics',
                '',
                `Time to Completion: ${completionTime}`,
                '',
                '=== SCORE BREAKDOWN ===',
                ''
            ];
            
            // Add score breakdown with actual counts using pre-calculated scaled values
            if (stats.regularBossesDestroyed > 0) {
                statsDisplay.push(`Regular Bosses: ${stats.regularBossesDestroyed} × ${score.scaledValues.regularBoss} = ${Math.round(score.regularBossPoints)} pts`);
            }
            if (stats.regularEnemiesDestroyed > 0) {
                statsDisplay.push(`Regular Enemies: ${stats.regularEnemiesDestroyed} × ${score.scaledValues.regularEnemy} = ${Math.round(score.regularEnemyPoints)} pts`);
            }
            if (stats.microBossesDestroyed > 0) {
                statsDisplay.push(`Micro-World Bosses: ${stats.microBossesDestroyed} × ${score.scaledValues.microBoss} = ${Math.round(score.microBossPoints)} pts`);
            }
            if (stats.microEnemiesDestroyed > 0) {
                statsDisplay.push(`Micro-World Enemies: ${stats.microEnemiesDestroyed} × ${score.scaledValues.microEnemy} = ${Math.round(score.microEnemyPoints)} pts`);
            }
            
            statsDisplay.push('');
            statsDisplay.push(`STAGE SCORE: ${Math.round(score.totalScore)} pts`);
            statsDisplay.push(`RUN TOTAL: ${runTotalScore} pts`);
            statsDisplay.push('');
            statsDisplay.push(`Projectiles Fired: ${stats.projectilesFired}`);
            statsDisplay.push(`Deaths: ${stats.deaths}`);
            statsDisplay.push(`Damage: dealt ${Math.round(stats.damageDealt)} / taken ${Math.round(stats.damageTaken)}`);
            
            this.statsText.setText(statsDisplay.join('\n'));
            
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
     * Hide the stage complete screen
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
     * Handle next stage (N key)
     */
    handleNextStage(): void {
        this.hide();
        
        // Resume physics
        this.scene.physics.resume();

        // Call next stage callback if set
        if (this.onNextStage) {
            this.onNextStage();
        }
    }

    /**
     * Handle exit (M key)
     */
    handleExit(): void {
        this.hide();

        // Call exit callback if set
        if (this.onExit) {
            this.onExit();
        }
    }

    /**
     * Set the next stage callback
     */
    setNextStageCallback(callback: () => void): void {
        this.onNextStage = callback;
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
        if (this.nKey) {
            this.nKey.removeAllListeners();
        }
        if (this.mKey) {
            this.mKey.removeAllListeners();
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
