/**
 * Surface publique du module media.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf ORM TypeORM et MediaModule Nest).
 */
export type { UploadFile } from '@src/modules/media/types/upload-file';
export {
  ENTITY_MEDIA_LIMITS,
  ENTITY_TYPE,
  MEDIA_TYPE,
  UPLOAD_ROOT,
  type EntityType,
  type MediaType,
} from '@src/modules/media/constant';
export { Media } from '@src/modules/media/domain/entities/media.entity';
export { SaveEntityMediasCommand } from '@src/modules/media/applications/useCase/commands/SaveEntityMediasCommand';
export { SyncEntityMediasCommand } from '@src/modules/media/applications/useCase/commands/SyncEntityMediasCommand';
export { DeleteMediasByEntityCommand } from '@src/modules/media/applications/useCase/commands/DeleteMediasByEntityCommand';
export { GetMediasByEntityQuery } from '@src/modules/media/applications/useCase/queries/GetMediasByEntityQuery';
export {
  LOCAL_STORAGE_SERVICE,
  type ILocalStorageService,
} from '@src/modules/media/services/localStorage.service';
export {
  toDiskPath,
  toSaveMediaContext,
  type SaveMediaContext,
} from '@src/modules/media/utils/build-upload-path';
export { resolveUploadRoot } from '@src/modules/media/utils/resolve-upload-root';
export { dataUrlToUploadFile } from '@src/modules/media/utils/data-url-to-upload-file';
export { isStoredUploadPath } from '@src/modules/media/utils/is-stored-upload-path';
export { fetchImageFromUrl } from '@src/modules/media/utils/fetch-image-from-url';
