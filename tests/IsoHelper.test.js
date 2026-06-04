import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  TILE_W, TILE_H,
  cartesianToIso, isoToCartesian,
  isValidTile, setGridSize, getGridSize
} from '../js/map/IsoHelper.js';

describe('IsoHelper constants', () => {
  it('TILE_W should be 64', () => {
    assert.equal(TILE_W, 64);
  });

  it('TILE_H should be 32', () => {
    assert.equal(TILE_H, 32);
  });
});

describe('setGridSize / getGridSize', () => {
  it('should set and get grid size', () => {
    setGridSize(20);
    assert.equal(getGridSize(), 20);
    setGridSize(30);
    assert.equal(getGridSize(), 30);
    setGridSize(45);
    assert.equal(getGridSize(), 45);
  });
});

describe('cartesianToIso', () => {
  it('should convert (0,0) to origin', () => {
    const iso = cartesianToIso(0, 0);
    assert.equal(iso.x, 0);
    assert.equal(iso.y, 0);
  });

  it('should convert col=1, row=0 correctly', () => {
    const iso = cartesianToIso(1, 0);
    assert.equal(iso.x, TILE_W / 2);  // 32
    assert.equal(iso.y, TILE_H / 2);  // 16
  });

  it('should convert col=0, row=1 correctly', () => {
    const iso = cartesianToIso(0, 1);
    assert.equal(iso.x, -(TILE_W / 2)); // -32
    assert.equal(iso.y, TILE_H / 2);    // 16
  });

  it('should convert col=1, row=1 correctly', () => {
    const iso = cartesianToIso(1, 1);
    assert.equal(iso.x, 0);
    assert.equal(iso.y, TILE_H); // 32
  });

  it('should handle larger coordinates', () => {
    const iso = cartesianToIso(5, 3);
    assert.equal(iso.x, (5 - 3) * (TILE_W / 2)); // 2 * 32 = 64
    assert.equal(iso.y, (5 + 3) * (TILE_H / 2)); // 8 * 16 = 128
  });
});

describe('isoToCartesian', () => {
  it('should be the inverse of cartesianToIso for grid-center positions', () => {
    const offsetX = 480;
    const offsetY = 80;

    // test several known tile positions
    for (const [col, row] of [[0,0],[1,0],[0,1],[3,5],[10,10],[19,19]]) {
      const iso = cartesianToIso(col, row);
      // screen position is iso + offset (matching WorldScene)
      const screenX = iso.x + offsetX;
      const screenY = iso.y + offsetY;
      const result = isoToCartesian(screenX, screenY, offsetX, offsetY);
      assert.equal(result.col, col, `col mismatch for (${col},${row})`);
      assert.equal(result.row, row, `row mismatch for (${col},${row})`);
    }
  });
});

describe('isValidTile', () => {
  beforeEach(() => {
    setGridSize(20);
  });

  it('should return true for valid tiles', () => {
    assert.equal(isValidTile(0, 0), true);
    assert.equal(isValidTile(19, 19), true);
    assert.equal(isValidTile(10, 10), true);
  });

  it('should return false for negative coordinates', () => {
    assert.equal(isValidTile(-1, 0), false);
    assert.equal(isValidTile(0, -1), false);
    assert.equal(isValidTile(-1, -1), false);
  });

  it('should return false for out-of-bounds coordinates', () => {
    assert.equal(isValidTile(20, 0), false);
    assert.equal(isValidTile(0, 20), false);
    assert.equal(isValidTile(20, 20), false);
  });

  it('should respect changed grid size', () => {
    setGridSize(10);
    assert.equal(isValidTile(9, 9), true);
    assert.equal(isValidTile(10, 0), false);
    setGridSize(45);
    assert.equal(isValidTile(44, 44), true);
    assert.equal(isValidTile(45, 0), false);
  });
});
