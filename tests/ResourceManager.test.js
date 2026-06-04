import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import ResourceManager from '../js/resources/ResourceManager.js';

describe('ResourceManager', () => {
  let rm;

  beforeEach(() => {
    rm = new ResourceManager();
  });

  describe('initial state', () => {
    it('should start with correct resource amounts', () => {
      assert.equal(rm.get('wood'), 40);
      assert.equal(rm.get('stone'), 30);
      assert.equal(rm.get('fish'), 15);
    });

    it('should have base capacity of 100', () => {
      assert.equal(rm.capacity, 100);
    });

    it('should start with 0 bonus capacity', () => {
      assert.equal(rm.bonusCapacity, 0);
    });

    it('totalUsed should be sum of all resources', () => {
      assert.equal(rm.totalUsed, 40 + 30 + 15); // 85
    });
  });

  describe('getIcon', () => {
    it('should return correct icons', () => {
      assert.equal(rm.getIcon('wood'), '🪵');
      assert.equal(rm.getIcon('stone'), '🪨');
      assert.equal(rm.getIcon('fish'), '🐟');
    });
  });

  describe('add (shared capacity)', () => {
    it('should add resources when under capacity', () => {
      // totalUsed = 85, capacity = 100, free = 15
      rm.add('wood', 10);
      assert.equal(rm.get('wood'), 50);
    });

    it('should cap at shared capacity (sum of all resources)', () => {
      // totalUsed = 85, capacity = 100, free = 15
      rm.add('wood', 100);
      // only 15 free, so wood goes from 40 to 55
      assert.equal(rm.get('wood'), 55);
      assert.equal(rm.totalUsed, 100);
    });

    it('should not add anything when at capacity', () => {
      // fill to capacity first
      rm.add('wood', 15); // now at 100
      rm.add('fish', 10); // should add 0
      assert.equal(rm.get('fish'), 15); // unchanged
      assert.equal(rm.totalUsed, 100);
    });

    it('shared capacity means one resource filling blocks others', () => {
      rm.add('wood', 15); // total now 100
      rm.add('stone', 5); // should be 0 added
      assert.equal(rm.get('stone'), 30); // unchanged
    });
  });

  describe('spend', () => {
    it('should deduct resources when affordable', () => {
      const result = rm.spend({ wood: 5, stone: 3 });
      assert.equal(result, true);
      assert.equal(rm.get('wood'), 35);
      assert.equal(rm.get('stone'), 27);
    });

    it('should return false and not deduct if not affordable', () => {
      const result = rm.spend({ wood: 999 });
      assert.equal(result, false);
      assert.equal(rm.get('wood'), 40); // unchanged
    });

    it('should not partially deduct on failure (atomic)', () => {
      // can afford wood but not stone
      const result = rm.spend({ wood: 5, stone: 999 });
      assert.equal(result, false);
      assert.equal(rm.get('wood'), 40); // unchanged despite wood being affordable
      assert.equal(rm.get('stone'), 30);
    });

    it('should handle spending all of a resource', () => {
      const result = rm.spend({ fish: 15 });
      assert.equal(result, true);
      assert.equal(rm.get('fish'), 0);
    });
  });

  describe('canAfford', () => {
    it('should return true when resources are sufficient', () => {
      assert.equal(rm.canAfford({ wood: 5, stone: 3 }), true);
      assert.equal(rm.canAfford({ wood: 40, stone: 30, fish: 15 }), true);
    });

    it('should return false when resources are insufficient', () => {
      assert.equal(rm.canAfford({ wood: 41 }), false);
      assert.equal(rm.canAfford({ wood: 5, stone: 31 }), false);
    });

    it('should not modify resources', () => {
      rm.canAfford({ wood: 5 });
      assert.equal(rm.get('wood'), 40);
    });
  });

  describe('capacity management', () => {
    it('addCapacity should increase capacity', () => {
      rm.addCapacity(200);
      assert.equal(rm.capacity, 300);
    });

    it('removeCapacity should decrease capacity', () => {
      rm.addCapacity(200);
      rm.removeCapacity(200);
      assert.equal(rm.capacity, 100);
    });

    it('removeCapacity should not go below 0 bonus', () => {
      rm.removeCapacity(999);
      assert.equal(rm.bonusCapacity, 0);
      assert.equal(rm.capacity, 100);
    });

    it('adding capacity should allow more resources', () => {
      rm.addCapacity(200); // capacity now 300
      rm.add('wood', 100);
      assert.equal(rm.get('wood'), 140); // 40 + 100
      assert.equal(rm.totalUsed, 185); // 140 + 30 + 15
    });
  });

  describe('onChange listener', () => {
    it('should notify listeners on add', () => {
      const calls = [];
      rm.onChange((type, amount) => calls.push({ type, amount }));
      rm.add('wood', 5);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].type, 'wood');
      assert.equal(calls[0].amount, 45);
    });

    it('should notify listeners on spend', () => {
      const calls = [];
      rm.onChange((type, amount) => calls.push({ type, amount }));
      rm.spend({ wood: 5, stone: 3 });
      assert.equal(calls.length, 2);
    });

    it('should notify even when add results in 0 actual change (at capacity)', () => {
      rm.add('wood', 15); // fill to 100
      const calls = [];
      rm.onChange((type, amount) => calls.push({ type, amount }));
      rm.add('fish', 10); // 0 actual change
      assert.equal(calls.length, 1); // still notifies
    });
  });
});
