const SAVE_KEY = 'leo_weltbauer_save';

export function hasSaveGame() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function saveGame(worldScene) {
  const gridSize = worldScene.map.length;

  const buildingData = worldScene.placedBuildings.map(b => ({
    col: b.col, row: b.row, key: b.key,
    textureKey: b.sprite.texture.key
  }));

  const treeData = Object.entries(worldScene.treeSprites).map(([key, sprite]) => ({
    col: sprite.getData('col'), row: sprite.getData('row'),
    type: sprite.texture.key === 'palm' ? 'palm' : 'tree'
  }));

  const stoneData = Object.keys(worldScene.stoneSprites).map(key => {
    const [col, row] = key.split(',').map(Number);
    return { col, row };
  });

  const rm = worldScene.resourceManager;
  const pm = worldScene.populationManager;

  const data = {
    version: 1,
    playerName: worldScene.playerName,
    islandNumber: worldScene.islandNumber,
    gridSize,
    map: worldScene.map,
    occupied: worldScene.occupied,
    buildings: buildingData,
    trees: treeData,
    stones: stoneData,
    resources: {
      wood: rm.get('wood'),
      stone: rm.get('stone'),
      fish: rm.get('fish')
    },
    bonusCapacity: rm.bonusCapacity,
    population: pm.population,
    housingCapacity: pm.housingCapacity,
    workersAssigned: pm.workersAssigned,
    happiness: pm.happiness,
    popBuildings: pm.buildings.map(b => ({ ...b })),
    savedAt: Date.now()
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
