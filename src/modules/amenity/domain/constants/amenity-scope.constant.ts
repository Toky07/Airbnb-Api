export const AMENITY_SCOPE = {
  PROPERTY: 'property',
  ROOM: 'room',
} as const;

export type AmenityScope = (typeof AMENITY_SCOPE)[keyof typeof AMENITY_SCOPE];

export const AMENITY_SCOPES: AmenityScope[] = [
  AMENITY_SCOPE.PROPERTY,
  AMENITY_SCOPE.ROOM,
];
