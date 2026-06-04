import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setGridSize, getGridSize } from '../js/map/IsoHelper.js';
import { generateIslandMap, TILE } from '../js/map/TileMap.js';

describe('TILE enum', () => {
  it('should have GRASS, WATER, SAND values', () => {
    assert.equal(TILE.GRASS, 0);
    assert.equal(TILE.WATER, 1);
    assert.equal(TILE.SAND, 2);
  });
});

describe('generateIslandMap', () => {
  beforeEach(() => {
    setGridSize(20);
  });

  it('should return a 2D array of correct size', () => {
    const map = generateIslandMap();
    assert.equal(map.length, 20);
    for (const row of map) {
      assert.equal(row.length, 20);
    }
  });

  it('should only contain valid tile types', () => {
    const map = generateIslandMap();
    const validTiles = [TILE.GRASS, TILE.WATER, TILE.SAND];
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 20; c++) {
        assert.ok(validTiles.includes(map[r][c]),
          `Invalid tile type ${map[r][c]} at (${c},${r})`);
      }
    }
  });

  it('should have water at the corners (far from center)', () => {
    const map = generateIslandMap();
    assert.equal(map[0][0], TILE.WATER);
    assert.equal(map[0][19], TILE.WATER);
    assert.equal(map[19][0], TILE.WATER);
    assert.equal(map[19][19], TILE.WATER);
  });

  it('should have grass near the center', () => {
    const map = generateIslandMap();
    // center of 20x20 is around (10,10)
    assert.equal(map[10][10], TILE.GRASS);
  });

  it('should contain all three tile types', () => {
    const map = generateIslandMap();
    const flat = map.flat();
    assert.ok(flat.includes(TILE.GRASS), 'Map should contain GRASS');
    assert.ok(flat.includes(TILE.WATER), 'Map should contain WATER');
    assert.ok(flat.includes(TILE.SAND), 'Map should contain SAND');
  });

  it('should work with different grid sizes', () => {
    for (const size of [20, 30, 45]) {
      setGridSize(size);
      const map = generateIslandMap();
      assert.equal(map.length, size);
      assert.equal(map[0].length, size);
      // center should be grass
      const mid = Math.floor(size / 2);
      assert.equal(map[mid][mid], TILE.GRASS, `Center of size ${size} should be grass`);
    }
  });
});
