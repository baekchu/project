export abstract class Entity {
    readonly id: string
    readonly createdAt: Date
    readonly updatedAt?: Date
  
    constructor(init: Entity) {
      this.id = init.id
      this.createdAt = init.createdAt
      this.updatedAt = init.updatedAt
    }
  }
  