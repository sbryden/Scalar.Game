/**
 * Main Entry Point
 * Initializes Phaser game with scene configuration
 */
import BootScene from './scenes/BootScene.js';
import MainGameScene from './scenes/MainGameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [BootScene, MainGameScene]
};

const game = new Phaser.Game(config);

export default game;
