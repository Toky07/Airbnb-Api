import { IsDateString, IsInt, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsInt()
  @Min(1)
  roomId: number;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsInt()
  @Min(1)
  guestCount: number;
}
