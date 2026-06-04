import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BUILDINGS } from '../js/buildings/BuildingManager.js';

describe('BUILDINGS definitions', () => {
  const allKeys = Object.keys(BUILDINGS);

  it('should have 13 building types', () => {
    assert.equal(allKeys.length, 13);
  });

  it('should contain all expected building keys', () => {
    const expected = [
      'house', 'road', 'fishingboat', 'lumberjack', 'mine',
      'restaurant', 'shop', 'hospital', 'firestation',
      'warehouse', 'park', 'stadium', 'airport'
    ];
    for (const key of expected) {
      assert.ok(BUILDINGS[key], `Missing building: ${key}`);
    }
  });

  it('every building should have required fields', () => {
    for (const [key, b] of Object.entries(BUILDINGS)) {
      assert.ok(b.name, `${key} missing name`);
      assert.ok(b.textureKey, `${key} missing textureKey`);
      assert.ok(typeof b.size === 'number' && b.size >= 1, `${key} invalid size`);
      assert.ok(b.cost && typeof b.cost === 'object', `${key} missing cost`);
      assert.ok(b.icon, `${key} missing icon`);
      assert.ok(b.description, `${key} missing description`);
      assert.ok(typeof b.housing === 'number', `${key} missing housing`);
      assert.ok(typeof b.workers === 'number', `${key} missing workers`);
    }
  });

  it('costs should only reference valid resource types', () => {
    const validResources = ['wood', 'stone', 'fish'];
    for (const [key, b] of Object.entries(BUILDINGS)) {
      for (const resKey of Object.keys(b.cost)) {
        assert.ok(validResources.includes(resKey),
          `${key} has invalid cost resource: ${resKey}`);
      }
      for (const amount of Object.values(b.cost)) {
        assert.ok(amount > 0, `${key} has non-positive cost amount`);
      }
    }
  });

  it('house should provide housing', () => {
    assert.ok(BUILDINGS.house.housing > 0);
    assert.equal(BUILDINGS.house.workers, 0);
  });

  it('road should have isRoad flag and cost only stone', () => {
    assert.equal(BUILDINGS.road.isRoad, true);
    assert.deepEqual(Object.keys(BUILDINGS.road.cost), ['stone']);
  });

  it('fishingboat should be placeable on water and produce fish', () => {
    assert.equal(BUILDINGS.fishingboat.placeOnWater, true);
    assert.ok(BUILDINGS.fishingboat.produces.fish > 0);
    assert.ok(BUILDINGS.fishingboat.productionInterval > 0);
  });

  it('production buildings should have produces and productionInterval', () => {
    const producers = ['fishingboat', 'lumberjack', 'mine'];
    for (const key of producers) {
      const b = BUILDINGS[key];
      assert.ok(b.produces, `${key} missing produces`);
      assert.ok(b.productionInterval > 0, `${key} missing productionInterval`);
      assert.ok(b.workers > 0, `${key} should require workers`);
    }
  });

  it('service buildings should have happinessBonus', () => {
    const services = ['restaurant', 'shop', 'hospital', 'firestation', 'park', 'stadium'];
    for (const key of services) {
      assert.ok(BUILDINGS[key].happinessBonus > 0, `${key} missing happinessBonus`);
    }
  });

  it('warehouse should have storageBonus', () => {
    assert.equal(BUILDINGS.warehouse.storageBonus, 200);
  });

  it('airport should have isAirport flag and size 3', () => {
    assert.equal(BUILDINGS.airport.isAirport, true);
    assert.equal(BUILDINGS.airport.size, 3);
    assert.equal(BUILDINGS.airport.workers, 5);
  });

  it('multi-tile buildings should have size > 1', () => {
    assert.equal(BUILDINGS.hospital.size, 2);
    assert.equal(BUILDINGS.warehouse.size, 2);
    assert.equal(BUILDINGS.stadium.size, 3);
    assert.equal(BUILDINGS.airport.size, 3);
  });
});
