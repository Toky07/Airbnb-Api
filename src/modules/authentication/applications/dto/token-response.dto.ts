import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ description: 'Nouveau JWT (ex. après become-host)' })
  token: string;
}
