export const MEDIA_TYPE = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  OTHER: 'other',
} as const;

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

export const ENTITY_TYPE = {
  PROPERTY: 'property',
  ROOM: 'room',
} as const;

export type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];

export const UPLOAD_ROOT = 'uploads';

export const UPLOAD_DIRS = {
  [ENTITY_TYPE.PROPERTY]: 'properties',
  [ENTITY_TYPE.ROOM]: 'rooms',
} as const;

/** Nombre maximum de médias par type d'entité (extensible pour de nouvelles entités). */
export const ENTITY_MEDIA_LIMITS: Record<EntityType, number> = {
  [ENTITY_TYPE.PROPERTY]: 1,
  [ENTITY_TYPE.ROOM]: 10,
};
