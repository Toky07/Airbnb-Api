import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ nullable: true, description: 'JWT ou null si échec' })
  token: string | null;
}
