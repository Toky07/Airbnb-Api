import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { Conversation } from '../../domain/entities/conversation.entity';
import {
  CONVERSATION_REPOSITORY,
  type IConversationRepository,
} from '../../domain/repositories/conversation.repository';

@Injectable()
export class AssertConversationAccessService {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async requireConversation(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepository.findById(id);
    if (!conversation?.id) {
      throw new NotFoundException('Conversation introuvable.');
    }
    return conversation;
  }

  async assertCanAccess(
    conversation: Conversation,
    authId: number,
  ): Promise<number> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new ForbiddenException('Accès refusé.');
    }

    if (user.id === conversation.guestId || user.id === conversation.hostId) {
      return user.id;
    }

    throw new ForbiddenException('Accès refusé.');
  }
}
