import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../authentication/interfaces/decorators/public.decorator';
import { ConfirmStripePaymentCommand } from '../../applications/useCase/commands/ConfirmStripePaymentCommand';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import type { Payment } from '../../domain/entities/payment.entity';
import { SWAGGER_TAGS } from '../../../../shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.PAYMENTS)
@Controller('payments')
export class PaymentController {
  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Webhook Stripe (payment_intent.succeeded, etc.)' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Signature Stripe pour vérification du payload',
    required: true,
  })
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
