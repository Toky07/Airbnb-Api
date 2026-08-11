import type { EntityType, MediaType } from '@src/modules/media/constant';

export class Media {
  constructor(
    public path: string,
    public type: MediaType,
    public entityType: EntityType,
    public entityId: number,
    public id?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
