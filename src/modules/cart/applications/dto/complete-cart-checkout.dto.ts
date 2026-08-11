import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CompleteCartCheckoutDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  paymentId: number;
}
