import BootScene from './scenes/BootScene.js';
import StartScene from './scenes/StartScene.js';
import WorldScene from './scenes/WorldScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  parent: 'game-container',
  backgroundColor: '#0D47A1',
  dom: {
    createContainer: true
  },
  scene: [BootScene, StartScene, WorldScene, UIScene],
  input: {
    mouse: {
      preventDefaultDown: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
