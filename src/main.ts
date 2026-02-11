/**
 * Main Entry Point
 * Initializes Phaser game with scene configuration
 */
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import OptionsScene from './scenes/OptionsScene';
import MainGameScene from './scenes/MainGameScene';
import MicroScene from './scenes/MicroScene';
import MainGameMacroScene from './scenes/MainGameMacroScene';
import UnderwaterScene from './scenes/UnderwaterScene';
import UnderwaterMicroScene from './scenes/UnderwaterMicroScene';
import UnderwaterMacroScene from './scenes/UnderwaterMacroScene';
import CreditsScene from './scenes/CreditsScene';

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
    scene: [BootScene, MenuScene, OptionsScene, CreditsScene, MainGameScene, MicroScene, MainGameMacroScene, UnderwaterScene, UnderwaterMicroScene, UnderwaterMacroScene]
};

const game = new Phaser.Game(config);

export default game;
