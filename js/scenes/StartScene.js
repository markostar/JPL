import { setGridSize } from '../map/IsoHelper.js';
import { hasSaveGame, loadGame, deleteSave } from '../managers/SaveManager.js';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    const cx = this.cameras.main.width / 2;
    const h = this.cameras.main.height;
    this.cameras.main.setBackgroundColor('#0D47A1');

    // animated background tiles
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * this.cameras.main.width;
      const y = Math.random() * h;
      const tile = this.add.sprite(x, y, 'tile_water').setAlpha(0.15);
      this.tweens.add({
        targets: tile, alpha: { from: 0.1, to: 0.25 },
        duration: 1500 + Math.random() * 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    }

    // title
    this.add.text(cx, 50, '🌍 LEO WELTBAUER 🌍', {
      fontSize: '38px', fontFamily: 'Arial', color: '#FFD54F',
      fontStyle: 'bold', stroke: '#0D47A1', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(cx, 100, 'Baue deine eigene Welt!', {
      fontSize: '16px', fontFamily: 'Arial', color: '#90CAF9'
    }).setOrigin(0.5);

    const hasSave = hasSaveGame();

    if (hasSave) {
      this.createMenuWithSave(cx);
    } else {
      this.createNewGameMenu(cx, 140);
    }

    // controls + version at bottom
    this.add.text(cx, h - 50, '⬆️⬇️⬅️➡️ Kamera  |  🖱️ Klick = Bauen/Sammeln  |  ESC = Abbrechen', {
      fontSize: '12px', fontFamily: 'Arial', color: '#64B5F6'
    }).setOrigin(0.5);
    this.add.text(cx, h - 28, 'v0.4 - Gebaut von Leo & Papa 🎮', {
      fontSize: '11px', fontFamily: 'Arial', color: '#42A5F5'
    }).setOrigin(0.5);
  }

  createMenuWithSave(cx) {
    const save = loadGame();
    const pop = save ? save.population : 0;
    const island = save ? save.islandNumber : 1;
    const name = save ? save.playerName : '?';
    const savedDate = save && save.savedAt ? new Date(save.savedAt) : null;
    const dateStr = savedDate ? savedDate.toLocaleDateString('de-DE') + ' ' + savedDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '';

    // continue button (big, prominent)
    const contBtn = this.add.rectangle(cx, 175, 340, 70, 0x2E7D32, 1)
      .setInteractive({ useHandCursor: true }).setStrokeStyle(3, 0x66BB6A);
    this.add.text(cx, 160, '▶️ Weiterspielen', {
      fontSize: '22px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(cx, 185, `${name} - Insel #${island} - 👥 ${pop} - ${dateStr}`, {
      fontSize: '11px', fontFamily: 'Arial', color: '#A5D6A7'
    }).setOrigin(0.5);

    contBtn.on('pointerover', () => contBtn.setFillStyle(0x388E3C));
    contBtn.on('pointerout', () => contBtn.setFillStyle(0x2E7D32));
    contBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        setGridSize(save.gridSize);
        this.scene.start('WorldScene', {
          playerName: save.playerName,
          islandNumber: save.islandNumber,
          loadFromSave: true
        });
      });
    });

    // separator
    this.add.text(cx, 230, '── oder neues Spiel starten ──', {
      fontSize: '12px', fontFamily: 'Arial', color: '#5C6BC0'
    }).setOrigin(0.5);

    this.createNewGameMenu(cx, 255);

    // delete save button (small, bottom-right area)
    const delBtn = this.add.text(cx + 160, 200, '🗑️', {
      fontSize: '14px', fontFamily: 'Arial', color: '#EF9A9A'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    delBtn.on('pointerdown', () => {
      deleteSave();
      this.scene.restart();
    });
  }

  createNewGameMenu(cx, startY) {
    // name input
    this.add.text(cx, startY, '👤 Dein Name:', {
      fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.nameInput = this.add.dom(cx, startY + 40).createFromHTML(
      '<input type="text" id="playerName" placeholder="Leo" ' +
      'style="font-size:20px; padding:8px 16px; width:200px; text-align:center; ' +
      'border-radius:8px; border:2px solid #64B5F6; background:#E3F2FD; ' +
      'color:#1565C0; font-family:Arial; outline:none;">'
    );

    // map size
    this.add.text(cx, startY + 90, '🗺️ Insel-Groesse:', {
      fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.selectedSize = 'medium';
    const sizes = [
      { key: 'small',  label: '🏝️ Klein',  gridSize: 20, desc: '20x20' },
      { key: 'medium', label: '🌍 Mittel', gridSize: 30, desc: '30x30' },
      { key: 'large',  label: '🌏 Gross',  gridSize: 45, desc: '45x45' }
    ];

    this.sizeButtons = {};
    sizes.forEach((s, i) => {
      const bx = cx - 160 + i * 160;
      const by = startY + 145;
      const bg = this.add.rectangle(bx, by, 140, 60, 0x1565C0, 1)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(3, s.key === 'medium' ? 0xFFD54F : 0x1976D2);
      this.add.text(bx, by - 8, s.label, {
        fontSize: '16px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(bx, by + 14, s.desc, {
        fontSize: '13px', fontFamily: 'Arial', color: '#90CAF9'
      }).setOrigin(0.5);
      this.sizeButtons[s.key] = bg;
      bg.on('pointerdown', () => {
        this.selectedSize = s.key;
        sizes.forEach(sz => {
          this.sizeButtons[sz.key].setStrokeStyle(3, sz.key === s.key ? 0xFFD54F : 0x1976D2);
          this.sizeButtons[sz.key].setFillStyle(sz.key === s.key ? 0x1976D2 : 0x1565C0);
        });
      });
      bg.on('pointerover', () => bg.setFillStyle(0x1976D2));
      bg.on('pointerout', () => bg.setFillStyle(s.key === this.selectedSize ? 0x1976D2 : 0x1565C0));
    });

    // goal explanation
    this.add.text(cx, startY + 200, '🎯 Ziel: Bringe so viele Leute wie moeglich auf deine Insel!', {
      fontSize: '14px', fontFamily: 'Arial', color: '#FFD54F', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, startY + 225, '🏠 Baue Haeuser  |  🐟 Fische = Essen  |  👷 Arbeiter fuer Fabriken', {
      fontSize: '12px', fontFamily: 'Arial', color: '#90CAF9'
    }).setOrigin(0.5);

    // start button
    const startBtn = this.add.rectangle(cx, startY + 275, 240, 55, 0x4CAF50, 1)
      .setInteractive({ useHandCursor: true }).setStrokeStyle(3, 0x66BB6A);
    this.add.text(cx, startY + 275, '🚀 Neues Spiel!', {
      fontSize: '22px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    startBtn.on('pointerover', () => startBtn.setFillStyle(0x66BB6A));
    startBtn.on('pointerout', () => startBtn.setFillStyle(0x4CAF50));
    startBtn.on('pointerdown', () => {
      const nameEl = document.getElementById('playerName');
      const playerName = nameEl ? (nameEl.value.trim() || 'Leo') : 'Leo';
      setGridSize({ small: 20, medium: 30, large: 45 }[this.selectedSize]);
      // delete old save when starting new game
      deleteSave();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => this.scene.start('WorldScene', { playerName }));
    });
  }
}
