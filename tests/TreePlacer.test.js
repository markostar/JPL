import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setGridSize } from '../js/map/IsoHelper.js';
import { generateIslandMap, TILE } from '../js/map/TileMap.js';
import { placeTreesAndStones } from '../js/objects/TreePlacer.js';

describe('placeTreesAndStones', () => {
  let map;

  beforeEach(() => {
    setGridSize(20);
    map = generateIslandMap();
  });

  it('should return trees and stones arrays', () => {
    const result = placeTreesAndStones(map);
    assert.ok(Array.isArray(result.trees));
    assert.ok(Array.isArray(result.stones));
  });

  it('should place trees only on GRASS or SAND tiles', () => {
    const { trees } = placeTreesAndStones(map);
    for (const tree of trees) {
      const tile = map[tree.row][tree.col];
      assert.ok(tile === TILE.GRASS || tile === TILE.SAND,
        `Tree at (${tree.col},${tree.row}) is on tile type ${tile}`);
    }
  });

  it('should place stones only on GRASS tiles', () => {
    const { stones } = placeTreesAndStones(map);
    for (const stone of stones) {
      assert.equal(map[stone.row][stone.col], TILE.GRASS,
        `Stone at (${stone.col},${stone.row}) is not on GRASS`);
    }
  });

  it('trees on GRASS should be type "tree"', () => {
    const { trees } = placeTreesAndStones(map);
    const grassTrees = trees.filter(t => map[t.row][t.col] === TILE.GRASS);
    for (const tree of grassTrees) {
      assert.equal(tree.type, 'tree');
    }
  });

  it('trees on SAND should be type "palm"', () => {
    const { trees } = placeTreesAndStones(map);
    const sandTrees = trees.filter(t => map[t.row][t.col] === TILE.SAND);
    for (const tree of sandTrees) {
      assert.equal(tree.type, 'palm');
    }
  });

  it('should have valid col/row within grid bounds', () => {
    const { trees, stones } = placeTreesAndStones(map);
    for (const obj of [...trees, ...stones]) {
      assert.ok(obj.col >= 0 && obj.col < 20, `col ${obj.col} out of bounds`);
      assert.ok(obj.row >= 0 && obj.row < 20, `row ${obj.row} out of bounds`);
    }
  });

  it('should place a reasonable number of objects (not zero, not all tiles)', () => {
    // run multiple times to account for randomness
    let totalTrees = 0;
    let totalStones = 0;
    const runs = 5;
    for (let i = 0; i < runs; i++) {
      const { trees, stones } = placeTreesAndStones(map);
      totalTrees += trees.length;
      totalStones += stones.length;
    }
    assert.ok(totalTrees / runs > 5, 'Should place at least some trees on average');
    assert.ok(totalStones / runs > 2, 'Should place at least some stones on average');
    assert.ok(totalTrees / runs < 200, 'Should not place too many trees');
  });
});
