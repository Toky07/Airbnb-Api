import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import type { AmenityScope } from '../../modules/amenity/domain/constants/amenity-scope.constant';

export class CreateAmenitySwaggerDto {
  @ApiProperty({ example: 'Wi-Fi' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'wifi' })
  @IsString()
  @MinLength(1)
  icon: string;

  @ApiProperty({ enum: ['room', 'property'], example: 'room' })
  @IsIn(['room', 'property'])
  scope: AmenityScope;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAmenitySwaggerDto {
  @ApiPropertyOptional({ example: 'Wi-Fi premium' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'wifi' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SyncAmenitiesSwaggerDto {
  @ApiProperty({ type: [Number], example: [1, 2, 5] })
  @IsArray()
  @IsInt({ each: true })
  amenityIds: number[];
}

export class CreateRoleSwaggerDto {
  @ApiProperty({ example: 'Modérateur' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'moderator' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoleSwaggerDto {
  @ApiPropertyOptional({ example: 'Modérateur senior' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class SetRolePermissionsSwaggerDto {
  @ApiProperty({ type: [String], example: ['users.read', 'rooms.read'] })
  @IsArray()
  @IsString({ each: true })
  permissionKeys: string[];
}

export class CreateRoomTypeSwaggerDto {
  @ApiProperty({ example: 'Suite' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'suite' })
  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateRoomTypeSwaggerDto {
  @ApiPropertyOptional({ example: 'Suite deluxe' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class CreatePropertyTypeSwaggerDto {
  @ApiProperty({ example: 'Hôtel' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'hotel' })
  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdatePropertyTypeSwaggerDto {
  @ApiPropertyOptional({ example: 'Hôtel boutique' })
  @IsOptional()
  @IsString()
  name?: string;
}
