export default class PopulationManager {
  constructor(resourceManager) {
    this.resourceManager = resourceManager;
    this.population = 0;
    this.housingCapacity = 0;
    this.workersAssigned = 0;
    this.happiness = 80;
    this.listeners = [];
    this.notifyListeners = [];
    this.buildings = [];
  }

  get freeWorkers() {
    return Math.max(0, this.population - this.workersAssigned);
  }

  get maxPopulation() {
    return this.housingCapacity;
  }

  addBuilding(building) {
    this.buildings.push(building);
    if (building.housing) {
      this.housingCapacity += building.housing;
    }
    if (building.workers) {
      this.workersAssigned += building.workers;
    }
    this.recalculate();
  }

  removeBuilding(building) {
    const idx = this.buildings.indexOf(building);
    if (idx >= 0) this.buildings.splice(idx, 1);
    if (building.housing) {
      this.housingCapacity -= building.housing;
    }
    if (building.workers) {
      this.workersAssigned -= building.workers;
    }
    this.recalculate();
  }

  recalculate() {
    if (this.population > this.housingCapacity) {
      this.population = this.housingCapacity;
    }
    if (this.workersAssigned > this.population) {
      this.workersAssigned = this.population;
    }
    this.notify();
  }

  canAddWorkers(count) {
    return this.freeWorkers >= count;
  }

  // Count how many of a building type exist
  countBuilding(key) {
    return this.buildings.filter(b => b.key === key).length;
  }

  // Calculate what services the population needs based on size
  // Returns a happiness penalty if services are missing
  getServicePenalty() {
    const pop = this.population;
    let penalty = 0;

    // 5+ people: need a shop (-3 per tick without)
    if (pop >= 5 && this.countBuilding('shop') === 0) {
      penalty += 3;
    }
    // 8+ people: need a restaurant (-4 per tick without)
    if (pop >= 8 && this.countBuilding('restaurant') === 0) {
      penalty += 4;
    }
    // 12+ people: need a fire station (-4 per tick without)
    if (pop >= 12 && this.countBuilding('firestation') === 0) {
      penalty += 4;
    }
    // 16+ people: need a hospital (-5 per tick without)
    if (pop >= 16 && this.countBuilding('hospital') === 0) {
      penalty += 5;
    }
    // 25+ people: need a park or stadium (-3 per tick without)
    if (pop >= 25 && this.countBuilding('park') === 0 && this.countBuilding('stadium') === 0) {
      penalty += 3;
    }

    return penalty;
  }

  // Service buildings provide ongoing happiness bonus each tick
  getServiceBonus() {
    let bonus = 0;
    const counts = {};
    for (const b of this.buildings) {
      counts[b.key] = (counts[b.key] || 0) + 1;
    }
    // each service building adds a small ongoing bonus (diminishing for duplicates)
    if (counts.shop) bonus += Math.min(counts.shop, 2) * 1;
    if (counts.restaurant) bonus += Math.min(counts.restaurant, 2) * 2;
    if (counts.firestation) bonus += Math.min(counts.firestation, 2) * 2;
    if (counts.hospital) bonus += Math.min(counts.hospital, 2) * 3;
    if (counts.park) bonus += Math.min(counts.park, 3) * 2;
    if (counts.stadium) bonus += Math.min(counts.stadium, 1) * 4;
    return bonus;
  }

