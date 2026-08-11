import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

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
