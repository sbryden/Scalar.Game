/**
 * Main Entry Point
 * Initializes Phaser game with scene configuration
 */
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import MainGameScene from './scenes/MainGameScene';
import MicroScene from './scenes/MicroScene';
import UnderwaterScene from './scenes/UnderwaterScene';
import UnderwaterMicroScene from './scenes/UnderwaterMicroScene';
import ConfigEditorScene from './scenes/ConfigEditorScene';

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
    scene: [BootScene, MenuScene, MainGameScene, MicroScene, UnderwaterScene, UnderwaterMicroScene, ConfigEditorScene]
};

const game = new Phaser.Game(config);

// Expose game to window in development mode for testing
if (import.meta.env.DEV) {
    (window as any).game = game;
}

export default game;
