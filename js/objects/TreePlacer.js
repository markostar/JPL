import { TILE } from '../map/TileMap.js';
import { getGridSize } from '../map/IsoHelper.js';

export function placeTreesAndStones(map) {
  const size = getGridSize();
  const trees = [];
  const stones = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (map[row][col] === TILE.GRASS) {
        const rand = Math.random();
        if (rand < 0.15) {
          trees.push({ col, row, type: 'tree' });
        } else if (rand < 0.20) {
          stones.push({ col, row });
        }
      } else if (map[row][col] === TILE.SAND) {
        if (Math.random() < 0.12) {
          trees.push({ col, row, type: 'palm' });
        }
      }
    }
  }

  return { trees, stones };
}
