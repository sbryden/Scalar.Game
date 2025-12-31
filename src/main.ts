/**
 * Main Entry Point
 * Initializes Phaser game with scene configuration
 */
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import MainGameScene from './scenes/MainGameScene';
import MicroScene from './scenes/MicroScene';

const config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 768,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, MainGameScene, MicroScene]
};

const game = new Phaser.Game(config);

export default game;
