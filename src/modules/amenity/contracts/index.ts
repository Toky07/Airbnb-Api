/**
 * Surface publique du module amenity.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf AmenityModule Nest et ORM).
 */
export {
  AMENITY_SCOPE,
  AMENITY_SCOPES,
  type AmenityScope,
} from '../domain/constants/amenity-scope.constant';
export { AmenityOutput } from '../applications/dto/amenity.output';
export { SyncAmenitiesDto } from '../applications/dto/create-amenity.dto';
export { ListAmenityOptionsQuery } from '../applications/useCase/queries/ListAmenityOptionsQuery';
export { ListPropertyAmenitiesQuery } from '../applications/useCase/queries/ListPropertyAmenitiesQuery';
export { ListRoomAmenitiesQuery } from '../applications/useCase/queries/ListRoomAmenitiesQuery';
export { SyncPropertyAmenitiesCommand } from '../applications/useCase/commands/SyncPropertyAmenitiesCommand';
export { SyncRoomAmenitiesCommand } from '../applications/useCase/commands/SyncRoomAmenitiesCommand';
