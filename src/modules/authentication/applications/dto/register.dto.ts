import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'marie.dupont@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Marie' })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty({ example: '+33612345678' })
  @IsString()
  @MinLength(1)
  phoneNumber: string;
}
