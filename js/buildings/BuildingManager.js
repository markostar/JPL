export const BUILDINGS = {
  house: {
    name: '🏠', textureKey: 'building_house_0', size: 1,
    cost: { wood: 5, stone: 3 }, icon: '🏠', description: 'Haus',
    housing: 4, workers: 0
  },
  road: {
    name: '🛤️', textureKey: 'tile_road', size: 1,
    cost: { stone: 1 }, icon: '🛤️', description: 'Strasse',
    housing: 0, workers: 0, isRoad: true
  },
  fishingboat: {
    name: '🚣', textureKey: 'building_boat', size: 1,
    cost: { wood: 12, stone: 2 }, icon: '🚣', description: 'Fischerboot',
    housing: 0, workers: 2, produces: { fish: 2 }, productionInterval: 6000,
    placeOnWater: true
  },
  lumberjack: {
    name: '🪓', textureKey: 'building_lumberjack', size: 1,
    cost: { wood: 3, stone: 5 }, icon: '🪓', description: 'Holzfaeller',
    housing: 0, workers: 1, produces: { wood: 2 }, productionInterval: 5000
  },
  mine: {
    name: '⛏️', textureKey: 'building_mine', size: 1,
    cost: { wood: 8, stone: 2 }, icon: '⛏️', description: 'Bergwerk',
    housing: 0, workers: 1, produces: { stone: 1 }, productionInterval: 5000
  },
  restaurant: {
    name: '🍽️', textureKey: 'building_restaurant', size: 1,
    cost: { wood: 8, stone: 6 }, icon: '🍽️', description: 'Restaurant',
    housing: 0, workers: 2, happinessBonus: 8
  },
  shop: {
    name: '🏪', textureKey: 'building_shop', size: 1,
    cost: { wood: 6, stone: 4 }, icon: '🏪', description: 'Shop',
    housing: 0, workers: 1, happinessBonus: 5
  },
  hospital: {
    name: '🏥', textureKey: 'building_hospital', size: 2,
    cost: { wood: 15, stone: 12 }, icon: '🏥', description: 'Krankenhaus',
    housing: 0, workers: 3, happinessBonus: 15
  },
  firestation: {
    name: '🚒', textureKey: 'building_firestation', size: 1,
    cost: { wood: 10, stone: 8 }, icon: '🚒', description: 'Feuerwehr',
    housing: 0, workers: 2, happinessBonus: 10
  },
  warehouse: {
    name: '🏭', textureKey: 'building_warehouse', size: 2,
    cost: { wood: 10, stone: 8 }, icon: '🏭', description: 'Lager (+200)',
    housing: 0, workers: 0, storageBonus: 200
  },
  park: {
    name: '🌳', textureKey: 'building_park', size: 1,
    cost: { wood: 3 }, icon: '🌳', description: 'Park',
    housing: 0, workers: 0, happinessBonus: 10
  },
  stadium: {
    name: '🏟️', textureKey: 'building_stadium', size: 3,
    cost: { wood: 20, stone: 15 }, icon: '🏟️', description: 'Stadion',
    housing: 0, workers: 3, happinessBonus: 25
  },
  airport: {
    name: '✈️', textureKey: 'building_airport', size: 3,
    cost: { wood: 30, stone: 25, fish: 20 }, icon: '✈️', description: 'Flughafen',
    housing: 0, workers: 5, isAirport: true
  }
};
