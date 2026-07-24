import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import type { IConversationRepository } from '../../../domain/repositories/conversation.repository';
import { ConversationOutput } from '../../dto/conversation.output';
import type { ListMyConversationsQuery } from '../queries/ListMyConversationsQuery';

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
