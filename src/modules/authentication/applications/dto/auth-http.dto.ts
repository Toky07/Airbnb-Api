import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsString,
  MinLength,
} from 'class-validator';

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

export class LoginDto {
  @ApiProperty({ example: 'marie.dupont@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MonMotDePasse123!' })
  @IsString()
  @MinLength(1)
  password: string;
}

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

export class ForgotPasswordDto {
  @ApiProperty({ example: 'marie.dupont@example.com' })
  @IsEmail()
  email: string;
}

export class AssignRoleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ type: [Number], example: [2, 3] })
  @IsArray()
  @IsInt({ each: true })
  roleId: number[];
}

export class SuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}

export class LoginResponseDto {
  @ApiProperty({ nullable: true, description: 'JWT ou null si échec' })
  token: string | null;
}

export class TokenResponseDto {
  @ApiProperty({ description: 'Nouveau JWT (ex. après become-host)' })
  token: string;
}
