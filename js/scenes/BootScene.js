const TILE_W = 64;
const TILE_H = 32;

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // tiles
    this.generateTileTexture('tile_grass', 0x4CAF50, 0x388E3C);
    this.generateTileTexture('tile_sand', 0xFFEB3B, 0xFBC02D);
    this.generateTileTexture('tile_water', 0x2196F3, 0x1976D2);
    this.generateTileTexture('tile_highlight', 0xFFFFFF, 0xCCCCCC, 0.4);
    this.generateTileTexture('tile_delete', 0xFF0000, 0xCC0000, 0.5);
    this.generateRoadTexture();

    // nature
    this.generateTreeTexture();
    this.generatePalmTexture();
    this.generateStoneTexture();

    // buildings - 6 house variants with different colors
    this.houseStyles = [
      { roof: 0xC62828, roofSide: 0xB71C1C, roofDark: 0x8E0000, wall: 0xFFF8E1, wallSide: 0xFFECB3, door: 0x5D4037, window: 0xFFF176 },
      { roof: 0x1565C0, roofSide: 0x0D47A1, roofDark: 0x002171, wall: 0xE3F2FD, wallSide: 0xBBDEFB, door: 0x4E342E, window: 0x80DEEA },
      { roof: 0x2E7D32, roofSide: 0x1B5E20, roofDark: 0x003300, wall: 0xF1F8E9, wallSide: 0xDCEDC8, door: 0x3E2723, window: 0xA5D6A7 },
      { roof: 0xF57F17, roofSide: 0xE65100, roofDark: 0xBF360C, wall: 0xFFF3E0, wallSide: 0xFFE0B2, door: 0x4E342E, window: 0xFFCC80 },
      { roof: 0x7B1FA2, roofSide: 0x6A1B9A, roofDark: 0x4A148C, wall: 0xF3E5F5, wallSide: 0xE1BEE7, door: 0x3E2723, window: 0xCE93D8 },
      { roof: 0x00838F, roofSide: 0x006064, roofDark: 0x004D40, wall: 0xE0F7FA, wallSide: 0xB2EBF2, door: 0x3E2723, window: 0x80DEEA }
    ];
    for (let i = 0; i < this.houseStyles.length; i++) {
      this.generateHouseTexture(`building_house_${i}`, this.houseStyles[i]);
    }
    this.generateWarehouseTexture();
    this.generateMineTexture();
    this.generateLumberjackTexture();
    this.generateBoatTexture();
    this.generateRestaurantTexture();
    this.generateShopTexture();
    this.generateHospitalTexture();
    this.generateFirestationTexture();
    this.generateParkTexture();
    this.generateStadiumTexture();
    this.generateAirportTexture();

    this.scene.start('StartScene');
  }

  generateTileTexture(key, fillColor, strokeColor, alpha = 1) {
    const g = this.add.graphics();
    g.fillStyle(fillColor, alpha);
    g.beginPath();
    g.moveTo(TILE_W / 2, 0);
    g.lineTo(TILE_W, TILE_H / 2);
    g.lineTo(TILE_W / 2, TILE_H);
    g.lineTo(0, TILE_H / 2);
    g.closePath();
    g.fillPath();
    g.lineStyle(1, strokeColor, alpha * 0.6);
    g.beginPath();
    g.moveTo(TILE_W / 2, 0);
    g.lineTo(TILE_W, TILE_H / 2);
    g.lineTo(TILE_W / 2, TILE_H);
    g.lineTo(0, TILE_H / 2);
    g.closePath();
    g.strokePath();
    g.generateTexture(key, TILE_W, TILE_H);
    g.destroy();
  }

  generateRoadTexture() {
    const g = this.add.graphics();
    // base gray diamond
    g.fillStyle(0x78909C);
    g.beginPath();
    g.moveTo(TILE_W / 2, 0);
    g.lineTo(TILE_W, TILE_H / 2);
    g.lineTo(TILE_W / 2, TILE_H);
    g.lineTo(0, TILE_H / 2);
    g.closePath();
    g.fillPath();
    // darker border
    g.lineStyle(1, 0x546E7A);
    g.beginPath();
    g.moveTo(TILE_W / 2, 0);
    g.lineTo(TILE_W, TILE_H / 2);
    g.lineTo(TILE_W / 2, TILE_H);
    g.lineTo(0, TILE_H / 2);
    g.closePath();
    g.strokePath();
    // center dashes
    g.lineStyle(1, 0xFFFFFF, 0.4);
    g.beginPath();
    g.moveTo(TILE_W * 0.35, TILE_H * 0.5);
    g.lineTo(TILE_W * 0.65, TILE_H * 0.5);
    g.strokePath();
    g.generateTexture('tile_road', TILE_W, TILE_H);
    g.destroy();
  }

  generateTreeTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x795548);
    g.fillRect(13, 28, 6, 20);
    g.fillStyle(0x2E7D32);
    g.beginPath(); g.moveTo(16, 0); g.lineTo(30, 20); g.lineTo(2, 20); g.closePath(); g.fillPath();
    g.fillStyle(0x388E3C);
    g.beginPath(); g.moveTo(16, 8); g.lineTo(32, 28); g.lineTo(0, 28); g.closePath(); g.fillPath();
    g.generateTexture('tree', 32, 48);
    g.destroy();
  }

  generatePalmTexture() {
    const g = this.add.graphics();
    g.lineStyle(4, 0x8D6E63);
    g.beginPath(); g.moveTo(20, 52); g.lineTo(18, 36); g.lineTo(22, 22); g.lineTo(20, 14); g.strokePath();
    g.fillStyle(0x4CAF50); g.fillEllipse(20, 10, 28, 14);
    g.fillStyle(0x66BB6A); g.fillEllipse(14, 8, 18, 8); g.fillEllipse(26, 8, 18, 8);
    g.fillStyle(0x795548); g.fillCircle(20, 15, 3); g.fillCircle(17, 13, 2);
    g.generateTexture('palm', 40, 52);
    g.destroy();
  }

  generateStoneTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x9E9E9E); g.fillEllipse(12, 12, 22, 14);
    g.fillStyle(0x757575); g.fillEllipse(8, 10, 12, 10);
    g.fillStyle(0xBDBDBD); g.fillEllipse(16, 8, 10, 8);
    g.generateTexture('stone', 24, 18);
    g.destroy();
  }

  generateHouseTexture(key, style) {
    const bw = TILE_W, bh = TILE_H;
    const wallH = 14, roofH = 10;
    const texH = bh + wallH + roofH;
    const g = this.add.graphics();

    // left wall
    g.fillStyle(style.wall);
    g.beginPath(); g.moveTo(0, bh/2+roofH); g.lineTo(bw/2, bh+roofH); g.lineTo(bw/2, bh+roofH+wallH); g.lineTo(0, bh/2+roofH+wallH); g.closePath(); g.fillPath();
    // right wall
    g.fillStyle(style.wallSide);
    g.beginPath(); g.moveTo(bw, bh/2+roofH); g.lineTo(bw/2, bh+roofH); g.lineTo(bw/2, bh+roofH+wallH); g.lineTo(bw, bh/2+roofH+wallH); g.closePath(); g.fillPath();

    // wall edge line
    g.lineStyle(1, 0x000000, 0.1);
    g.beginPath(); g.moveTo(bw/2, bh+roofH); g.lineTo(bw/2, bh+roofH+wallH); g.strokePath();

    // roof top (compact diamond)
    g.fillStyle(style.roof);
    g.beginPath(); g.moveTo(bw/2, 0); g.lineTo(bw+3, bh/2); g.lineTo(bw/2, bh+1); g.lineTo(-3, bh/2); g.closePath(); g.fillPath();
    // roof left eave
    g.fillStyle(style.roofSide);
    g.beginPath(); g.moveTo(-3, bh/2); g.lineTo(bw/2, bh+1); g.lineTo(bw/2, bh+roofH); g.lineTo(0, bh/2+roofH); g.closePath(); g.fillPath();
    // roof right eave
    g.fillStyle(style.roofDark);
    g.beginPath(); g.moveTo(bw+3, bh/2); g.lineTo(bw/2, bh+1); g.lineTo(bw/2, bh+roofH); g.lineTo(bw, bh/2+roofH); g.closePath(); g.fillPath();

    // windows on left wall
    g.fillStyle(style.window, 0.9);
    g.fillRect(bw*0.1, bh/2+roofH+2, 5, 5);
    g.fillRect(bw*0.28, bh/2+roofH+3, 5, 5);
    // window crosses
    g.lineStyle(1, 0x000000, 0.25);
    g.beginPath(); g.moveTo(bw*0.1+2.5, bh/2+roofH+2); g.lineTo(bw*0.1+2.5, bh/2+roofH+7); g.strokePath();
    g.beginPath(); g.moveTo(bw*0.1, bh/2+roofH+4.5); g.lineTo(bw*0.1+5, bh/2+roofH+4.5); g.strokePath();

    // door on right wall
    g.fillStyle(style.door);
    g.fillRect(bw*0.62, bh+roofH+2, 6, 10);
    // doorknob
    g.fillStyle(0xFFD54F);
    g.fillCircle(bw*0.62+5, bh+roofH+7, 1);

    // window on right wall
    g.fillStyle(style.window, 0.9);
    g.fillRect(bw*0.78, bh/2+roofH+2, 5, 5);
    g.lineStyle(1, 0x000000, 0.25);
    g.beginPath(); g.moveTo(bw*0.78+2.5, bh/2+roofH+2); g.lineTo(bw*0.78+2.5, bh/2+roofH+7); g.strokePath();

    // foundation line
    g.lineStyle(1, 0x000000, 0.15);
    g.beginPath(); g.moveTo(0, bh/2+roofH+wallH); g.lineTo(bw/2, bh+roofH+wallH); g.lineTo(bw, bh/2+roofH+wallH); g.strokePath();

    // fence posts along foundation
    g.lineStyle(1, 0x8D6E63, 0.6);
    for (let i = 0; i < 4; i++) {
      const fx = bw*0.05 + i*6;
      const fy = bh/2+roofH+wallH - i*1.5;
      g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx, fy+4); g.strokePath();
    }
    // fence rail
    g.lineStyle(1, 0x8D6E63, 0.4);
    g.beginPath(); g.moveTo(bw*0.05, bh/2+roofH+wallH+2); g.lineTo(bw*0.05+18, bh/2+roofH+wallH-4); g.strokePath();

    // tiny garden flowers
    const flowers = [0xFF69B4, 0xFFEB3B, 0xFF5722, 0x4CAF50];
    for (let i = 0; i < 4; i++) {
      g.fillStyle(flowers[i]);
      g.fillCircle(bw*0.55 + i*4, bh+roofH+wallH - 1 - (i%2)*2, 1.2);
    }

    g.generateTexture(key, bw+6, texH);
    g.destroy();
  }

  generateWarehouseTexture() {
    const bw = TILE_W*2, bh = TILE_H*2, wallH = 40;
    const g = this.add.graphics();

    g.fillStyle(0x8D6E63);
    g.beginPath(); g.moveTo(bw/2,0); g.lineTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(0,bh/2); g.closePath(); g.fillPath();
    g.fillStyle(0x795548);
    g.beginPath(); g.moveTo(0,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(0,bh/2+wallH); g.closePath(); g.fillPath();
    g.fillStyle(0x5D4037);
    g.beginPath(); g.moveTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(bw,bh/2+wallH); g.closePath(); g.fillPath();
    g.fillStyle(0x3E2723); g.fillRect(bw*0.6, bh*0.7+wallH*0.2, 16, 20);
    g.fillStyle(0xA1887F); g.fillRect(bw*0.1, bh/2+wallH*0.3, 10, 10); g.fillRect(bw*0.1+14, bh/2+wallH*0.3, 10, 10);

    g.generateTexture('building_warehouse', bw, bh+wallH);
    g.destroy();
  }

  generateMineTexture() {
    const bw = TILE_W, bh = TILE_H;
    const g = this.add.graphics();

    g.fillStyle(0x616161);
    g.beginPath(); g.moveTo(bw/2,4); g.lineTo(bw,bh/2+4); g.lineTo(bw/2,bh+4); g.lineTo(0,bh/2+4); g.closePath(); g.fillPath();
    g.fillStyle(0x212121);
    g.beginPath(); g.moveTo(bw/2,bh*0.5); g.lineTo(bw*0.7,bh*0.65); g.lineTo(bw*0.7,bh*0.65+10); g.lineTo(bw*0.3,bh*0.65+10); g.lineTo(bw*0.3,bh*0.65); g.closePath(); g.fillPath();
    g.lineStyle(3, 0x8D6E63);
    g.beginPath(); g.moveTo(bw*0.3,bh*0.65+10); g.lineTo(bw*0.3,bh*0.5); g.lineTo(bw*0.5,bh*0.38); g.lineTo(bw*0.7,bh*0.5); g.lineTo(bw*0.7,bh*0.65+10); g.strokePath();
    g.lineStyle(2, 0xFFD54F);
    g.beginPath(); g.moveTo(bw*0.4,2); g.lineTo(bw*0.55,14); g.strokePath();
    g.beginPath(); g.moveTo(bw*0.35,8); g.lineTo(bw*0.5,4); g.lineTo(bw*0.55,10); g.strokePath();

    g.generateTexture('building_mine', bw, bh+14);
    g.destroy();
  }

  generateLumberjackTexture() {
    const bw = TILE_W, bh = TILE_H;
    const wallH = 22;
    const g = this.add.graphics();

    // small wooden hut
    g.fillStyle(0xA1887F);
    g.beginPath(); g.moveTo(bw/2,4); g.lineTo(bw-4,bh/2); g.lineTo(bw/2,bh-4); g.lineTo(4,bh/2); g.closePath(); g.fillPath();
    // left wall
    g.fillStyle(0x8D6E63);
    g.beginPath(); g.moveTo(4,bh/2); g.lineTo(bw/2,bh-4); g.lineTo(bw/2,bh-4+wallH); g.lineTo(4,bh/2+wallH); g.closePath(); g.fillPath();
    // right wall
    g.fillStyle(0x6D4C41);
    g.beginPath(); g.moveTo(bw-4,bh/2); g.lineTo(bw/2,bh-4); g.lineTo(bw/2,bh-4+wallH); g.lineTo(bw-4,bh/2+wallH); g.closePath(); g.fillPath();
    // log pile on top
    g.fillStyle(0x795548);
    g.fillCircle(bw*0.35, bh*0.35, 4);
    g.fillCircle(bw*0.5, bh*0.3, 4);
    g.fillCircle(bw*0.65, bh*0.35, 4);
    // axe
    g.lineStyle(2, 0x5D4037);
    g.beginPath(); g.moveTo(bw*0.75, 2); g.lineTo(bw*0.75, 18); g.strokePath();
    g.fillStyle(0x9E9E9E);
    g.fillTriangle(bw*0.7, 2, bw*0.8, 2, bw*0.75, 8);

    g.generateTexture('building_lumberjack', bw, bh+wallH);
    g.destroy();
  }

  generateBoatTexture() {
    const bw = TILE_W, bh = TILE_H;
    const g = this.add.graphics();

    // water base
    g.fillStyle(0x1565C0, 0.5);
    g.beginPath(); g.moveTo(bw/2,6); g.lineTo(bw,bh/2+6); g.lineTo(bw/2,bh+6); g.lineTo(0,bh/2+6); g.closePath(); g.fillPath();
    // boat hull (brown)
    g.fillStyle(0x795548);
    g.beginPath();
    g.moveTo(bw*0.2, bh*0.5+4);
    g.lineTo(bw*0.8, bh*0.5+4);
    g.lineTo(bw*0.7, bh*0.5+12);
    g.lineTo(bw*0.3, bh*0.5+12);
    g.closePath();
    g.fillPath();
    // mast
    g.lineStyle(2, 0x5D4037);
    g.beginPath(); g.moveTo(bw*0.5, bh*0.5+4); g.lineTo(bw*0.5, 0); g.strokePath();
    // sail (white triangle)
    g.fillStyle(0xFFFFFF, 0.9);
    g.fillTriangle(bw*0.5, 2, bw*0.5, bh*0.5, bw*0.7, bh*0.35);
    // flag
    g.fillStyle(0xFF5722);
    g.fillTriangle(bw*0.5, 0, bw*0.5, 6, bw*0.6, 3);

    g.generateTexture('building_boat', bw, bh+14);
    g.destroy();
  }

  generateRestaurantTexture() {
    const bw = TILE_W, bh = TILE_H, wallH = 26;
    const g = this.add.graphics();
    // warm orange top
    g.fillStyle(0xFF8F00);
    g.beginPath(); g.moveTo(bw/2,0); g.lineTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(0,bh/2); g.closePath(); g.fillPath();
    // left wall
    g.fillStyle(0xFFF8E1);
    g.beginPath(); g.moveTo(0,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(0,bh/2+wallH); g.closePath(); g.fillPath();
    // right wall
    g.fillStyle(0xFFECB3);
    g.beginPath(); g.moveTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(bw,bh/2+wallH); g.closePath(); g.fillPath();
    // awning stripes on top
    g.lineStyle(2, 0xFFFFFF, 0.5);
    for (let i = 0; i < 3; i++) {
      const t = 0.3 + i * 0.15;
      g.beginPath(); g.moveTo(bw*t, bh*(0.5-t*0.3)+4); g.lineTo(bw*(t+0.12), bh*(0.5-t*0.3)+8); g.strokePath();
    }
    // door
    g.fillStyle(0x5D4037); g.fillRect(bw*0.6, bh+wallH*0.35, 8, 12);
    // plate/window
    g.fillStyle(0xFFF176, 0.9); g.fillCircle(bw*0.2, bh/2+wallH*0.4, 4);
    // fork & knife on top
    g.lineStyle(1.5, 0xFFFFFF, 0.8);
    g.beginPath(); g.moveTo(bw*0.4, bh*0.3); g.lineTo(bw*0.4, bh*0.55); g.strokePath();
    g.beginPath(); g.moveTo(bw*0.5, bh*0.3); g.lineTo(bw*0.5, bh*0.55); g.strokePath();
    g.generateTexture('building_restaurant', bw, bh+wallH);
    g.destroy();
  }

  generateShopTexture() {
    const bw = TILE_W, bh = TILE_H, wallH = 24;
    const g = this.add.graphics();
    // blue-teal top
    g.fillStyle(0x00897B);
    g.beginPath(); g.moveTo(bw/2,0); g.lineTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(0,bh/2); g.closePath(); g.fillPath();
    // left wall
    g.fillStyle(0xE0F2F1);
    g.beginPath(); g.moveTo(0,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(0,bh/2+wallH); g.closePath(); g.fillPath();
    // right wall
    g.fillStyle(0xB2DFDB);
    g.beginPath(); g.moveTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(bw,bh/2+wallH); g.closePath(); g.fillPath();
    // shop window (big)
    g.fillStyle(0x80DEEA, 0.8);
    g.fillRect(bw*0.08, bh/2+wallH*0.15, 14, 10);
    // door
    g.fillStyle(0x004D40); g.fillRect(bw*0.6, bh+wallH*0.3, 7, 12);
    // sign on top
    g.fillStyle(0xFFD54F);
    g.fillRect(bw*0.35, bh*0.25, 14, 6);
    g.generateTexture('building_shop', bw, bh+wallH);
    g.destroy();
  }

  generateHospitalTexture() {
    const bw = TILE_W*2, bh = TILE_H*2, wallH = 38;
    const g = this.add.graphics();
    // white top
    g.fillStyle(0xECEFF1);
    g.beginPath(); g.moveTo(bw/2,0); g.lineTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(0,bh/2); g.closePath(); g.fillPath();
    // left wall
    g.fillStyle(0xFFFFFF);
    g.beginPath(); g.moveTo(0,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(0,bh/2+wallH); g.closePath(); g.fillPath();
    // right wall
    g.fillStyle(0xE0E0E0);
    g.beginPath(); g.moveTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(bw,bh/2+wallH); g.closePath(); g.fillPath();
    // red cross on top
    g.fillStyle(0xE53935);
    g.fillRect(bw/2-2, bh/2-8, 4, 16);
    g.fillRect(bw/2-8, bh/2-2, 16, 4);
    // windows
    g.fillStyle(0xBBDEFB);
    g.fillRect(bw*0.08, bh/2+wallH*0.2, 8, 8);
    g.fillRect(bw*0.08+12, bh/2+wallH*0.2, 8, 8);
    // door
    g.fillStyle(0xE53935); g.fillRect(bw*0.58, bh+wallH*0.35, 12, 16);
    g.generateTexture('building_hospital', bw, bh+wallH);
    g.destroy();
  }

  generateFirestationTexture() {
    const bw = TILE_W, bh = TILE_H, wallH = 28;
    const g = this.add.graphics();
    // red top
    g.fillStyle(0xD32F2F);
    g.beginPath(); g.moveTo(bw/2,0); g.lineTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(0,bh/2); g.closePath(); g.fillPath();
    // left wall
    g.fillStyle(0xFFCDD2);
    g.beginPath(); g.moveTo(0,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(0,bh/2+wallH); g.closePath(); g.fillPath();
    // right wall
    g.fillStyle(0xEF9A9A);
    g.beginPath(); g.moveTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(bw,bh/2+wallH); g.closePath(); g.fillPath();
    // garage door (big)
    g.fillStyle(0xB71C1C);
    g.fillRect(bw*0.55, bh+wallH*0.2, 12, 16);
    // horizontal lines on garage door
    g.lineStyle(1, 0x000000, 0.2);
    for (let i = 0; i < 3; i++) {
      const dy = bh+wallH*0.2+4+i*5;
      g.beginPath(); g.moveTo(bw*0.55, dy); g.lineTo(bw*0.55+12, dy); g.strokePath();
    }
    // siren light on top
    g.fillStyle(0xFFEB3B); g.fillCircle(bw*0.5, bh*0.3, 3);
    // window
    g.fillStyle(0xFFF176, 0.8); g.fillRect(bw*0.12, bh/2+wallH*0.25, 7, 7);
    g.generateTexture('building_firestation', bw, bh+wallH);
    g.destroy();
  }

  generateParkTexture() {
    const bw = TILE_W, bh = TILE_H;
    const g = this.add.graphics();

    // green diamond base
    g.fillStyle(0x66BB6A);
    g.beginPath(); g.moveTo(bw/2,0); g.lineTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(0,bh/2); g.closePath(); g.fillPath();
    g.lineStyle(1, 0x43A047);
    g.beginPath(); g.moveTo(bw/2,0); g.lineTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(0,bh/2); g.closePath(); g.strokePath();
    // flowers
    g.fillStyle(0xFF4081); g.fillCircle(bw*0.3, bh*0.4, 3);
    g.fillStyle(0xFFEB3B); g.fillCircle(bw*0.6, bh*0.35, 3);
    g.fillStyle(0xE040FB); g.fillCircle(bw*0.45, bh*0.6, 3);
    // small tree
    g.fillStyle(0x795548); g.fillRect(bw*0.7-1, bh*0.45, 2, 8);
    g.fillStyle(0x2E7D32); g.fillCircle(bw*0.7, bh*0.4, 5);
    // bench
    g.fillStyle(0x8D6E63); g.fillRect(bw*0.2, bh*0.7, 10, 3);

    g.generateTexture('building_park', bw, bh);
    g.destroy();
  }

  generateStadiumTexture() {
    const bw = TILE_W*3, bh = TILE_H*3, wallH = 50;
    const g = this.add.graphics();

    // field
    g.fillStyle(0x66BB6A);
    g.beginPath(); g.moveTo(bw/2,8); g.lineTo(bw-8,bh/2); g.lineTo(bw/2,bh-8); g.lineTo(8,bh/2); g.closePath(); g.fillPath();
    // field lines
    g.lineStyle(1, 0xFFFFFF, 0.6);
    g.beginPath(); g.moveTo(bw/2,8); g.lineTo(bw-8,bh/2); g.lineTo(bw/2,bh-8); g.lineTo(8,bh/2); g.closePath(); g.strokePath();
    g.beginPath(); g.moveTo(bw*0.25+4,bh*0.25+4); g.lineTo(bw*0.75-4,bh*0.75-4); g.strokePath();
    g.strokeCircle(bw/2, bh/2, 12);
    // walls
    g.fillStyle(0x7B1FA2);
    g.beginPath(); g.moveTo(0,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(0,bh/2+wallH); g.closePath(); g.fillPath();
    g.fillStyle(0x6A1B9A);
    g.beginPath(); g.moveTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(bw/2,bh+wallH); g.lineTo(bw,bh/2+wallH); g.closePath(); g.fillPath();
    // seats
    g.lineStyle(1, 0xCE93D8, 0.5);
    for (let i = 0; i < 4; i++) {
      const y = bh/2+wallH*0.2+i*10;
      g.beginPath(); g.moveTo(4,y); g.lineTo(bw/2-4,y+bh/4); g.strokePath();
      g.beginPath(); g.moveTo(bw-4,y); g.lineTo(bw/2+4,y+bh/4); g.strokePath();
    }

    g.generateTexture('building_stadium', bw, bh+wallH);
    g.destroy();
  }

  generateAirportTexture() {
    const bw = TILE_W*3, bh = TILE_H*3;
    const towerH = 30;
    const g = this.add.graphics();

    // flat runway (dark asphalt diamond)
    g.fillStyle(0x37474F);
    g.beginPath(); g.moveTo(bw/2,0); g.lineTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(0,bh/2); g.closePath(); g.fillPath();

    // runway edge markings
    g.lineStyle(1, 0xFFFFFF, 0.3);
    g.beginPath(); g.moveTo(bw/2,0); g.lineTo(bw,bh/2); g.lineTo(bw/2,bh); g.lineTo(0,bh/2); g.closePath(); g.strokePath();

    // center runway line (dashed white)
    g.lineStyle(2, 0xFFFFFF, 0.7);
    const cx = bw/2, cy = bh/2;
    for (let i = -3; i <= 3; i++) {
      const dx = i * 12;
      const dy = i * 6;
      g.beginPath(); g.moveTo(cx+dx-4, cy+dy-2); g.lineTo(cx+dx+4, cy+dy+2); g.strokePath();
    }

    // threshold markings at ends
    g.lineStyle(2, 0xFFFFFF, 0.5);
    for (let i = 0; i < 3; i++) {
      g.beginPath(); g.moveTo(bw*0.15+i*8, bh*0.42+i*4); g.lineTo(bw*0.15+i*8+5, bh*0.42+i*4+3); g.strokePath();
    }
    for (let i = 0; i < 3; i++) {
      g.beginPath(); g.moveTo(bw*0.7+i*8, bh*0.42-i*4+6); g.lineTo(bw*0.7+i*8+5, bh*0.42-i*4+3+6); g.strokePath();
    }

    // taxiway (lighter strip)
    g.fillStyle(0x546E7A, 0.6);
    g.beginPath();
    g.moveTo(bw*0.3, bh*0.7); g.lineTo(bw*0.5, bh*0.8);
    g.lineTo(bw*0.5, bh*0.85); g.lineTo(bw*0.28, bh*0.74);
    g.closePath(); g.fillPath();

    // small terminal building (flat, on the side)
    g.fillStyle(0x78909C);
    g.fillRect(bw*0.12, bh*0.55, 22, 12);
    // terminal windows
    g.fillStyle(0xB0BEC5);
    for (let i = 0; i < 3; i++) {
      g.fillRect(bw*0.12+3+i*7, bh*0.55+3, 4, 6);
    }

    // control tower (tall, thin)
    g.fillStyle(0x90A4AE);
    g.fillRect(bw*0.08, bh*0.25, 10, towerH);
    // tower cab (glass top)
    g.fillStyle(0x64FFDA);
    g.fillRect(bw*0.08-2, bh*0.25-6, 14, 8);
    // tower roof
    g.fillStyle(0x455A64);
    g.fillRect(bw*0.08-3, bh*0.25-8, 16, 3);

    // plane on runway (white, detailed)
    g.fillStyle(0xFFFFFF, 0.9);
    // fuselage
    g.fillRect(bw*0.52, bh*0.42, 24, 4);
    // nose
    g.fillTriangle(bw*0.52+24, bh*0.42, bw*0.52+24, bh*0.42+4, bw*0.52+30, bh*0.42+2);
    // wings
    g.fillTriangle(bw*0.52+8, bh*0.42, bw*0.52+16, bh*0.42, bw*0.52+12, bh*0.42-8);
    g.fillTriangle(bw*0.52+8, bh*0.42+4, bw*0.52+16, bh*0.42+4, bw*0.52+12, bh*0.42+12);
    // tail
    g.fillTriangle(bw*0.52, bh*0.42, bw*0.52+4, bh*0.42, bw*0.52, bh*0.42-5);

    // windsock
    g.lineStyle(1, 0x795548);
    g.beginPath(); g.moveTo(bw*0.85, bh*0.3); g.lineTo(bw*0.85, bh*0.3-10); g.strokePath();
    g.fillStyle(0xFF5722);
    g.fillTriangle(bw*0.85, bh*0.3-10, bw*0.85, bh*0.3-7, bw*0.85+7, bh*0.3-9);

    g.generateTexture('building_airport', bw, bh + 4);
    g.destroy();
  }
}
