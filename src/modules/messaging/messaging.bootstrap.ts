import type { IConversationRepository } from './domain/repositories/conversation.repository';
import type { IMessageRepository } from './domain/repositories/message.repository';
import type { IUserRepository } from '@src/modules/user/contracts';
import type { AssertConversationAccessService } from './applications/services/assert-conversation-access.service';
import type { GetOrCreateConversationService } from './applications/services/get-or-create-conversation.service';
import type { ResolveReservationParticipantsService } from './applications/services/resolve-reservation-participants.service';
import { SendMessageCommandHandler } from './applications/useCase/handlers/SendMessageCommandHandler';
import { MarkConversationReadCommandHandler } from './applications/useCase/handlers/MarkConversationReadCommandHandler';
import { GetOrCreateConversationCommandHandler } from './applications/useCase/handlers/GetOrCreateConversationCommandHandler';
import { ListMyConversationsQueryHandler } from './applications/useCase/handlers/ListMyConversationsQueryHandler';
import { ListMessagesQueryHandler } from './applications/useCase/handlers/ListMessagesQueryHandler';

export type MessagingBootstrapDeps = {
  conversationRepository: IConversationRepository;
  messageRepository: IMessageRepository;
  userRepository: IUserRepository;
  assertConversationAccess: AssertConversationAccessService;
  getOrCreateConversation: GetOrCreateConversationService;
  resolveParticipants: ResolveReservationParticipantsService;
};

export class MessagingBootstrap {
  readonly sendMessageCommandHandler: SendMessageCommandHandler;
  readonly markConversationReadCommandHandler: MarkConversationReadCommandHandler;
  readonly getOrCreateConversationCommandHandler: GetOrCreateConversationCommandHandler;
  readonly listMyConversationsQueryHandler: ListMyConversationsQueryHandler;
  readonly listMessagesQueryHandler: ListMessagesQueryHandler;

  private constructor(deps: MessagingBootstrapDeps) {
    this.sendMessageCommandHandler = new SendMessageCommandHandler(
      deps.conversationRepository,
      deps.messageRepository,
      deps.assertConversationAccess,
    );
    this.markConversationReadCommandHandler =
      new MarkConversationReadCommandHandler(
        deps.messageRepository,
        deps.assertConversationAccess,
      );
    this.getOrCreateConversationCommandHandler =
      new GetOrCreateConversationCommandHandler(
        deps.getOrCreateConversation,
        deps.resolveParticipants,
      );
    this.listMyConversationsQueryHandler = new ListMyConversationsQueryHandler(
      deps.conversationRepository,
      deps.userRepository,
    );
    this.listMessagesQueryHandler = new ListMessagesQueryHandler(
      deps.messageRepository,
      deps.assertConversationAccess,
    );
  }

  static create(deps: MessagingBootstrapDeps): MessagingBootstrap {
    return new MessagingBootstrap(deps);
  }
}
