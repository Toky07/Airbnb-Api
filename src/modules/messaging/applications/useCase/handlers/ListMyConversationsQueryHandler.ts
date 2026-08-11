import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '@src/modules/user/contracts';
import type { IConversationRepository } from '@src/modules/messaging/domain/repositories/conversation.repository';
import { ConversationOutput } from '@src/modules/messaging/applications/dto/conversation.output';
import type { ListMyConversationsQuery } from '@src/modules/messaging/applications/useCase/queries/ListMyConversationsQuery';

export class ListMyConversationsQueryHandler implements IQueryHandler<
  ListMyConversationsQuery,
  ConversationOutput[]
> {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: ListMyConversationsQuery,
  ): Promise<ConversationOutput[]> {
    const user = await this.userRepository.findByAuthId(query.authId);
    if (!user?.id) {
      return [];
    }

    const conversations =
      await this.conversationRepository.findByParticipantUserId(user.id);

    return conversations.map((conversation) =>
      ConversationOutput.fromDomain(conversation),
    );
  }
}
