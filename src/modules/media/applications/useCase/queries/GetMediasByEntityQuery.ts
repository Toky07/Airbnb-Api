import type { EntityType } from '@src/modules/media/constant';

export class GetMediasByEntityQuery {
  constructor(
    public readonly entityType: EntityType,
    public readonly entityId: number,
  ) {}
}
