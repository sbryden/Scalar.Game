/**
 * Boot Scene
 * Handles asset preloading before the main game starts
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    preload() {
        // Load car images for different levels
        this.load.image('car_1', './assets/car_1.png');
        this.load.image('car_2', './assets/car_2.png');
        this.load.image('car_3', './assets/car_3.png');
        this.load.image('car_4', './assets/car_4.png');
        this.load.image('car_5', './assets/car_5.png');
        
        // Load rockgiant enemy image
        this.load.image('enemy', './assets/rockgiant.png');
        
        // Optional: Add loading progress bar
        this.createLoadingBar();
    }
    
    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontSize: '32px',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5);
        
        // Create progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);
        
        // Update progress
        this.load.on('progress', (value) => {
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
        // Once loading is complete, start the main game scene
        this.scene.start('MainGameScene');
    }
}
