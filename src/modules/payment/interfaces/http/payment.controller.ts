import {
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../../authentication/interfaces/decorators/public.decorator';
import { ConfirmStripePaymentCommandHandler } from '../../applications/useCase/handlers/ConfirmStripePaymentCommandHandler';
import { ConfirmStripePaymentCommand } from '../../applications/useCase/commands/ConfirmStripePaymentCommand';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly confirmStripePaymentCommandHandler: ConfirmStripePaymentCommandHandler,
  ) {}

  @Post('webhook')
  @Public()
  webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    this.confirmStripePaymentCommandHandler.execute(
      new ConfirmStripePaymentCommand(
        request.rawBody ?? Buffer.from(''),
        signature,
      ),
    );
  }
}
