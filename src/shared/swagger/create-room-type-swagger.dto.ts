import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

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
