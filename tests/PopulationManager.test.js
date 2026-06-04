import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import ResourceManager from '../js/resources/ResourceManager.js';
import PopulationManager from '../js/managers/PopulationManager.js';

describe('PopulationManager', () => {
  let rm, pm;

  beforeEach(() => {
    rm = new ResourceManager();
    pm = new PopulationManager(rm);
  });

  describe('initial state', () => {
    it('should start with 0 population', () => {
      assert.equal(pm.population, 0);
    });

    it('should start with 0 housing capacity', () => {
      assert.equal(pm.housingCapacity, 0);
    });

    it('should start with 0 workers assigned', () => {
      assert.equal(pm.workersAssigned, 0);
    });

    it('should start with 80 happiness', () => {
      assert.equal(pm.happiness, 80);
    });

    it('freeWorkers should be 0 initially', () => {
      assert.equal(pm.freeWorkers, 0);
    });

    it('maxPopulation should equal housingCapacity', () => {
      assert.equal(pm.maxPopulation, pm.housingCapacity);
    });
  });

  describe('addBuilding', () => {
    it('should increase housing capacity for houses', () => {
      pm.addBuilding({ key: 'house', housing: 4, workers: 0 });
      assert.equal(pm.housingCapacity, 4);
    });

    it('should increase workers assigned for worker buildings', () => {
      pm.population = 5;
      pm.housingCapacity = 10;
      pm.addBuilding({ key: 'fishingboat', housing: 0, workers: 2 });
      assert.equal(pm.workersAssigned, 2);
    });

    it('should track buildings in array', () => {
      pm.addBuilding({ key: 'house', housing: 4, workers: 0 });
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      assert.equal(pm.buildings.length, 2);
    });

    it('multiple houses should stack housing', () => {
      pm.addBuilding({ key: 'house', housing: 4, workers: 0 });
      pm.addBuilding({ key: 'house', housing: 4, workers: 0 });
      assert.equal(pm.housingCapacity, 8);
    });
  });

  describe('removeBuilding', () => {
    it('should decrease housing capacity', () => {
      const building = { key: 'house', housing: 4, workers: 0 };
      pm.addBuilding(building);
      pm.removeBuilding(building);
      assert.equal(pm.housingCapacity, 0);
    });

    it('should decrease workers assigned', () => {
      pm.population = 10;
      pm.housingCapacity = 10;
      const building = { key: 'fishingboat', housing: 0, workers: 2 };
      pm.addBuilding(building);
      pm.removeBuilding(building);
      assert.equal(pm.workersAssigned, 0);
    });

    it('should cap population to new housing capacity', () => {
      const building = { key: 'house', housing: 4, workers: 0 };
      pm.addBuilding(building);
      pm.population = 4;
      pm.removeBuilding(building);
      assert.equal(pm.population, 0); // capped to 0 housing
    });
  });

  describe('freeWorkers', () => {
    it('should be population minus workers assigned', () => {
      pm.population = 10;
      pm.workersAssigned = 3;
      assert.equal(pm.freeWorkers, 7);
    });

    it('should never be negative', () => {
      pm.population = 2;
      pm.workersAssigned = 5;
      assert.equal(pm.freeWorkers, 0);
    });
  });

  describe('canAddWorkers', () => {
    it('should return true when enough free workers', () => {
      pm.population = 10;
      pm.workersAssigned = 3;
      assert.equal(pm.canAddWorkers(5), true);
    });

    it('should return false when not enough free workers', () => {
      pm.population = 10;
      pm.workersAssigned = 8;
      assert.equal(pm.canAddWorkers(5), false);
    });

    it('should return true for exact match', () => {
      pm.population = 10;
      pm.workersAssigned = 7;
      assert.equal(pm.canAddWorkers(3), true);
    });
  });

  describe('countBuilding', () => {
    it('should count buildings by key', () => {
      pm.addBuilding({ key: 'house', housing: 4, workers: 0 });
      pm.addBuilding({ key: 'house', housing: 4, workers: 0 });
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      assert.equal(pm.countBuilding('house'), 2);
      assert.equal(pm.countBuilding('shop'), 1);
      assert.equal(pm.countBuilding('restaurant'), 0);
    });
  });

  describe('getServicePenalty', () => {
    it('should return 0 for small population', () => {
      pm.population = 4;
      assert.equal(pm.getServicePenalty(), 0);
    });

    it('should penalize missing shop at 5+ population', () => {
      pm.population = 5;
      assert.equal(pm.getServicePenalty(), 3);
    });

    it('should not penalize shop if one exists', () => {
      pm.population = 5;
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      assert.equal(pm.getServicePenalty(), 0);
    });

    it('should penalize missing restaurant at 8+ population', () => {
      pm.housingCapacity = 30;
      pm.population = 8;
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      // missing restaurant: +4
      assert.equal(pm.getServicePenalty(), 4);
    });

    it('should penalize missing firestation at 12+ population', () => {
      pm.housingCapacity = 30;
      pm.population = 12;
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      pm.addBuilding({ key: 'restaurant', housing: 0, workers: 2 });
      // missing firestation: +4
      assert.equal(pm.getServicePenalty(), 4);
    });

    it('should penalize missing hospital at 16+ population', () => {
      pm.housingCapacity = 30;
      pm.population = 16;
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      pm.addBuilding({ key: 'restaurant', housing: 0, workers: 2 });
      pm.addBuilding({ key: 'firestation', housing: 0, workers: 2 });
      // missing hospital: +5
      assert.equal(pm.getServicePenalty(), 5);
    });

    it('should penalize missing park/stadium at 25+ population', () => {
      pm.housingCapacity = 30;
      pm.population = 25;
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      pm.addBuilding({ key: 'restaurant', housing: 0, workers: 2 });
      pm.addBuilding({ key: 'firestation', housing: 0, workers: 2 });
      pm.addBuilding({ key: 'hospital', housing: 0, workers: 3 });
      // missing park/stadium: +3
      assert.equal(pm.getServicePenalty(), 3);
    });

    it('stadium should satisfy park/stadium requirement', () => {
      pm.housingCapacity = 30;
      pm.population = 25;
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      pm.addBuilding({ key: 'restaurant', housing: 0, workers: 2 });
      pm.addBuilding({ key: 'firestation', housing: 0, workers: 2 });
      pm.addBuilding({ key: 'hospital', housing: 0, workers: 3 });
      pm.addBuilding({ key: 'stadium', housing: 0, workers: 3 });
      assert.equal(pm.getServicePenalty(), 0);
    });

    it('should stack all penalties for large population with no services', () => {
      pm.housingCapacity = 30;
      pm.population = 30;
      // shop(3) + restaurant(4) + firestation(4) + hospital(5) + park/stadium(3) = 19
      assert.equal(pm.getServicePenalty(), 19);
    });
  });

  describe('getServiceBonus', () => {
    it('should return 0 with no service buildings', () => {
      assert.equal(pm.getServiceBonus(), 0);
    });

    it('should give bonus for shop', () => {
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      assert.equal(pm.getServiceBonus(), 1);
    });

    it('should give bonus for restaurant', () => {
      pm.addBuilding({ key: 'restaurant', housing: 0, workers: 2 });
      assert.equal(pm.getServiceBonus(), 2);
    });

    it('should cap duplicate bonus (diminishing returns)', () => {
      // 3 shops: capped at 2 * 1 = 2
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      assert.equal(pm.getServiceBonus(), 2); // max 2 shops count
    });

    it('parks should allow up to 3 to count', () => {
      pm.addBuilding({ key: 'park', housing: 0, workers: 0 });
      pm.addBuilding({ key: 'park', housing: 0, workers: 0 });
      pm.addBuilding({ key: 'park', housing: 0, workers: 0 });
      pm.addBuilding({ key: 'park', housing: 0, workers: 0 }); // 4th doesn't count
      assert.equal(pm.getServiceBonus(), 6); // 3 * 2
    });

    it('stadium capped at 1', () => {
      pm.addBuilding({ key: 'stadium', housing: 0, workers: 3 });
      pm.addBuilding({ key: 'stadium', housing: 0, workers: 3 });
      assert.equal(pm.getServiceBonus(), 4); // 1 * 4
    });

    it('should sum bonuses from different service types', () => {
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });      // +1
      pm.addBuilding({ key: 'restaurant', housing: 0, workers: 2 }); // +2
      pm.addBuilding({ key: 'firestation', housing: 0, workers: 2 });// +2
      pm.addBuilding({ key: 'hospital', housing: 0, workers: 3 });   // +3
      pm.addBuilding({ key: 'park', housing: 0, workers: 0 });       // +2
      pm.addBuilding({ key: 'stadium', housing: 0, workers: 3 });    // +4
      assert.equal(pm.getServiceBonus(), 14);
    });
  });

  describe('tick - food consumption', () => {
    beforeEach(() => {
      pm.housingCapacity = 20;
      pm.population = 8;
      pm.happiness = 50;
      // add all required services to avoid service penalties interfering
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      pm.addBuilding({ key: 'restaurant', housing: 0, workers: 2 });
    });

    it('should consume fish (1 per 4 people)', () => {
      // 8 people need ceil(8/4) = 2 fish
      const fishBefore = rm.get('fish');
      pm.tick();
      assert.equal(rm.get('fish'), fishBefore - 2);
    });

    it('should increase happiness when well fed', () => {
      pm.happiness = 50;
      pm.tick();
      // well fed: +2, service bonus from shop(1)+restaurant(2)=3
      // no service penalty (pop=8 has shop+restaurant)
      assert.ok(pm.happiness > 50);
    });

    it('should decrease happiness when not enough fish', () => {
      rm.resources.fish.amount = 1; // not enough for 8 people (need 2)
      pm.happiness = 50;
      pm.tick();
      // partial fish: -8, then service bonus +3
      assert.ok(pm.happiness < 50);
    });

    it('should heavily decrease happiness when no fish at all', () => {
      rm.resources.fish.amount = 0;
      pm.happiness = 50;
      pm.tick();
      // no fish: -15, then service bonus +3 = net -12
      assert.ok(pm.happiness <= 38);
    });

    it('happiness should not exceed 100', () => {
      pm.happiness = 99;
      pm.tick();
      assert.ok(pm.happiness <= 100);
    });

    it('happiness should not go below 0', () => {
      rm.resources.fish.amount = 0;
      pm.happiness = 5;
      pm.tick();
      assert.ok(pm.happiness >= 0);
    });
  });

  describe('tick - people leaving', () => {
    beforeEach(() => {
      pm.housingCapacity = 20;
      pm.population = 5;
    });

    it('should remove 1 person when happiness <= 20', () => {
      pm.happiness = 20;
      rm.resources.fish.amount = 50; // enough food
      // need to neutralize service effects
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      pm.tick();
      // After food (+2), service penalty, service bonus, then leaving check
      // happiness after food: 22, penalty for pop=5 no restaurant: 0 (need 8+), bonus: shop=1 → 23
      // 23 > 20, so nobody should leave in this specific case
      // Let's set happiness lower
      pm.happiness = 15;
      const popBefore = pm.population;
      pm.tick();
      // after food: 17, bonus +1 = 18, still <= 20 → 1 leaves
      assert.ok(pm.population < popBefore);
    });

    it('should remove 2 people when happiness <= 5', () => {
      pm.happiness = 3;
      rm.resources.fish.amount = 50;
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      pm.tick();
      // after food: 5, bonus +1 = 6, > 5 so only 1 leaves
      // Let's use a scenario where happiness stays <= 5
      pm.happiness = 0;
      rm.resources.fish.amount = 0; // no food: -15
      pm.population = 5;
      pm.tick();
      // happiness: 0 - 15 = 0 (clamped), penalty for missing restaurant at 5 pop: 0, bonus +1 → 1
      // 1 <= 5 → 2 people leave
      assert.ok(pm.population <= 3);
    });
  });

  describe('tick - people arriving', () => {
    beforeEach(() => {
      pm.housingCapacity = 20;
      pm.population = 5;
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      pm.addBuilding({ key: 'restaurant', housing: 0, workers: 2 });
    });

    it('should add 2 people when happiness >= 80 and fish >= 2', () => {
      pm.happiness = 80;
      rm.resources.fish.amount = 50;
      pm.tick();
      // food consumed: ceil(5/4)=2, happiness: 82, service bonus +3 = 85
      // 85 >= 80 → 2 arrive → population should increase
      assert.ok(pm.population > 5);
    });

    it('should add 1 person when happiness 60-79 and fish >= 2', () => {
      pm.happiness = 65;
      rm.resources.fish.amount = 50;
      const popBefore = pm.population;
      pm.tick();
      // food: +2 → 67, bonus +3 → 70, 60-79 range → 1 arrives
      assert.ok(pm.population > popBefore);
    });

    it('should not add people when happiness < 40', () => {
      pm.happiness = 30;
      rm.resources.fish.amount = 50;
      pm.tick();
      // food: +2 → 32, bonus +3 → 35, < 40 → nobody comes
      // also nobody leaves since 35 > 20
      assert.equal(pm.population, 5);
    });

    it('should not add people when no housing available', () => {
      pm.housingCapacity = 5;
      pm.population = 5;
      pm.happiness = 90;
      rm.resources.fish.amount = 50;
      pm.tick();
      assert.equal(pm.population, 5);
    });

    it('should not add people when fish < 2', () => {
      pm.happiness = 90;
      rm.resources.fish.amount = 2; // will be consumed by food
      pm.tick();
      // food consumes ceil(5/4)=2, leaving 0 fish → nobody arrives
      assert.equal(pm.population, 5);
    });
  });

  describe('tick - service penalties applied', () => {
    it('should apply service penalty for missing buildings', () => {
      pm.housingCapacity = 20;
      pm.population = 10;
      pm.happiness = 60;
      rm.resources.fish.amount = 50;
      // no shop (need at pop 5+) → -3, no restaurant (need at pop 8+) → -4
      pm.tick();
      // food: +2 → 62, penalty -7 → 55, no bonus → 55
      assert.ok(pm.happiness < 60);
    });
  });

  describe('tick - no population', () => {
    it('should not consume food with 0 population', () => {
      pm.population = 0;
      const fishBefore = rm.get('fish');
      pm.tick();
      assert.equal(rm.get('fish'), fishBefore);
    });

    it('should not apply service bonus with 0 population', () => {
      pm.population = 0;
      pm.happiness = 50;
      pm.addBuilding({ key: 'shop', housing: 0, workers: 1 });
      pm.tick();
      assert.equal(pm.happiness, 50); // unchanged
    });
  });

  describe('onChange / onNotification', () => {
    it('should call onChange listeners on notify', () => {
      const calls = [];
      pm.onChange((p) => calls.push(p));
      pm.notify();
      assert.equal(calls.length, 1);
      assert.equal(calls[0], pm);
    });

    it('should call onNotification listeners on sendNotification', () => {
      const msgs = [];
      pm.onNotification((msg) => msgs.push(msg));
      pm.sendNotification('test');
      assert.equal(msgs.length, 1);
      assert.equal(msgs[0], 'test');
    });

    it('tick should send notifications when food runs out', () => {
      const msgs = [];
      pm.onNotification((msg) => msgs.push(msg));
      pm.population = 4;
      pm.housingCapacity = 10;
      rm.resources.fish.amount = 0;
      pm.tick();
      assert.ok(msgs.some(m => m.includes('Kein Essen')));
    });
  });

  describe('getWizardTip', () => {
    it('should suggest building a house when no housing', () => {
      const tip = pm.getWizardTip();
      assert.ok(tip.includes('Haus'));
    });

    it('should suggest fish when low on fish with population', () => {
      pm.housingCapacity = 10;
      pm.population = 5;
      rm.resources.fish.amount = 2;
      const tip = pm.getWizardTip();
      assert.ok(tip.includes('Fische'));
    });

    it('should suggest more houses when no free workers', () => {
      pm.housingCapacity = 4;
      pm.population = 4;
      pm.workersAssigned = 4;
      rm.resources.fish.amount = 50;
      const tip = pm.getWizardTip();
      assert.ok(tip.includes('Haeuser'));
    });

    it('should suggest production buildings when many free workers', () => {
      pm.housingCapacity = 10;
      pm.population = 5;
      pm.workersAssigned = 1;
      pm.addBuilding({ key: 'lumberjack', housing: 0, workers: 1 });
      rm.resources.fish.amount = 50;
      const tip = pm.getWizardTip();
      assert.ok(tip.includes('Bergwerk') || tip.includes('Holzfaeller') || tip.includes('Arbeiter'));
    });

    it('should suggest shop at 5+ population', () => {
      pm.housingCapacity = 20;
      pm.population = 5;
      // add production buildings directly to buildings array to avoid recalculate issues
      pm.buildings.push({ key: 'lumberjack', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'mine', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'fishingboat', housing: 0, workers: 2 });
      pm.workersAssigned = 4;
      rm.resources.fish.amount = 50;
      const tip = pm.getWizardTip();
      assert.ok(tip.includes('Shop'), `Expected Shop tip, got: ${tip}`);
    });

    it('should suggest restaurant at 8+ population', () => {
      pm.housingCapacity = 20;
      pm.population = 8;
      pm.buildings.push({ key: 'lumberjack', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'mine', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'fishingboat', housing: 0, workers: 2 });
      pm.buildings.push({ key: 'shop', housing: 0, workers: 1 });
      pm.workersAssigned = 6; // freeWorkers = 2 (< 3, skips "free workers" tip)
      rm.resources.fish.amount = 50;
      const tip = pm.getWizardTip();
      assert.ok(tip.includes('Restaurant'), `Expected Restaurant tip, got: ${tip}`);
    });

    it('should suggest firestation at 12+ population', () => {
      pm.housingCapacity = 20;
      pm.population = 12;
      pm.buildings.push({ key: 'lumberjack', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'mine', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'fishingboat', housing: 0, workers: 2 });
      pm.buildings.push({ key: 'shop', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'restaurant', housing: 0, workers: 2 });
      pm.workersAssigned = 10; // freeWorkers = 2
      rm.resources.fish.amount = 50;
      const tip = pm.getWizardTip();
      assert.ok(tip.includes('Feuerwehr'), `Expected Feuerwehr tip, got: ${tip}`);
    });

    it('should suggest hospital at 16+ population', () => {
      pm.housingCapacity = 20;
      pm.population = 16;
      pm.buildings.push({ key: 'lumberjack', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'mine', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'fishingboat', housing: 0, workers: 2 });
      pm.buildings.push({ key: 'shop', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'restaurant', housing: 0, workers: 2 });
      pm.buildings.push({ key: 'firestation', housing: 0, workers: 2 });
      pm.workersAssigned = 14; // freeWorkers = 2
      rm.resources.fish.amount = 50;
      const tip = pm.getWizardTip();
      assert.ok(tip.includes('Krankenhaus'), `Expected Krankenhaus tip, got: ${tip}`);
    });

    it('should suggest airport at 10+ population with all services', () => {
      pm.housingCapacity = 20;
      pm.population = 10;
      pm.buildings.push({ key: 'lumberjack', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'mine', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'fishingboat', housing: 0, workers: 2 });
      pm.buildings.push({ key: 'shop', housing: 0, workers: 1 });
      pm.buildings.push({ key: 'restaurant', housing: 0, workers: 2 });
      pm.workersAssigned = 8; // freeWorkers = 2
      rm.resources.fish.amount = 50;
      pm.happiness = 60;
      const tip = pm.getWizardTip();
      assert.ok(tip.includes('Flughafen'), `Expected Flughafen tip, got: ${tip}`);
    });

    it('should always return a string', () => {
      const tip = pm.getWizardTip();
      assert.equal(typeof tip, 'string');
      assert.ok(tip.length > 0);
    });
  });
});
