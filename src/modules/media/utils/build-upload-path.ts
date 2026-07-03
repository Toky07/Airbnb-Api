import { join } from 'path';
import { ENTITY_TYPE, UPLOAD_ROOT, type EntityType } from '../constant';

export type SaveMediaContext =
  | { entityType: typeof ENTITY_TYPE.PROPERTY; propertyId: number }
  | { entityType: typeof ENTITY_TYPE.ROOM; propertyId: number; roomId: number }
  | { entityType: typeof ENTITY_TYPE.USER; userId: number };

export function toSaveMediaContext(
  entityType: EntityType,
  entityId: number,
  propertyId?: number,
): SaveMediaContext {
  switch (entityType) {
    case ENTITY_TYPE.PROPERTY:
      return { entityType, propertyId: entityId };
    case ENTITY_TYPE.ROOM:
      if (propertyId == null) {
        throw new Error('propertyId is required when saving room media');
      }
      return { entityType, propertyId, roomId: entityId };
    case ENTITY_TYPE.USER:
      return { entityType, userId: entityId };
  }
}

export function buildUploadRelativePath(
  context: SaveMediaContext,
  filename: string,
): string {
  switch (context.entityType) {
    case ENTITY_TYPE.PROPERTY:
      return join(
        UPLOAD_ROOT,
        String(context.propertyId),
        'property',
        filename,
      ).replace(/\\/g, '/');
    case ENTITY_TYPE.ROOM:
      return join(
        UPLOAD_ROOT,
        String(context.propertyId),
        'room',
        String(context.roomId),
        filename,
      ).replace(/\\/g, '/');
    case ENTITY_TYPE.USER:
      return join(
        UPLOAD_ROOT,
        'users',
        String(context.userId),
        'avatar',
        filename,
      ).replace(/\\/g, '/');
  }
}

export function toDiskPath(
  relativePath: string,
  uploadRoot = UPLOAD_ROOT,
): string {
  const normalized = relativePath.replace(/\\/g, '/');

  if (uploadRoot === UPLOAD_ROOT) {
    return join(process.cwd(), normalized);
  }

  if (normalized.startsWith(`${UPLOAD_ROOT}/`)) {
    return join(
      process.cwd(),
      uploadRoot,
      normalized.slice(UPLOAD_ROOT.length + 1),
    );
  }

  return join(process.cwd(), normalized);
}
