import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class SetRolePermissionsSwaggerDto {
  @ApiProperty({ type: [String], example: ['users.read', 'rooms.read'] })
  @IsArray()
  @IsString({ each: true })
  permissionKeys: string[];
}
