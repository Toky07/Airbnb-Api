import { IsInt, Min } from 'class-validator';

export class CompleteCartCheckoutDto {
  @IsInt()
  @Min(1)
  paymentId: number;
}
