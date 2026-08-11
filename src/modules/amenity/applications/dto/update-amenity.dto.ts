import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAmenityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
