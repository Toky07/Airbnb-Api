/**
 * Surface publique du module amenity.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf AmenityModule Nest et ORM).
 */
export {
  AMENITY_SCOPE,
  AMENITY_SCOPES,
  type AmenityScope,
} from '@src/modules/amenity/domain/constants/amenity-scope.constant';
export { AmenityOutput } from '@src/modules/amenity/applications/dto/amenity.output';
export { SyncAmenitiesDto } from '@src/modules/amenity/applications/dto/sync-amenities.dto';
export { ListAmenityOptionsQuery } from '@src/modules/amenity/applications/useCase/queries/ListAmenityOptionsQuery';
export { ListPropertyAmenitiesQuery } from '@src/modules/amenity/applications/useCase/queries/ListPropertyAmenitiesQuery';
export { ListRoomAmenitiesQuery } from '@src/modules/amenity/applications/useCase/queries/ListRoomAmenitiesQuery';
export { SyncPropertyAmenitiesCommand } from '@src/modules/amenity/applications/useCase/commands/SyncPropertyAmenitiesCommand';
export { SyncRoomAmenitiesCommand } from '@src/modules/amenity/applications/useCase/commands/SyncRoomAmenitiesCommand';
