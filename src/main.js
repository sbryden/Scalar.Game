/**
 * Main Entry Point
 * Initializes Phaser game with scene configuration
 */
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import MainGameScene from './scenes/MainGameScene.js';
import MicroScene from './scenes/MicroScene.js';

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
    scene: [BootScene, MenuScene, MainGameScene, MicroScene]
};

const game = new Phaser.Game(config);

export default game;
