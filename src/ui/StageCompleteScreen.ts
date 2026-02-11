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
    buttons: { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }[];
    nKey: Phaser.Input.Keyboard.Key | null;
    mKey: Phaser.Input.Keyboard.Key | null;
    cKey: Phaser.Input.Keyboard.Key | null;
    isVisible: boolean;
    onNextStage: (() => void) | null;
    onExit: (() => void) | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.container = null;
        this.overlay = null;
        this.titleText = null;
        this.statsText = null;
        this.buttons = [];
        this.nKey = null;
        this.mKey = null;
        this.cKey = null;
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

        // Create action buttons
        const buttonConfigs = [
            { label: 'Next Stage', action: () => this.handleNextStage() },
            { label: 'Main Menu', action: () => this.handleExit() },
            { label: 'Credits', action: () => this.handleCredits() },
        ];
        const buttonY = this.scene.cameras.main.height - 80;
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonSpacing = 30;
        const totalWidth = buttonConfigs.length * buttonWidth + (buttonConfigs.length - 1) * buttonSpacing;
        const startX = (this.scene.cameras.main.width - totalWidth) / 2 + buttonWidth / 2;

        buttonConfigs.forEach((cfg, i) => {
            const x = startX + i * (buttonWidth + buttonSpacing);
            const bg = this.scene.add.rectangle(x, buttonY, buttonWidth, buttonHeight, 0x444444, 0.9)
                .setStrokeStyle(2, 0xFFD700)
                .setDepth(2002)
                .setScrollFactor(0)
                .setVisible(false)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => { bg.setFillStyle(0x666666, 1); })
                .on('pointerout', () => { bg.setFillStyle(0x444444, 0.9); })
                .on('pointerdown', () => { if (this.isVisible) cfg.action(); });

            const text = this.scene.add.text(x, buttonY, cfg.label, {
                fontSize: '22px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            })
                .setOrigin(0.5)
                .setDepth(2003)
                .setScrollFactor(0)
                .setVisible(false);

            this.buttons.push({ bg, text });
        });

        // Setup keyboard input for N, M, and C
        this.nKey = this.scene.input.keyboard!.addKey('N');
        this.mKey = this.scene.input.keyboard!.addKey('M');
        this.cKey = this.scene.input.keyboard!.addKey('C');

        // Add listeners for N, M, and C keys
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

        this.cKey.on('down', () => {
            if (this.isVisible) {
                this.handleCredits();
            }
        });
    }

    /**
     * Show the stage complete screen
     */
    show(): void {
        if (this.overlay && this.titleText && this.statsText) {
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
            this.buttons.forEach(btn => {
                btn.bg.setVisible(true);
                btn.text.setVisible(true);
            });
            this.isVisible = true;

            // Pause the game physics
            this.scene.physics.pause();
        }
    }

    /**
     * Hide the stage complete screen
     */
    hide(): void {
        if (this.overlay && this.titleText && this.statsText) {
            this.overlay.setVisible(false);
            this.titleText.setVisible(false);
            this.statsText.setVisible(false);
            this.buttons.forEach(btn => {
                btn.bg.setVisible(false);
                btn.text.setVisible(false);
            });
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
     * Handle credits (C key)
     */
    handleCredits(): void {
        this.hide();
        this.scene.physics.resume();
        this.scene.scene.start('CreditsScene', { returnScene: 'MenuScene' });
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
        if (this.cKey) {
            this.cKey.removeAllListeners();
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
        this.buttons.forEach(btn => {
            btn.bg.destroy();
            btn.text.destroy();
        });
        this.buttons = [];
    }
}
