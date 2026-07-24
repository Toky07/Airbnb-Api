import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IMessageRepository } from '../../../domain/repositories/message.repository';
import { MessageOutput } from '../../dto/message.output';
import type { AssertConversationAccessService } from '../../services/assert-conversation-access.service';
import type { ListMessagesQuery } from '../queries/ListMessagesQuery';

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
