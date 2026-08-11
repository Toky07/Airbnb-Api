import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

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
