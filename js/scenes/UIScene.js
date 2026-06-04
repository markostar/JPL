import { BUILDINGS } from '../buildings/BuildingManager.js';
import { saveGame } from '../managers/SaveManager.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  init(data) {
    this.resourceManager = data.resourceManager;
    this.populationManager = data.populationManager;
    this.worldScene = data.worldScene;
    this.playerName = data.playerName || 'Leo';
  }

  create() {
    this.resourceTexts = {};
    this.notifications = [];
    this.buildMenuOpen = true;
    this.deleteMode = false;

    this.createTopBar();
    this.createBuildMenu();
    this.createWizard();
    this.createNotificationArea();

    this.resourceManager.onChange((type, amount) => this.updateResourceDisplay(type, amount));
    this.populationManager.onChange(() => this.updatePopulationDisplay());
    this.populationManager.onNotification((msg) => this.showNotification(msg));

    // update wizard tip periodically
    this.time.addEvent({
      delay: 5000, loop: true,
      callback: () => this.updateWizardTip()
    });
  }

  createTopBar() {
    const w = this.cameras.main.width;
    const barH = 48;

    this.add.rectangle(w / 2, barH / 2, w, barH, 0x000000, 0.8).setScrollFactor(0);

    // player name
    this.add.text(10, barH / 2, `👤 ${this.playerName}`, {
      fontSize: '13px', fontFamily: 'Arial', color: '#FFD54F', fontStyle: 'bold'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10010);

    // resources
    const resources = [
      { key: 'wood', icon: '🪵' },
      { key: 'stone', icon: '🪨' },
      { key: 'fish', icon: '🐟' }
    ];
    const resStartX = 120;
    resources.forEach((res, i) => {
      const x = resStartX + i * 100;
      this.add.text(x, barH / 2, res.icon, {
        fontSize: '18px', fontFamily: 'Arial'
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10010);

      const txt = this.add.text(x + 24, barH / 2, `${this.resourceManager.get(res.key)}`, {
        fontSize: '15px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10010);
      this.resourceTexts[res.key] = txt;
    });

    // capacity indicator (used/total)
    this.capacityText = this.add.text(resStartX + 300, barH / 2,
      `📦 ${this.resourceManager.totalUsed}/${this.resourceManager.capacity}`, {
      fontSize: '12px', fontFamily: 'Arial', color: '#90CAF9'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10010);

    // population section on right side
    const popX = w - 220;
    this.add.text(popX, barH / 2, '👥', {
      fontSize: '18px', fontFamily: 'Arial'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10010);

    this.popText = this.add.text(popX + 26, barH / 2, '0/0', {
      fontSize: '15px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10010);

    // workers
    this.add.text(popX + 80, barH / 2, '👷', {
      fontSize: '18px', fontFamily: 'Arial'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10010);

    this.workerText = this.add.text(popX + 106, barH / 2, '0/0', {
      fontSize: '13px', fontFamily: 'Arial', color: '#B0BEC5'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10010);

    // happiness
    this.add.text(popX + 150, barH / 2, '😊', {
      fontSize: '18px', fontFamily: 'Arial'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10010);

    this.happyText = this.add.text(popX + 176, barH / 2, '80%', {
      fontSize: '13px', fontFamily: 'Arial', color: '#66BB6A'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(10010);

    // save button
    const saveBtn = this.add.text(w - 15, barH / 2, '💾', {
      fontSize: '20px', fontFamily: 'Arial'
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(10010).setInteractive({ useHandCursor: true });
    saveBtn.on('pointerdown', () => {
      saveGame(this.worldScene);
      this.showNotification('💾 Spiel gespeichert!');
    });
    saveBtn.on('pointerover', () => saveBtn.setAlpha(0.7));
    saveBtn.on('pointerout', () => saveBtn.setAlpha(1));
  }

  updateResourceDisplay(type, amount) {
    const txt = this.resourceTexts[type];
    if (!txt) return;
    txt.setText(`${amount}`);
    this.tweens.add({
      targets: txt,
      scaleX: { from: 1.3, to: 1 }, scaleY: { from: 1.3, to: 1 },
      duration: 250, ease: 'Back.easeOut'
    });
    this.capacityText.setText(`📦 ${this.resourceManager.totalUsed}/${this.resourceManager.capacity}`);
  }

  updatePopulationDisplay() {
    const pm = this.populationManager;
    this.popText.setText(`${pm.population}/${pm.maxPopulation}`);
    this.workerText.setText(`${pm.workersAssigned}/${pm.population}`);

    const h = pm.happiness;
    let emoji = '😊';
    let color = '#66BB6A';
    if (h < 30) { emoji = '😡'; color = '#EF5350'; }
    else if (h < 50) { emoji = '😟'; color = '#FFA726'; }
    else if (h < 70) { emoji = '😐'; color = '#FFD54F'; }
    this.happyText.setText(`${h}%`);
    this.happyText.setColor(color);
  }

  createBuildMenu() {
    const menuH = 80;
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const y = h - menuH / 2;

    this.menuBg = this.add.rectangle(w / 2, y, w, menuH, 0x000000, 0.8).setScrollFactor(0);

    const buildingKeys = Object.keys(BUILDINGS);
    // +1 for delete button, all in one row
    const totalButtons = buildingKeys.length + 1;
    const padding = 8;
    const btnGap = 3;
    const availableW = w - padding * 2;
    const btnW = Math.floor((availableW - (totalButtons - 1) * btnGap) / totalButtons);
    const totalW = totalButtons * btnW + (totalButtons - 1) * btnGap;
    const startX = (w - totalW) / 2 + btnW / 2;

    this.buildButtons = [];

    buildingKeys.forEach((key, i) => {
      const building = BUILDINGS[key];
      const x = startX + i * (btnW + btnGap);

      const btn = this.add.rectangle(x, y - 5, btnW - 2, 48, 0x263238, 1)
        .setScrollFactor(0).setDepth(10010)
        .setStrokeStyle(1, 0x546E7A)
        .setInteractive({ useHandCursor: true });

      // icon
      this.add.text(x, y - 18, building.icon, {
        fontSize: '18px', fontFamily: 'Arial'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(10011);

      // cost line (compact)
      const costParts = Object.entries(building.cost).map(([k, v]) => {
        return `${v}${this.resourceManager.getIcon(k)}`;
      });
      this.add.text(x, y + 4, costParts.join(' '), {
        fontSize: '8px', fontFamily: 'Arial', color: '#E0E0E0'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(10011);

      // workers needed
      if (building.workers > 0) {
        this.add.text(x, y + 15, `${building.workers}👷`, {
          fontSize: '8px', fontFamily: 'Arial', color: '#FFA726'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10011);
      }

      btn.on('pointerdown', () => {
        this.deleteMode = false;
        this.worldScene.setDeleteMode(false);
        this.worldScene.selectBuilding(key);
      });
      btn.on('pointerover', () => {
        btn.setFillStyle(0x37474F);
        this.showTooltip(x, y - 48, building);
      });
      btn.on('pointerout', () => {
        btn.setFillStyle(0x263238);
        this.hideTooltip();
      });

      this.buildButtons.push(btn);
    });

    // delete button as last in the row
    const delIdx = buildingKeys.length;
    const delX = startX + delIdx * (btnW + btnGap);
    const delBtn = this.add.rectangle(delX, y - 5, btnW - 2, 48, 0x8B0000, 1)
      .setScrollFactor(0).setDepth(10010)
      .setStrokeStyle(1, 0xEF5350)
      .setInteractive({ useHandCursor: true });

    this.add.text(delX, y - 12, '🗑️', {
      fontSize: '18px', fontFamily: 'Arial'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10011);

    this.add.text(delX, y + 6, 'Abriss', {
      fontSize: '8px', fontFamily: 'Arial', color: '#EF9A9A'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10011);

    this.delBtn = delBtn;
    delBtn.on('pointerdown', () => {
      this.deleteMode = !this.deleteMode;
      this.worldScene.setDeleteMode(this.deleteMode);
      delBtn.setFillStyle(this.deleteMode ? 0xD32F2F : 0x8B0000);
      if (this.deleteMode) {
        this.worldScene.cancelPlacement();
      }
    });
    delBtn.on('pointerover', () => delBtn.setFillStyle(0xB71C1C));
    delBtn.on('pointerout', () => delBtn.setFillStyle(this.deleteMode ? 0xD32F2F : 0x8B0000));

    // hint
    this.add.text(w / 2, h - menuH - 6,
      '🖱️ Klick = Sammeln/Bauen  |  ⬆️⬇️⬅️➡️ Kamera  |  ESC = Abbrechen  |  🗑️ = Abreissen', {
        fontSize: '11px', fontFamily: 'Arial', color: '#E0E0E0',
        stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setScrollFactor(0).setDepth(10010);
  }

  showTooltip(x, y, building) {
    this.hideTooltip();
    let text = `${building.icon} ${building.description}`;
    if (building.housing) text += `\n🏠 +${building.housing} Bewohner`;
    if (building.workers) text += `\n👷 ${building.workers} Arbeiter`;
    if (building.produces) {
      const prod = Object.entries(building.produces).map(([k,v]) => `+${v}${this.resourceManager.getIcon(k)}`).join(' ');
      text += `\n⚙️ ${prod}`;
    }
    if (building.storageBonus) text += `\n📦 +${building.storageBonus} Lager`;
    if (building.happinessBonus) text += `\n😊 +${building.happinessBonus}% Glueck`;
    if (building.isAirport) text += `\n✈️ Neue Inseln entdecken!`;
    if (building.placeOnWater) text += `\n🌊 Auf Wasser bauen`;

    this.tooltip = this.add.text(x, y, text, {
      fontSize: '11px', fontFamily: 'Arial', color: '#FFFFFF',
      backgroundColor: '#37474F', padding: { x: 8, y: 6 },
      align: 'center', lineSpacing: 4
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(10020);
  }

  hideTooltip() {
    if (this.tooltip) { this.tooltip.destroy(); this.tooltip = null; }
  }

  createWizard() {
    const w = this.cameras.main.width;
    const wizY = 62;

    this.wizardBg = this.add.rectangle(w / 2, wizY, 380, 30, 0x1B5E20, 0.85)
      .setScrollFactor(0).setDepth(10010)
      .setStrokeStyle(1, 0x4CAF50);

    this.wizardText = this.add.text(w / 2, wizY, '🧙 Baue ein Haus damit Leute kommen!', {
      fontSize: '12px', fontFamily: 'Arial', color: '#C8E6C9', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10011);
  }

  updateWizardTip() {
    const tip = this.populationManager.getWizardTip();
    this.wizardText.setText(`🧙 ${tip}`);
    // resize bg to fit text
    this.wizardBg.width = Math.max(380, this.wizardText.width + 30);
  }

  createNotificationArea() {
    this.notifY = 90;
  }

  showNotification(msg) {
    const w = this.cameras.main.width;
    const y = this.notifY;
    this.notifY += 28;

    const bg = this.add.rectangle(w / 2, y, 350, 24, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(10015);
    const txt = this.add.text(w / 2, y, msg, {
      fontSize: '12px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10016);

    this.tweens.add({
      targets: [bg, txt],
      alpha: 0,
      y: y - 20,
      duration: 4000,
      delay: 2000,
      ease: 'Power2',
      onComplete: () => {
        bg.destroy();
        txt.destroy();
        this.notifY = Math.max(90, this.notifY - 28);
      }
    });
  }
}
