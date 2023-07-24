export default class Terrain {
  constructor(size) {
    this.size = size;
    this.bitmap = new Uint8Array(size * size);
  }

  getBlock(x, z) {
    return this.bitmap[x + z * this.size];
  }

  setBlock(x, z, value) {
    this.bitmap[x + z * this.size] = value;
  }

  getLikeness(other) {
    let likeness = 0;
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        likeness += this.getBlock(x, z) === other.getBlock(x, z) ? 1 : -1;
      }
    }
    return likeness;
  }

  setRegion(x1, z1, x2, z2, value) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minZ = Math.min(z1, z2);
    const maxZ = Math.max(z1, z2);
    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        this.setBlock(x, z, value);
      }
    }
  }

  clone() {
    const clone = new Terrain(this.size);
    clone.bitmap = new Uint8Array(this.bitmap);
    return clone;
  }
}
