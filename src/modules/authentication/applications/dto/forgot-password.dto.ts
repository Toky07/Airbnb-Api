import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'marie.dupont@example.com' })
  @IsEmail()
  email: string;
}
