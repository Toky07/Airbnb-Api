import type { EntityType, MediaType } from '../../../constant';
import { MEDIA_TYPE } from '../../../constant';
import type { UploadFile } from '../../../types/upload-file';

export class SaveEntityMediasCommand {
  constructor(
    public readonly entityType: EntityType,
    public readonly entityId: number,
    public readonly files: UploadFile[],
    public readonly mediaType: MediaType = MEDIA_TYPE.IMAGE,
    public readonly propertyId?: number,
  ) {}
}