  // called periodically from WorldScene (every 10s)
  tick() {
    const fish = this.resourceManager.get('fish');
    const neededFish = Math.ceil(this.population / 4); // 1 fish per 4 people per tick

    // --- Food consumption ---
    if (this.population > 0 && neededFish > 0) {
      if (fish >= neededFish) {
        this.resourceManager.spend({ fish: neededFish });
        // well fed: small happiness boost
        this.happiness = Math.min(100, this.happiness + 2);
      } else if (fish > 0) {
        this.resourceManager.spend({ fish: fish });
        this.happiness = Math.max(0, this.happiness - 8);
        this.sendNotification('⚠️ Nicht genug Fische! Die Leute sind hungrig!');
      } else {
        // no fish: big happiness drop
        this.happiness = Math.max(0, this.happiness - 15);
        this.sendNotification('🚨 Kein Essen! Die Leute verhungern!');
      }
    }

    // --- Service requirements (graduated) ---
    const servicePenalty = this.getServicePenalty();
    if (servicePenalty > 0) {
      this.happiness = Math.max(0, this.happiness - servicePenalty);
    }

    // --- Service buildings ongoing bonus ---
    const serviceBonus = this.getServiceBonus();
    if (serviceBonus > 0 && this.population > 0) {
      this.happiness = Math.min(100, this.happiness + serviceBonus);
    }

    // --- People leaving when unhappy ---
    if (this.happiness <= 20 && this.population > 0) {
      // more people leave the unhappier they are
      const leavers = this.happiness <= 5 ? 2 : 1;
      const actualLeave = Math.min(leavers, this.population);
      this.population -= actualLeave;
      if (actualLeave === 1) {
        this.sendNotification('😢 Jemand hat die Insel verlassen!');
      } else if (actualLeave > 1) {
        this.sendNotification(`😢 ${actualLeave} Bewohner haben die Insel verlassen!`);
      }
    }

    // --- New people arriving (happiness-based speed) ---
    if (this.population < this.housingCapacity) {
      const fishAvailable = this.resourceManager.get('fish');
      if (fishAvailable >= 2) {
        if (this.happiness >= 80) {
          // very happy: 2 people arrive
          const space = this.housingCapacity - this.population;
          const arrive = Math.min(2, space);
          this.population += arrive;
          this.sendNotification(`🎉 ${arrive} neue Bewohner sind angekommen!`);
        } else if (this.happiness >= 60) {
          // happy: 1 person arrives
          this.population += 1;
          this.sendNotification('🎉 Ein neuer Bewohner ist angekommen!');
        } else if (this.happiness >= 40) {
          // okay: 50% chance someone arrives
          if (Math.random() < 0.5) {
            this.population += 1;
            this.sendNotification('🎉 Ein neuer Bewohner ist angekommen!');
          }
        }
        // below 40: nobody comes
      }
    }

    this.notify();
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  onNotification(fn) {
    this.notifyListeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  sendNotification(msg) {
    this.notifyListeners.forEach(fn => fn(msg));
  }

  getWizardTip() {
    if (this.housingCapacity === 0) {
      return '🏠 Baue ein Haus damit Leute kommen!';
    }
    if (this.resourceManager.get('fish') < 5 && this.population > 0) {
      return '🐟 Du brauchst mehr Fische! Baue ein Fischerboot!';
    }
    if (this.freeWorkers === 0 && this.population > 0) {
      return '🏠 Baue mehr Haeuser fuer mehr Arbeiter!';
    }
    if (this.freeWorkers >= 3) {
      return '⛏️ Du hast freie Arbeiter! Baue Bergwerke oder Holzfaeller!';
    }
    const hasLumberjack = this.buildings.some(b => b.key === 'lumberjack');
    if (!hasLumberjack && this.population >= 2) {
      return '🪓 Baue einen Holzfaeller fuer automatisches Holz!';
    }
    const hasMine = this.buildings.some(b => b.key === 'mine');
    if (!hasMine && this.population >= 3) {
      return '⛏️ Baue ein Bergwerk fuer automatische Steine!';
    }
    const hasBoat = this.buildings.some(b => b.key === 'fishingboat');
    if (!hasBoat && this.population >= 2) {
      return '🚣 Baue ein Fischerboot fuer automatische Fische!';
    }
    // service building hints based on graduated requirements
    if (this.population >= 5 && this.countBuilding('shop') === 0) {
      return '🏪 Deine Leute brauchen einen Shop!';
    }
    if (this.population >= 8 && this.countBuilding('restaurant') === 0) {
      return '🍽️ Baue ein Restaurant! Die Leute wollen essen gehen!';
    }
    if (this.population >= 12 && this.countBuilding('firestation') === 0) {
      return '🚒 Baue eine Feuerwehr fuer die Sicherheit!';
    }
    if (this.population >= 16 && this.countBuilding('hospital') === 0) {
      return '🏥 Baue ein Krankenhaus! Die Bewohner brauchen Aerzte!';
    }
    if (this.happiness < 50) {
      return '🌳 Baue Parks, Shops oder Restaurants fuer mehr Glueck!';
    }
    const hasAirport = this.buildings.some(b => b.key === 'airport');
    if (!hasAirport && this.population >= 10) {
      return '✈️ Baue einen Flughafen um neue Inseln zu entdecken!';
    }
    if (this.population >= 5 && this.population < 15) {
      return '🌟 Super! Versuche 15 Bewohner zu bekommen!';
    }
    if (this.population >= 15 && this.population < 30) {
      return '🏆 Wow! Versuche 30 Bewohner zu erreichen!';
    }
    if (this.population >= 30) {
      return '🏆 Mega! Deine Insel ist eine Metropole!';
    }
    return '🌴 Sammle Ressourcen und baue deine Insel aus!';
  }
}
