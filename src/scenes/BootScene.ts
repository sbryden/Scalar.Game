/**
 * Boot Scene
 * Handles asset preloading before the main game starts
 */
import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    preload() {
        // Load car images for different levels
        this.load.image('car_1', '/Scalar.Game/car_1.png');
        this.load.image('car_2', '/Scalar.Game/car_2.png');
        this.load.image('car_3', '/Scalar.Game/car_3.png');
        this.load.image('car_4', '/Scalar.Game/car_4.png');
        this.load.image('car_5', '/Scalar.Game/car_5.png');
        
        // Load submarine images for underwater levels
        this.load.image('sub_1', '/Scalar.Game/sub_1.png');
        this.load.image('sub_2', '/Scalar.Game/sub_2.png');
        this.load.image('sub_3', '/Scalar.Game/sub_3.png');
        
        // Load rockgiant enemy image
        this.load.image('enemy', '/Scalar.Game/rockgiant.png');
        
        // Load bacteria enemy image for micro scene
        this.load.image('bacteria', '/Scalar.Game/bacteria.png');
        
        // Load water enemy images
        this.load.image('water_enemy_crab_1', '/Scalar.Game/water_enemy_crab_1.png');
        this.load.image('water_enemy_fish_1', '/Scalar.Game/water_enemy_fish_1.png');
        this.load.image('water_enemy_needle_fish_1', '/Scalar.Game/water_enemy_needle_fish_1.png');
        
        // Load boss images
        this.load.image('sharkboss', '/Scalar.Game/sharkboss.png');
        this.load.image('crabboss', '/Scalar.Game/crabboss.png');
        this.load.image('snake_boss', '/Scalar.Game/snake_boss.png');
        this.load.image('rockgiant', '/Scalar.Game/rockgiant.png');
        this.load.image('zombie_blob', '/Scalar.Game/zombie_blob.png');
        this.load.image('micromonkeyboss', '/Scalar.Game/micromonkeyboss.png');
        this.load.image('micro_boss', '/Scalar.Game/micro_boss.png');
        this.load.image('rock_car_with_minions', '/Scalar.Game/rock_car_with_minions.png');
        this.load.image('wolf_boss', '/Scalar.Game/wolf_boss.png');
        
        // Load minion images
        this.load.image('rock_minion_1', '/Scalar.Game/rock_minion_1.png');
        
        // Load other game assets
        this.load.image('dead_skull', '/Scalar.Game/dead_skull.png');
        
        // Load projectile images
        this.load.image('torpedo', '/Scalar.Game/torpedo.png');
        this.load.image('beam', '/Scalar.Game/beam.png');
        this.load.image('sharkpedo', '/Scalar.Game/sharkpedo.png');
        this.load.image('bubble', '/Scalar.Game/bubble.png');
        this.load.image('wolf_boss_bullet', '/Scalar.Game/wolf_boss_bullet.png');
        
        // Load special orb images
        this.load.image('wolf_orb', '/Scalar.Game/wolf_orb.png');
        
        // Load menu assets
        this.load.image('secure_robot', '/Scalar.Game/secure_robot.png');
        
        // Load game over image
        this.load.image('gameover_1', '/Scalar.Game/gameover_1.png');
        
        // Optional: Add loading progress bar
        this.createLoadingBar();
    }
    
    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontSize: '32px',
            color: '#ffffff'
        });
        loadingText.setOrigin(0.5);
        
        // Create progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);
        
        // Update progress
        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }
    
    create() {
        // Once loading is complete, start the menu scene
        this.scene.start('MenuScene');
    }
}
