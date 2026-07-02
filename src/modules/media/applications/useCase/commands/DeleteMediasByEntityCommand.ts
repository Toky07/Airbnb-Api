import type { EntityType } from '../../../constant';

export class DeleteMediasByEntityCommand {
  constructor(
    public readonly entityType: EntityType,
    public readonly entityId: number,
  ) {}
}
