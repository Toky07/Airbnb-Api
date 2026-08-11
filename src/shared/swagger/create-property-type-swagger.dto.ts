import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePropertyTypeSwaggerDto {
  @ApiProperty({ example: 'Hôtel' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'hotel' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
