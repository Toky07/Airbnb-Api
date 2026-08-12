import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ type: [Number], example: [2, 3] })
  @IsArray()
  @IsInt({ each: true })
  roleId: number[];
}
