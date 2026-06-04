import { cartesianToIso, isoToCartesian, isValidTile, TILE_W, TILE_H, getGridSize, setGridSize } from '../map/IsoHelper.js';
import { generateIslandMap, TILE } from '../map/TileMap.js';
import { placeTreesAndStones } from '../objects/TreePlacer.js';
import ResourceManager from '../resources/ResourceManager.js';
import PopulationManager from '../managers/PopulationManager.js';
import { BUILDINGS } from '../buildings/BuildingManager.js';
import { saveGame, loadGame } from '../managers/SaveManager.js';

// Shared island storage (persists across scene restarts)
const islandStore = {};

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  init(data) {
    this.playerName = data.playerName || 'Leo';
    this.islandNumber = data.islandNumber || 1;
    this.loadFromStore = data.loadFromStore || false;
    this.loadFromSave = data.loadFromSave || false;
  }

  create() {
    const gridSize = getGridSize();
    this.houseVariantCount = 6;

    // placement state
    this.selectedBuilding = null;
    this.ghostSprite = null;
    this._deleteMode = false;

    // offset to center the map
    this.offsetX = this.cameras.main.width / 2;
    this.offsetY = 80;

    // camera
    this.camDragStart = null;
    this.camOffset = { x: 0, y: 0 };

    this.hadPopulation = false;
    this.gameOverShown = false;

    if (this.loadFromSave) {
      this.restoreFromSave();
    } else if (this.loadFromStore && islandStore[this.islandNumber]) {
      this.restoreIsland();
    } else {
      this.resourceManager = new ResourceManager();
      this.populationManager = new PopulationManager(this.resourceManager);
      this.map = generateIslandMap();
      this.occupied = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
      this.treeSprites = {};
      this.stoneSprites = {};
      this.placedBuildings = [];
      this.productionTimers = [];

      this.renderMap();
      this.placeObjects();
    }

    if (this.populationManager.population > 0) this.hadPopulation = true;

    // highlights
    this.highlight = this.add.sprite(0, 0, 'tile_highlight').setOrigin(0.5, 0.5).setVisible(false).setDepth(9999);
    this.deleteHighlight = this.add.sprite(0, 0, 'tile_delete').setOrigin(0.5, 0.5).setVisible(false).setDepth(9998);

    // input
    this.input.on('pointermove', (p) => this.onPointerMove(p));
    this.input.on('pointerdown', (p) => this.onPointerDown(p));
    this.input.on('pointerup', () => { this.camDragStart = null; });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // population tick every 10s
    this.time.addEvent({
      delay: 10000, loop: true,
      callback: () => {
        this.populationManager.tick();
        if (this.populationManager.population > 0) this.hadPopulation = true;
        if (this.hadPopulation && this.populationManager.population === 0 && !this.gameOverShown) {
          this.showGameOver();
        }
      }
    });

    // auto-save every 30s
    this.time.addEvent({
      delay: 30000, loop: true,
      callback: () => saveGame(this)
    });

    // launch UI
    this.scene.launch('UIScene', {
      resourceManager: this.resourceManager,
      populationManager: this.populationManager,
      worldScene: this,
      playerName: this.playerName
    });

    // island number title
    if (this.islandNumber > 1) {
      const title = this.add.text(this.cameras.main.width / 2, 20,
        `✈️ Insel #${this.islandNumber}`, {
          fontSize: '14px', fontFamily: 'Arial', color: '#FFD54F',
          fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10020);
      this.tweens.add({ targets: title, alpha: 0, delay: 3000, duration: 1000 });
    }

    this.cameras.main.fadeIn(500);
  }

  update() {
    const speed = 5;
    if (this.cursors.left.isDown) this.camOffset.x += speed;
    if (this.cursors.right.isDown) this.camOffset.x -= speed;
    if (this.cursors.up.isDown) this.camOffset.y += speed;
    if (this.cursors.down.isDown) this.camOffset.y -= speed;

    this.cameras.main.scrollX = -this.camOffset.x;
    this.cameras.main.scrollY = -this.camOffset.y;

    if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.cancelPlacement();
      this.setDeleteMode(false);
    }
  }

  setDeleteMode(on) {
    this._deleteMode = on;
    if (on) this.cancelPlacement();
    this.deleteHighlight.setVisible(false);
  }

  renderMap() {
    const gridSize = getGridSize();
    const tileKeys = {
      [TILE.GRASS]: 'tile_grass',
      [TILE.WATER]: 'tile_water',
      [TILE.SAND]: 'tile_sand'
    };

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const iso = cartesianToIso(col, row);
        const x = iso.x + this.offsetX;
        const y = iso.y + this.offsetY;
        const tileType = this.map[row][col];
        const sprite = this.add.sprite(x, y, tileKeys[tileType]).setOrigin(0.5, 0.5);
        sprite.setDepth(row + col);

        if (tileType === TILE.WATER) {
          this.tweens.add({
            targets: sprite,
            alpha: { from: 0.85, to: 1 },
            duration: 1500 + Math.random() * 1000,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
          });
        }
      }
    }
  }

  placeObjects() {
    const { trees, stones } = placeTreesAndStones(this.map);

    trees.forEach(t => {
      const iso = cartesianToIso(t.col, t.row);
      const textureKey = t.type === 'palm' ? 'palm' : 'tree';
      const sprite = this.add.sprite(iso.x + this.offsetX, iso.y + this.offsetY - 16, textureKey).setOrigin(0.5, 1);
      sprite.setDepth(t.row + t.col + 1);
      sprite.setData('col', t.col);
      sprite.setData('row', t.row);
      this.treeSprites[`${t.col},${t.row}`] = sprite;
      this.occupied[t.row][t.col] = true;
    });

    stones.forEach(s => {
      const iso = cartesianToIso(s.col, s.row);
      const sprite = this.add.sprite(iso.x + this.offsetX, iso.y + this.offsetY, 'stone').setOrigin(0.5, 0.5);
      sprite.setDepth(s.row + s.col + 1);
      this.stoneSprites[`${s.col},${s.row}`] = sprite;
      this.occupied[s.row][s.col] = true;
    });
  }

  onPointerMove(pointer) {
    const worldX = pointer.x + this.cameras.main.scrollX;
    const worldY = pointer.y + this.cameras.main.scrollY;
    const { col, row } = isoToCartesian(worldX, worldY, this.offsetX, this.offsetY);

    if (isValidTile(col, row)) {
      const iso = cartesianToIso(col, row);
      const px = iso.x + this.offsetX;
      const py = iso.y + this.offsetY;

      if (this._deleteMode) {
        this.highlight.setVisible(false);
        this.deleteHighlight.setPosition(px, py).setVisible(true);
      } else {
        this.deleteHighlight.setVisible(false);
        this.highlight.setPosition(px, py).setVisible(true);
      }

      if (this.ghostSprite && this.selectedBuilding) {
        const building = BUILDINGS[this.selectedBuilding];
        this.ghostSprite.setPosition(px, py + TILE_H / 2).setVisible(true);
        const canPlace = this.canPlaceBuilding(col, row, building);
        this.ghostSprite.setAlpha(canPlace ? 0.6 : 0.3);
        this.ghostSprite.setTint(canPlace ? 0xffffff : 0xff0000);
      }
    } else {
      this.highlight.setVisible(false);
      this.deleteHighlight.setVisible(false);
      if (this.ghostSprite) this.ghostSprite.setVisible(false);
    }

    if (pointer.rightButtonDown()) {
      if (this.camDragStart) {
        this.camOffset.x += pointer.x - this.camDragStart.x;
        this.camOffset.y += pointer.y - this.camDragStart.y;
      }
      this.camDragStart = { x: pointer.x, y: pointer.y };
    }
  }

  onPointerDown(pointer) {
    if (pointer.rightButtonDown()) return;

    const worldX = pointer.x + this.cameras.main.scrollX;
    const worldY = pointer.y + this.cameras.main.scrollY;
    const { col, row } = isoToCartesian(worldX, worldY, this.offsetX, this.offsetY);
    if (!isValidTile(col, row)) return;

    // delete mode
    if (this._deleteMode) {
      this.tryDeleteBuilding(col, row);
      return;
    }

    // building placement
    if (this.selectedBuilding) {
      this.tryPlaceBuilding(col, row);
      return;
    }

    // collect tree
    if (this.treeSprites[`${col},${row}`]) { this.collectTree(col, row); return; }
    // collect stone
    if (this.stoneSprites[`${col},${row}`]) { this.collectStone(col, row); return; }
    // fish
    if (this.map[row][col] === TILE.WATER && this.isAdjacentToLand(col, row)) { this.catchFish(col, row); return; }
    // click airport to travel
    const airport = this.findBuildingAt(col, row, 'airport');
    if (airport) { this.showTravelMenu(); return; }
  }

  // ---- Resource collection ----

  collectTree(col, row) {
    const key = `${col},${row}`;
    const sprite = this.treeSprites[key];
    if (!sprite) return;
    this.resourceManager.add('wood', 3);
    this.showFloatingText(sprite.x, sprite.y - 20, '+3 🪵', '#A1887F');
    this.tweens.add({
      targets: sprite,
      scaleX: 0, scaleY: 0, angle: 15, duration: 400, ease: 'Back.easeIn',
      onComplete: () => {
        sprite.destroy(); delete this.treeSprites[key]; this.occupied[row][col] = false;
        this.time.delayedCall(30000, () => {
          if (!this.occupied[row][col]) this.growTree(col, row);
        });
      }
    });
  }

  growTree(col, row) {
    const iso = cartesianToIso(col, row);
    const sprite = this.add.sprite(iso.x + this.offsetX, iso.y + this.offsetY - 16, 'tree').setOrigin(0.5, 1);
    sprite.setDepth(row + col + 1).setScale(0);
    this.treeSprites[`${col},${row}`] = sprite;
    this.occupied[row][col] = true;
    this.tweens.add({ targets: sprite, scaleX: 1, scaleY: 1, duration: 800, ease: 'Back.easeOut' });
  }

  collectStone(col, row) {
    const key = `${col},${row}`;
    const sprite = this.stoneSprites[key];
    if (!sprite) return;
    this.resourceManager.add('stone', 2);
    this.showFloatingText(sprite.x, sprite.y - 10, '+2 🪨', '#BDBDBD');
    this.tweens.add({
      targets: sprite, scaleX: 0, scaleY: 0, alpha: 0, duration: 300,
      onComplete: () => {
        sprite.destroy(); delete this.stoneSprites[key]; this.occupied[row][col] = false;
        this.time.delayedCall(45000, () => {
          if (!this.occupied[row][col]) this.spawnStone(col, row);
        });
      }
    });
  }

  spawnStone(col, row) {
    const iso = cartesianToIso(col, row);
    const sprite = this.add.sprite(iso.x + this.offsetX, iso.y + this.offsetY, 'stone').setOrigin(0.5, 0.5);
    sprite.setDepth(row + col + 1).setScale(0);
    this.stoneSprites[`${col},${row}`] = sprite;
    this.occupied[row][col] = true;
    this.tweens.add({ targets: sprite, scaleX: 1, scaleY: 1, duration: 500, ease: 'Back.easeOut' });
  }

  catchFish(col, row) {
    const iso = cartesianToIso(col, row);
    const x = iso.x + this.offsetX, y = iso.y + this.offsetY;
    const bobber = this.add.circle(x, y, 4, 0xFF0000).setDepth(10000);
    this.tweens.add({
      targets: bobber, y: y - 5, duration: 500, yoyo: true, repeat: 2,
      onComplete: () => {
        bobber.destroy();
        const amount = 1 + Math.floor(Math.random() * 3);
        this.resourceManager.add('fish', amount);
        this.showFloatingText(x, y - 15, `+${amount} 🐟`, '#64B5F6');
      }
    });
  }

  isAdjacentToLand(col, row) {
    for (const [dc, dr] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nc = col + dc, nr = row + dr;
      if (isValidTile(nc, nr) && this.map[nr][nc] !== TILE.WATER) return true;
    }
    return false;
  }

  // ---- Building system ----

  selectBuilding(buildingKey) {
    this.cancelPlacement();
    this.selectedBuilding = buildingKey;
    const building = BUILDINGS[buildingKey];
    let textureKey = building.textureKey;
    if (buildingKey === 'house') {
      textureKey = `building_house_${Math.floor(Math.random() * this.houseVariantCount)}`;
    }
    this.ghostSprite = this.add.sprite(0, 0, textureKey)
      .setOrigin(0.5, 1).setAlpha(0.6).setDepth(10000).setVisible(false);
  }

  cancelPlacement() {
    this.selectedBuilding = null;
    if (this.ghostSprite) { this.ghostSprite.destroy(); this.ghostSprite = null; }
  }

  canPlaceBuilding(col, row, building) {
    const size = building.size;
    for (let r = row; r < row + size; r++) {
      for (let c = col; c < col + size; c++) {
        if (!isValidTile(c, r)) return false;
        if (this.occupied[r][c]) return false;
        const tile = this.map[r][c];
        if (building.placeOnWater) {
          if (tile !== TILE.WATER) return false;
        } else if (building.isRoad) {
          if (tile === TILE.WATER) return false;
        } else {
          if (tile !== TILE.GRASS) return false;
        }
      }
    }
    return true;
  }

  tryPlaceBuilding(col, row) {
    const buildingKey = this.selectedBuilding;
    const building = BUILDINGS[buildingKey];

    if (!this.canPlaceBuilding(col, row, building)) {
      this.cameras.main.shake(100, 0.005);
      return;
    }
    if (!this.resourceManager.canAfford(building.cost)) {
      this.showFloatingText(this.ghostSprite.x, this.ghostSprite.y - 20, '❌ Nicht genug!', '#FF5252');
      this.cameras.main.shake(100, 0.005);
      return;
    }
    // check workers
    if (building.workers > 0 && !this.populationManager.canAddWorkers(building.workers)) {
      this.showFloatingText(this.ghostSprite.x, this.ghostSprite.y - 20, '❌ Keine freien Arbeiter!', '#FFA726');
      this.cameras.main.shake(100, 0.005);
      return;
    }

    this.resourceManager.spend(building.cost);

    // mark tiles
    for (let r = row; r < row + building.size; r++) {
      for (let c = col; c < col + building.size; c++) {
        this.occupied[r][c] = true;
      }
    }

    // place sprite - houses get random variant
    const iso = cartesianToIso(col, row);
    let textureKey = building.textureKey;
    if (buildingKey === 'house') {
      const variant = Math.floor(Math.random() * this.houseVariantCount);
      textureKey = `building_house_${variant}`;
    }
    const sprite = this.add.sprite(iso.x + this.offsetX, iso.y + this.offsetY + TILE_H / 2, textureKey)
      .setOrigin(0.5, 1).setDepth(row + col + building.size + 1);
    sprite.setScale(0);
    this.tweens.add({ targets: sprite, scaleX: 1, scaleY: 1, duration: 500, ease: 'Back.easeOut' });

    const placedEntry = { sprite, col, row, key: buildingKey, buildingDef: building, timer: null };

    // register with population manager
    this.populationManager.addBuilding({
      key: buildingKey,
      housing: building.housing || 0,
      workers: building.workers || 0
    });

    // storage bonus
    if (building.storageBonus) {
      this.resourceManager.addCapacity(building.storageBonus);
    }

    // production
    if (building.produces) {
      placedEntry.timer = this.startProduction(sprite, building);
    }

    this.placedBuildings.push(placedEntry);

    // floating cost text
    const costParts = Object.entries(building.cost).map(([k, v]) => `-${v}${this.resourceManager.getIcon(k)}`);
    this.showFloatingText(sprite.x, sprite.y - 30, costParts.join(' '), '#FF8A65');

    this.cancelPlacement();
  }

  startProduction(sprite, building) {
    // check if production works (needs workers - already checked before placement)
    return this.time.addEvent({
      delay: building.productionInterval,
      loop: true,
      callback: () => {
        for (const [resource, amount] of Object.entries(building.produces)) {
          this.resourceManager.add(resource, amount);
          this.showFloatingText(sprite.x, sprite.y - 20, `+${amount}${this.resourceManager.getIcon(resource)}`, '#BDBDBD');
        }
      }
    });
  }

  // ---- Delete building ----

  tryDeleteBuilding(col, row) {
    const idx = this.placedBuildings.findIndex(b => {
      const size = b.buildingDef.size;
      return col >= b.col && col < b.col + size && row >= b.row && row < b.row + size;
    });

    if (idx < 0) {
      this.cameras.main.shake(80, 0.003);
      return;
    }

    const entry = this.placedBuildings[idx];
    const building = entry.buildingDef;

    // stop production
    if (entry.timer) entry.timer.remove();

    // free tiles
    for (let r = entry.row; r < entry.row + building.size; r++) {
      for (let c = entry.col; c < entry.col + building.size; c++) {
        this.occupied[r][c] = false;
      }
    }

    // remove from population manager
    this.populationManager.removeBuilding({
      key: entry.key,
      housing: building.housing || 0,
      workers: building.workers || 0
    });

    // remove storage bonus
    if (building.storageBonus) {
      this.resourceManager.removeCapacity(building.storageBonus);
    }

    // refund 50% of resources
    const refund = {};
    for (const [k, v] of Object.entries(building.cost)) {
      refund[k] = Math.floor(v / 2);
    }
    for (const [k, v] of Object.entries(refund)) {
      this.resourceManager.add(k, v);
    }

    // destroy animation
    const sprite = entry.sprite;
    const refundText = Object.entries(refund).map(([k, v]) => `+${v}${this.resourceManager.getIcon(k)}`).join(' ');
    this.showFloatingText(sprite.x, sprite.y - 20, `🗑️ ${refundText}`, '#EF9A9A');

    this.tweens.add({
      targets: sprite,
      scaleX: 0, scaleY: 0, alpha: 0, duration: 300,
      onComplete: () => sprite.destroy()
    });

    this.placedBuildings.splice(idx, 1);
  }

  findBuildingAt(col, row, key) {
    return this.placedBuildings.find(b => {
      if (b.key !== key) return false;
      const size = b.buildingDef.size;
      return col >= b.col && col < b.col + size && row >= b.row && row < b.row + size;
    });
  }

  // ---- Airport / Travel ----

  saveIsland() {
    const gridSize = getGridSize();
    // save building data (without sprites/timers)
    const buildingData = this.placedBuildings.map(b => ({
      col: b.col, row: b.row, key: b.key,
      textureKey: b.sprite.texture.key
    }));
    // save tree positions
    const treeData = Object.entries(this.treeSprites).map(([key, sprite]) => ({
      col: sprite.getData('col'), row: sprite.getData('row'),
      type: sprite.texture.key === 'palm' ? 'palm' : 'tree'
    }));
    // save stone positions
    const stoneData = Object.keys(this.stoneSprites).map(key => {
      const [col, row] = key.split(',').map(Number);
      return { col, row };
    });

    islandStore[this.islandNumber] = {
      gridSize,
      map: this.map.map(row => [...row]),
      occupied: this.occupied.map(row => [...row]),
      buildings: buildingData,
      trees: treeData,
      stones: stoneData,
      resources: {
        wood: this.resourceManager.get('wood'),
        stone: this.resourceManager.get('stone'),
        fish: this.resourceManager.get('fish')
      },
      bonusCapacity: this.resourceManager.bonusCapacity,
      population: this.populationManager.population,
      housingCapacity: this.populationManager.housingCapacity,
      workersAssigned: this.populationManager.workersAssigned,
      happiness: this.populationManager.happiness,
      popBuildings: this.populationManager.buildings.map(b => ({ ...b }))
    };
  }

  restoreIsland() {
    const saved = islandStore[this.islandNumber];

    // restore grid size to IsoHelper module
    setGridSize(saved.gridSize);

    this.resourceManager = new ResourceManager();
    this.resourceManager.resources.wood.amount = saved.resources.wood;
    this.resourceManager.resources.stone.amount = saved.resources.stone;
    this.resourceManager.resources.fish.amount = saved.resources.fish;
    this.resourceManager.bonusCapacity = saved.bonusCapacity;

    this.populationManager = new PopulationManager(this.resourceManager);
    this.populationManager.population = saved.population;
    this.populationManager.housingCapacity = saved.housingCapacity;
    this.populationManager.workersAssigned = saved.workersAssigned;
    this.populationManager.happiness = saved.happiness;
    this.populationManager.buildings = saved.popBuildings.map(b => ({ ...b }));

    // deep-copy map and occupied grid
    this.map = saved.map.map(row => [...row]);
    this.occupied = saved.occupied.map(row => [...row]);
    this.treeSprites = {};
    this.stoneSprites = {};
    this.placedBuildings = [];
    this.productionTimers = [];

    this.renderMap();

    // restore trees
    saved.trees.forEach(t => {
      const iso = cartesianToIso(t.col, t.row);
      const textureKey = t.type === 'palm' ? 'palm' : 'tree';
      const sprite = this.add.sprite(iso.x + this.offsetX, iso.y + this.offsetY - 16, textureKey).setOrigin(0.5, 1);
      sprite.setDepth(t.row + t.col + 1);
      sprite.setData('col', t.col);
      sprite.setData('row', t.row);
      this.treeSprites[`${t.col},${t.row}`] = sprite;
    });

    // restore stones
    saved.stones.forEach(s => {
      const iso = cartesianToIso(s.col, s.row);
      const sprite = this.add.sprite(iso.x + this.offsetX, iso.y + this.offsetY, 'stone').setOrigin(0.5, 0.5);
      sprite.setDepth(s.row + s.col + 1);
      this.stoneSprites[`${s.col},${s.row}`] = sprite;
    });

    // restore buildings
    saved.buildings.forEach(b => {
      const building = BUILDINGS[b.key];
      const iso = cartesianToIso(b.col, b.row);
      const sprite = this.add.sprite(iso.x + this.offsetX, iso.y + this.offsetY + TILE_H / 2, b.textureKey)
        .setOrigin(0.5, 1).setDepth(b.row + b.col + building.size + 1);
      const entry = { sprite, col: b.col, row: b.row, key: b.key, buildingDef: building, timer: null };
      if (building.produces) {
        entry.timer = this.startProduction(sprite, building);
      }
      this.placedBuildings.push(entry);
    });
  }

  restoreFromSave() {
    const saved = loadGame();
    if (!saved) return;

    setGridSize(saved.gridSize);

    this.resourceManager = new ResourceManager();
    this.resourceManager.resources.wood.amount = saved.resources.wood;
    this.resourceManager.resources.stone.amount = saved.resources.stone;
    this.resourceManager.resources.fish.amount = saved.resources.fish;
    this.resourceManager.bonusCapacity = saved.bonusCapacity;

    this.populationManager = new PopulationManager(this.resourceManager);
    this.populationManager.population = saved.population;
    this.populationManager.housingCapacity = saved.housingCapacity;
    this.populationManager.workersAssigned = saved.workersAssigned;
    this.populationManager.happiness = saved.happiness;
    this.populationManager.buildings = saved.popBuildings.map(b => ({ ...b }));

    this.map = saved.map.map(row => [...row]);
    this.occupied = saved.occupied.map(row => [...row]);
    this.treeSprites = {};
    this.stoneSprites = {};
    this.placedBuildings = [];
    this.productionTimers = [];

    this.renderMap();

    saved.trees.forEach(t => {
      const iso = cartesianToIso(t.col, t.row);
      const textureKey = t.type === 'palm' ? 'palm' : 'tree';
      const sprite = this.add.sprite(iso.x + this.offsetX, iso.y + this.offsetY - 16, textureKey).setOrigin(0.5, 1);
      sprite.setDepth(t.row + t.col + 1);
      sprite.setData('col', t.col);
      sprite.setData('row', t.row);
      this.treeSprites[`${t.col},${t.row}`] = sprite;
    });

    saved.stones.forEach(s => {
      const iso = cartesianToIso(s.col, s.row);
      const sprite = this.add.sprite(iso.x + this.offsetX, iso.y + this.offsetY, 'stone').setOrigin(0.5, 0.5);
      sprite.setDepth(s.row + s.col + 1);
      this.stoneSprites[`${s.col},${s.row}`] = sprite;
    });

    saved.buildings.forEach(b => {
      const building = BUILDINGS[b.key];
      const iso = cartesianToIso(b.col, b.row);
      const sprite = this.add.sprite(iso.x + this.offsetX, iso.y + this.offsetY + TILE_H / 2, b.textureKey)
        .setOrigin(0.5, 1).setDepth(b.row + b.col + building.size + 1);
      const entry = { sprite, col: b.col, row: b.row, key: b.key, buildingDef: building, timer: null };
      if (building.produces) {
        entry.timer = this.startProduction(sprite, building);
      }
      this.placedBuildings.push(entry);
    });
  }

  showGameOver() {
    this.gameOverShown = true;
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;
    const popupItems = [];

    // darken background
    const overlay = this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(20000);
    popupItems.push(overlay);

    const bg = this.add.rectangle(cx, cy, 360, 250, 0x1a237e, 0.95)
      .setScrollFactor(0).setDepth(20001).setStrokeStyle(3, 0xEF5350);
    popupItems.push(bg);

    const title = this.add.text(cx, cy - 85, '😢 Deine Insel ist leer!', {
      fontSize: '22px', fontFamily: 'Arial', color: '#EF5350',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20002);
    popupItems.push(title);

    const desc = this.add.text(cx, cy - 45, 'Alle Bewohner haben die Insel verlassen.\nAber gib nicht auf!', {
      fontSize: '13px', fontFamily: 'Arial', color: '#B0BEC5', align: 'center', lineSpacing: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20002);
    popupItems.push(desc);

    // Boost button
    const boostBtn = this.add.rectangle(cx, cy + 15, 280, 50, 0x2E7D32, 1)
      .setScrollFactor(0).setDepth(20002).setStrokeStyle(2, 0x66BB6A)
      .setInteractive({ useHandCursor: true });
    const boostLabel = this.add.text(cx, cy + 8, '🚀 Rettungspaket!', {
      fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20003);
    const boostDesc = this.add.text(cx, cy + 28, '+5 Bewohner  +20 Holz  +15 Stein  +10 Fisch', {
      fontSize: '10px', fontFamily: 'Arial', color: '#A5D6A7'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20003);
    popupItems.push(boostBtn, boostLabel, boostDesc);

    boostBtn.on('pointerover', () => boostBtn.setFillStyle(0x388E3C));
    boostBtn.on('pointerout', () => boostBtn.setFillStyle(0x2E7D32));
    boostBtn.on('pointerdown', () => {
      // apply boost
      this.resourceManager.add('wood', 20);
      this.resourceManager.add('stone', 15);
      this.resourceManager.add('fish', 10);
      // need housing for boost people
      const currentHousing = this.populationManager.housingCapacity;
      if (currentHousing >= 5) {
        this.populationManager.population = Math.min(5, currentHousing);
      } else {
        this.populationManager.population = currentHousing;
      }
      this.populationManager.happiness = 60;
      this.populationManager.notify();
      this.hadPopulation = true;
      this.gameOverShown = false;
      popupItems.forEach(item => item.destroy());
      this.showFloatingText(cx, cy - 50, '🚀 Rettungspaket angekommen!', '#66BB6A');
      saveGame(this);
    });

    // Back to menu button
    const menuBtn = this.add.rectangle(cx, cy + 80, 280, 40, 0x283593, 1)
      .setScrollFactor(0).setDepth(20002).setStrokeStyle(2, 0x5C6BC0)
      .setInteractive({ useHandCursor: true });
    const menuLabel = this.add.text(cx, cy + 80, '🏠 Zurueck zum Menu', {
      fontSize: '15px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20003);
    popupItems.push(menuBtn, menuLabel);

    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x3949AB));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x283593));
    menuBtn.on('pointerdown', () => {
      saveGame(this);
      popupItems.forEach(item => item.destroy());
      this.scene.stop('UIScene');
      this.scene.start('StartScene');
    });
  }

  showTravelMenu() {
    if (this.populationManager.population < 5) {
      this.showFloatingText(this.cameras.main.width / 2, 200,
        '❌ Mindestens 5 Bewohner fuer Flugreisen!', '#FFA726');
      return;
    }

    // build list of destinations
    const destinations = [];
    // can always go to a new island
    const newIslandNum = Math.max(...Object.keys(islandStore).map(Number), this.islandNumber) + 1;

    // existing islands (except current)
    for (const num of Object.keys(islandStore).map(Number).sort((a, b) => a - b)) {
      if (num !== this.islandNumber) {
        destinations.push({ label: `🏝️ Insel #${num}`, islandNumber: num, isNew: false });
      }
    }
    // new island option
    destinations.push({ label: `🌟 Neue Insel #${newIslandNum}`, islandNumber: newIslandNum, isNew: true });

    // create popup overlay
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;
    const popupItems = [];

    const bg = this.add.rectangle(cx, cy, 280, 60 + destinations.length * 45, 0x1a237e, 0.95)
      .setScrollFactor(0).setDepth(20000).setStrokeStyle(2, 0xffd54f);
    popupItems.push(bg);

    const title = this.add.text(cx, cy - (destinations.length * 45) / 2 - 5,
      '✈️ Wohin fliegen?', {
        fontSize: '18px', fontFamily: 'Arial', color: '#FFD54F',
        fontStyle: 'bold', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setScrollFactor(0).setDepth(20001);
    popupItems.push(title);

    destinations.forEach((dest, i) => {
      const y = cy - (destinations.length * 45) / 2 + 35 + i * 45;
      const btn = this.add.rectangle(cx, y, 240, 36, 0x283593, 1)
        .setScrollFactor(0).setDepth(20001).setStrokeStyle(1, 0x5c6bc0).setInteractive({ useHandCursor: true });
      const label = this.add.text(cx, y, dest.label, {
        fontSize: '15px', fontFamily: 'Arial', color: '#FFFFFF',
        fontStyle: 'bold', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setScrollFactor(0).setDepth(20002);

      btn.on('pointerover', () => btn.setFillStyle(0x3949ab));
      btn.on('pointerout', () => btn.setFillStyle(0x283593));
      btn.on('pointerdown', () => {
        popupItems.forEach(item => item.destroy());
        this.travelToIsland(dest.islandNumber, dest.isNew);
      });

      popupItems.push(btn, label);
    });

    // close button
    const closeY = cy + (destinations.length * 45) / 2 + 15;
    const closeBtn = this.add.text(cx, closeY, '❌ Abbrechen', {
      fontSize: '13px', fontFamily: 'Arial', color: '#EF9A9A',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20002).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => popupItems.forEach(item => item.destroy()));
    popupItems.push(closeBtn);

    // adjust bg height
    bg.setSize(280, closeY - (cy - (destinations.length * 45) / 2 - 25) + 20);
  }

  travelToIsland(targetIsland, isNew) {
    // save current island
    this.saveIsland();
    saveGame(this);

    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.scene.stop('UIScene');
      this.scene.start('WorldScene', {
        playerName: this.playerName,
        islandNumber: targetIsland,
        loadFromStore: !isNew
      });
    });
  }

  // ---- Utils ----

  showFloatingText(x, y, text, color) {
    const txt = this.add.text(x, y, text, {
      fontSize: '16px', fontFamily: 'Arial', color, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10001);
    this.tweens.add({
      targets: txt, y: y - 35, alpha: 0, duration: 1200, ease: 'Power2',
      onComplete: () => txt.destroy()
    });
  }
}
