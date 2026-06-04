export const TILE_W = 64;
export const TILE_H = 32;

// grid size is set dynamically from the start screen
let gridSize = 30;

export function setGridSize(size) {
  gridSize = size;
}

export function getGridSize() {
  return gridSize;
}

export function cartesianToIso(col, row) {
  return {
    x: (col - row) * (TILE_W / 2),
    y: (col + row) * (TILE_H / 2)
  };
}

export function isoToCartesian(screenX, screenY, offsetX, offsetY) {
  const sx = screenX - offsetX;
  const sy = screenY - offsetY;
  const col = Math.floor((sx / (TILE_W / 2) + sy / (TILE_H / 2)) / 2);
  const row = Math.floor((sy / (TILE_H / 2) - sx / (TILE_W / 2)) / 2);
  return { col, row };
}

export function isValidTile(col, row) {
  return col >= 0 && col < gridSize && row >= 0 && row < gridSize;
}
