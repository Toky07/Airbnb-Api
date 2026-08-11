import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

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
