import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRoomTypeSwaggerDto {
  @ApiPropertyOptional({ example: 'Suite deluxe' })
  @IsOptional()
  @IsString()
  name?: string;
}
