import type { EntityType } from '../../../constant';

export class GetMediasByEntityQuery {
  constructor(
    public readonly entityType: EntityType,
    public readonly entityId: number,
  ) {}
}
