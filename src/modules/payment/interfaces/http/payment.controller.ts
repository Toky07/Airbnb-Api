import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { Public } from '../../../authentication/interfaces/decorators/public.decorator';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { hasPermission } from '../../../authentication/domain/utils/build-jwt-payload';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import { CreatePaymentIntentDto } from '../../applications/dto/create-payment-intent.dto';
import { GetPaymentUseCase } from '../../applications/useCase/get-payment.usecase';
import { HandleStripeWebhookUseCase } from '../../applications/useCase/handle-stripe-webhook.usecase';
import { ListPaymentsUseCase } from '../../applications/useCase/list-payments.usecase';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly handleStripeWebhookUseCase: HandleStripeWebhookUseCase,
  ) {}

  @Get()
  @RequirePermissions('payments.read')
  list(@Query() query: Record<string, unknown>) {
    return this.listPaymentsUseCase.execute(parsePaginationQuery(query));
  }

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

  @Get(':id')
  getById(@Req() request: { user?: JwtPayload }, @Param('id') id: number) {
    const user = request.user!;

    return this.getPaymentUseCase.execute(Number(id), {
      authId: user.sub,
      canReadAll: hasPermission(user, ['payments.read']),
    });
  }
}
