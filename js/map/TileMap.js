import { getGridSize } from './IsoHelper.js';

export const TILE = {
  GRASS: 0,
  WATER: 1,
  SAND: 2
};

export function generateIslandMap() {
  const size = getGridSize();
  const map = [];
  const center = size / 2;
  const islandRadius = size * 0.375;
  const sandWidth = 1.2;

  for (let row = 0; row < size; row++) {
    map[row] = [];
    for (let col = 0; col < size; col++) {
      const dx = col - center;
      const dy = row - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const noise = Math.sin(col * 1.7) * 0.8 + Math.cos(row * 2.3) * 0.6;
      const adjustedDist = dist + noise;

      if (adjustedDist < islandRadius - sandWidth) {
        map[row][col] = TILE.GRASS;
      } else if (adjustedDist < islandRadius) {
        map[row][col] = TILE.SAND;
      } else {
        map[row][col] = TILE.WATER;
      }
    }
  }

  return map;
}
