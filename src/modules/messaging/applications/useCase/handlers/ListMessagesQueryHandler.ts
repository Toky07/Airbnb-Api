import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IMessageRepository } from '@src/modules/messaging/domain/repositories/message.repository';
import { MessageOutput } from '@src/modules/messaging/applications/dto/message.output';
import type { AssertConversationAccessService } from '@src/modules/messaging/applications/services/assert-conversation-access.service';
import type { ListMessagesQuery } from '@src/modules/messaging/applications/useCase/queries/ListMessagesQuery';

export class ListMessagesQueryHandler implements IQueryHandler<
  ListMessagesQuery,
  MessageOutput[]
> {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly assertConversationAccess: AssertConversationAccessService,
  ) {}

  async execute(query: ListMessagesQuery): Promise<MessageOutput[]> {
    const conversation =
      await this.assertConversationAccess.requireConversation(
        query.conversationId,
      );
    await this.assertConversationAccess.assertCanAccess(
      conversation,
      query.authId,
    );

    const messages = await this.messageRepository.findByConversationId(
      conversation.id!,
      query.since,
    );

    return messages.map((message) => MessageOutput.fromDomain(message));
  }
}
