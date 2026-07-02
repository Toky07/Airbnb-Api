import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../../authentication/interfaces/decorators/public.decorator';
import { ConfirmStripePaymentCommand } from '../../applications/useCase/commands/ConfirmStripePaymentCommand';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import type { Payment } from '../../domain/entities/payment.entity';

@Controller('payments')
export class PaymentController {
  @Post('webhook')
  @Public()
  async webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return CommandBus.execute<Payment>(
      new ConfirmStripePaymentCommand(
        request.rawBody ?? Buffer.from(''),
        signature,
      ),
    );
  }
}
