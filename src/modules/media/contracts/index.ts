/**
 * Surface publique du module media.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf ORM TypeORM et MediaModule Nest).
 */
export type { UploadFile } from '../types/upload-file';
export {
  ENTITY_MEDIA_LIMITS,
  ENTITY_TYPE,
  MEDIA_TYPE,
  UPLOAD_ROOT,
  type EntityType,
  type MediaType,
} from '../constant';
export { Media } from '../domain/entities/media.entity';
export { SaveEntityMediasCommand } from '../applications/useCase/commands/SaveEntityMediasCommand';
export { SyncEntityMediasCommand } from '../applications/useCase/commands/SyncEntityMediasCommand';
export { DeleteMediasByEntityCommand } from '../applications/useCase/commands/DeleteMediasByEntityCommand';
export { GetMediasByEntityQuery } from '../applications/useCase/queries/GetMediasByEntityQuery';
export {
  LOCAL_STORAGE_SERVICE,
  type ILocalStorageService,
} from '../services/localStorage.service';
export {
  toDiskPath,
  toSaveMediaContext,
  type SaveMediaContext,
} from '../utils/build-upload-path';
export { resolveUploadRoot } from '../utils/resolve-upload-root';
export { dataUrlToUploadFile } from '../utils/data-url-to-upload-file';
export { isStoredUploadPath } from '../utils/is-stored-upload-path';
export { fetchImageFromUrl } from '../utils/fetch-image-from-url';
