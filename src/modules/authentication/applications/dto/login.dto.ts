import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'marie.dupont@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MonMotDePasse123!' })
  @IsString()
  @MinLength(1)
  password: string;
}
