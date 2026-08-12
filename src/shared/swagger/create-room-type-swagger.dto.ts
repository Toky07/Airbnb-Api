import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRoomTypeSwaggerDto {
  @ApiProperty({ example: 'Suite' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'suite' })
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
