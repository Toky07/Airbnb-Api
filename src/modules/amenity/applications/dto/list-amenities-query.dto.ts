import { IsIn, IsOptional } from 'class-validator';
import {
  AMENITY_SCOPE,
  type AmenityScope,
} from '../../domain/constants/amenity-scope.constant';

export class ListAmenitiesQueryDto {
  @IsOptional()
  @IsIn([AMENITY_SCOPE.ROOM, AMENITY_SCOPE.PROPERTY])
  scope?: AmenityScope;
}
