import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  AMENITY_SCOPE,
  type AmenityScope,
} from '@src/modules/amenity/domain/constants/amenity-scope.constant';

export class CreateAmenityDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  icon: string;

  @IsIn([AMENITY_SCOPE.ROOM, AMENITY_SCOPE.PROPERTY])
  scope: AmenityScope;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
