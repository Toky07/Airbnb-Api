import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  HOST_APPLICATION_CITY_MAX_LENGTH,
  HOST_APPLICATION_MESSAGE_MAX_LENGTH,
  HOST_APPLICATION_MESSAGE_MIN_LENGTH,
  HOST_APPLICATION_PROPERTY_NAME_MAX_LENGTH,
} from '@src/modules/host-application/domain/constants/host-application-status.constant';

export class CreateHostApplicationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(HOST_APPLICATION_CITY_MAX_LENGTH)
  city: string;

  @IsString()
  @MinLength(HOST_APPLICATION_MESSAGE_MIN_LENGTH)
  @MaxLength(HOST_APPLICATION_MESSAGE_MAX_LENGTH)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(HOST_APPLICATION_PROPERTY_NAME_MAX_LENGTH)
  propertyName?: string;
}
