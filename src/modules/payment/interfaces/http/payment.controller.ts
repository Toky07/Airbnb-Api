import {
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../../authentication/interfaces/decorators/public.decorator';
import { HandleStripeWebhookUseCase } from '../../applications/useCase/handle-stripe-webhook.usecase';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly handleStripeWebhookUseCase: HandleStripeWebhookUseCase,
  ) {}

  @Post('webhook')
  @Public()
  webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.handleStripeWebhookUseCase.execute(
      request.rawBody ?? Buffer.from(''),
      signature,
    );
  }
}
