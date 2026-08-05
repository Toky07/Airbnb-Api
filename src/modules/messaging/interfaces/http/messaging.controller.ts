import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { SendMessageDto } from '../../applications/dto/send-message.dto';
import { SendMessageCommand } from '../../applications/useCase/commands/SendMessageCommand';
import { MarkConversationReadCommand } from '../../applications/useCase/commands/MarkConversationReadCommand';
import { GetOrCreateConversationCommand } from '../../applications/useCase/commands/GetOrCreateConversationCommand';
import { ListMyConversationsQuery } from '../../applications/useCase/queries/ListMyConversationsQuery';
import { ListMessagesQuery } from '../../applications/useCase/queries/ListMessagesQuery';
import { ApiJwtAuth } from '../../../../shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '../../../../shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.MESSAGING)
@ApiJwtAuth()
@Controller('conversations')
export class MessagingController {
  @Get('me')
  @ApiOperation({ summary: 'Mes conversations' })
  listMine(@Req() request: { user?: JwtPayload }) {
    return QueryBus.execute(new ListMyConversationsQuery(request.user!.sub));
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Messages d\'une conversation' })
  @ApiQuery({
    name: 'since',
    required: false,
    description: 'Filtrer les messages après cette date ISO',
  })
  listMessages(
    @Req() request: { user?: JwtPayload },
    @Param('id') id: string,
    @Query('since') since?: string,
  ) {
    const sinceDate =
      since && !Number.isNaN(Date.parse(since)) ? new Date(since) : undefined;

    return QueryBus.execute(
      new ListMessagesQuery(request.user!.sub, Number(id), sinceDate),
    );
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Envoyer un message' })
  sendMessage(
    @Req() request: { user?: JwtPayload },
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return CommandBus.execute(
      new SendMessageCommand(request.user!.sub, Number(id), dto.body),
    );
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marquer une conversation comme lue' })
  markRead(@Req() request: { user?: JwtPayload }, @Param('id') id: string) {
    return CommandBus.execute(
      new MarkConversationReadCommand(request.user!.sub, Number(id)),
    );
  }

  @Post('from-reservation/:reservationId')
  @ApiOperation({ summary: 'Obtenir ou créer une conversation pour une réservation' })
  getOrCreateFromReservation(
    @Req() request: { user?: JwtPayload },
    @Param('reservationId') reservationId: string,
  ) {
    return CommandBus.execute(
      new GetOrCreateConversationCommand(
        request.user!.sub,
        Number(reservationId),
      ),
    );
  }
}
