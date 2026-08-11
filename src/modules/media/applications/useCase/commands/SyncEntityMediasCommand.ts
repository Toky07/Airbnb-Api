import type { EntityType, MediaType } from '@src/modules/media/constant';
import { MEDIA_TYPE } from '@src/modules/media/constant';
import type { UploadFile } from '@src/modules/media/types/upload-file';

export type SyncEntityMediasPayload = {
  keptPaths: string[];
  newFiles?: UploadFile[];
};

export class SyncEntityMediasCommand {
  constructor(
    public readonly entityType: EntityType,
    public readonly entityId: number,
    public readonly options: SyncEntityMediasPayload,
    public readonly mediaType: MediaType = MEDIA_TYPE.IMAGE,
    public readonly propertyId?: number,
  ) {}
}
