import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
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

export class UpdateAmenityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SyncAmenitiesDto {
  @IsArray()
  @IsInt({ each: true })
  amenityIds: number[];
}
