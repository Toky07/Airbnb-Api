import type { EntityType } from '@src/modules/media/constant';

export class DeleteMediasByEntityCommand {
  constructor(
    public readonly entityType: EntityType,
    public readonly entityId: number,
  ) {}
}
