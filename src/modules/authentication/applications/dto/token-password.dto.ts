import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class TokenPasswordDto {
  @ApiProperty({ description: 'Token reçu par email' })
  @IsString()
  @MinLength(1)
  token: string;

  @ApiProperty({ minLength: 8, example: 'NouveauMotDePasse123!' })
  @IsString()
  @MinLength(8)
  password: string;
}
