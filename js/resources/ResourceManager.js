export default class ResourceManager {
  constructor() {
    this.resources = {
      wood:  { amount: 40, icon: '🪵', color: '#A1887F' },
      stone: { amount: 30, icon: '🪨', color: '#BDBDBD' },
      fish:  { amount: 15,  icon: '🐟', color: '#64B5F6' }
    };
    this.baseCapacity = 100;
    this.bonusCapacity = 0;
    this.listeners = [];
  }

  get capacity() {
    return this.baseCapacity + this.bonusCapacity;
  }

  addCapacity(amount) {
    this.bonusCapacity += amount;
    this.notify('wood');
  }

  removeCapacity(amount) {
    this.bonusCapacity = Math.max(0, this.bonusCapacity - amount);
  }

  get(type) {
    return this.resources[type].amount;
  }

  getIcon(type) {
    return this.resources[type].icon;
  }

  get totalUsed() {
    return Object.values(this.resources).reduce((sum, r) => sum + r.amount, 0);
  }

  add(type, amount) {
    const free = this.capacity - this.totalUsed;
    const actual = Math.min(amount, free);
    if (actual > 0) {
      this.resources[type].amount += actual;
    }
    this.notify(type);
  }

  spend(costs) {
    for (const [type, amount] of Object.entries(costs)) {
      if (this.resources[type].amount < amount) return false;
    }
    for (const [type, amount] of Object.entries(costs)) {
      this.resources[type].amount -= amount;
      this.notify(type);
    }
    return true;
  }

  canAfford(costs) {
    for (const [type, amount] of Object.entries(costs)) {
      if (this.resources[type].amount < amount) return false;
    }
    return true;
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  notify(type) {
    this.listeners.forEach(fn => fn(type, this.resources[type].amount));
  }
}
