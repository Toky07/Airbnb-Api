import {
  IsDateString,
  IsInt,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreatePaymentIntentDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  reservationId?: number;

  @ValidateIf((dto: CreatePaymentIntentDto) => !dto.reservationId)
  @IsInt()
  @Min(1)
  roomId?: number;

  @ValidateIf((dto: CreatePaymentIntentDto) => !dto.reservationId)
  @IsDateString()
  checkIn?: string;

  @ValidateIf((dto: CreatePaymentIntentDto) => !dto.reservationId)
  @IsDateString()
  checkOut?: string;

  @ValidateIf((dto: CreatePaymentIntentDto) => !dto.reservationId)
  @IsInt()
  @Min(1)
  guestCount?: number;
}
