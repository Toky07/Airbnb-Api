import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class TokenDto {
  @ApiProperty({ description: 'Token reçu par email' })
  @IsString()
  @MinLength(1)
  token: string;
}
