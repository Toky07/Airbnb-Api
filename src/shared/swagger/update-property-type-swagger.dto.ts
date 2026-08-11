import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePropertyTypeSwaggerDto {
  @ApiPropertyOptional({ example: 'Hôtel boutique' })
  @IsOptional()
  @IsString()
  name?: string;
}
