import { IsArray, IsInt } from 'class-validator';

export class SyncAmenitiesDto {
  @IsArray()
  @IsInt({ each: true })
  amenityIds: number[];
}
