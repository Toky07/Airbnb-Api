import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesModule } from '../properties/properties.module';
import { ReservationModule } from '../reservation/reservation.module';
import { RoomsModule } from '../rooms/room.module';
import { USER_REPOSITORY } from '../user/contracts';
import type { IUserRepository } from '../user/contracts';
import { UserModule } from '../user/user.module';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { QueryBus } from '../../shared/useCase/bus/query-bus';
import {
  CONVERSATION_REPOSITORY,
  type IConversationRepository,
} from './domain/repositories/conversation.repository';
import {
  MESSAGE_REPOSITORY,
  type IMessageRepository,
} from './domain/repositories/message.repository';
import { AssertConversationAccessService } from './applications/services/assert-conversation-access.service';
import { GetOrCreateConversationService } from './applications/services/get-or-create-conversation.service';
import { ResolveReservationParticipantsService } from './applications/services/resolve-reservation-participants.service';
import { MessagingEvent } from './applications/events/register-messaging.event';
import { ConversationOrmEntity } from './infrastructure/entities/conversation.orm-entity';
import { MessageOrmEntity } from './infrastructure/entities/message.orm-entity';
import { ConversationRepository } from './infrastructure/repositories/conversation.repository';
import { MessageRepository } from './infrastructure/repositories/message.repository';
import { MessagingController } from './interfaces/http/messaging.controller';
import { MessagingBootstrap } from './messaging.bootstrap';
import { SendMessageCommand } from './applications/useCase/commands/SendMessageCommand';
import { MarkConversationReadCommand } from './applications/useCase/commands/MarkConversationReadCommand';
import { GetOrCreateConversationCommand } from './applications/useCase/commands/GetOrCreateConversationCommand';
import { ListMyConversationsQuery } from './applications/useCase/queries/ListMyConversationsQuery';
import { ListMessagesQuery } from './applications/useCase/queries/ListMessagesQuery';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationOrmEntity, MessageOrmEntity]),
    UserModule,
    ReservationModule,
    RoomsModule,
    PropertiesModule,
  ],
  controllers: [MessagingController],
  providers: [
    ConversationRepository,
    {
      provide: CONVERSATION_REPOSITORY,
      useClass: ConversationRepository,
    },
    MessageRepository,
    {
      provide: MESSAGE_REPOSITORY,
      useClass: MessageRepository,
    },
    AssertConversationAccessService,
    ResolveReservationParticipantsService,
    GetOrCreateConversationService,
    MessagingEvent,
  ],
  exports: [
    CONVERSATION_REPOSITORY,
    MESSAGE_REPOSITORY,
    GetOrCreateConversationService,
  ],
})
export class MessagingModule implements OnModuleInit {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly assertConversationAccess: AssertConversationAccessService,
    private readonly getOrCreateConversation: GetOrCreateConversationService,
    private readonly resolveParticipants: ResolveReservationParticipantsService,
  ) {}

  onModuleInit() {
    const bootstrap = MessagingBootstrap.create({
      conversationRepository: this.conversationRepository,
      messageRepository: this.messageRepository,
      userRepository: this.userRepository,
      assertConversationAccess: this.assertConversationAccess,
      getOrCreateConversation: this.getOrCreateConversation,
      resolveParticipants: this.resolveParticipants,
    });

    CommandBus.register(
      SendMessageCommand,
      bootstrap.sendMessageCommandHandler,
    );
    CommandBus.register(
      MarkConversationReadCommand,
      bootstrap.markConversationReadCommandHandler,
    );
    CommandBus.register(
      GetOrCreateConversationCommand,
      bootstrap.getOrCreateConversationCommandHandler,
    );
    QueryBus.register(
      ListMyConversationsQuery,
      bootstrap.listMyConversationsQueryHandler,
    );
    QueryBus.register(ListMessagesQuery, bootstrap.listMessagesQueryHandler);
  }
}
