export default class Command {
  static count = 0;
  static TERRAIN_SIZE = undefined;

  constructor() {
    this.id = Command.count++;
  }

  toString() {
    return `Command(${this.block === 1 ? "block" : "air"}, ${this.x1}, ${
      this.z1
    }, ${this.x2}, ${this.z2})`;
  }

  #clamp(value) {
    return Math.round(Math.max(0, Math.min(Command.TERRAIN_SIZE - 1, value)));
  }

  mutate(mutationRate, mutationAmount) {
    if (Math.random() < mutationRate)
      this.x1 = this.#clamp(this.x1 + (Math.random() - 0.5) * mutationAmount);
    if (Math.random() < mutationRate)
      this.z1 = this.#clamp(this.z1 + (Math.random() - 0.5) * mutationAmount);
    if (Math.random() < mutationRate)
      this.x2 = this.#clamp(this.x2 + (Math.random() - 0.5) * mutationAmount);
    if (Math.random() < mutationRate)
      this.z2 = this.#clamp(this.z2 + (Math.random() - 0.5) * mutationAmount);
  }

  reproduce() {
    const clone = new Command();
    clone.generation = this.generation++;
    clone.block = this.block;
    clone.x1 = this.x1;
    clone.z1 = this.z1;
    clone.x2 = this.x2;
    clone.z2 = this.z2;
    return clone;
  }

  calculateFitness(currentTerrain, targetTerrain) {
    const currentTerrainClone = currentTerrain.clone();
    const beforeCommandLikeness =
      currentTerrainClone.getLikeness(targetTerrain);
    currentTerrainClone.setRegion(
      this.x1,
      this.z1,
      this.x2,
      this.z2,
      this.block
    );
    const afterCommandLikeness = currentTerrainClone.getLikeness(targetTerrain);
    this.fitness = afterCommandLikeness - beforeCommandLikeness;
  }

  static generateRandom(limit) {
    const command = new Command();
    command.generation = 0;
    command.block = Math.random() > 0.5 ? 1 : 0;
    command.x1 = Math.floor(Math.random() * limit);
    command.z1 = Math.floor(Math.random() * limit);
    command.x2 = Math.floor(Math.random() * limit);
    command.z2 = Math.floor(Math.random() * limit);
    return command;
  }
}
