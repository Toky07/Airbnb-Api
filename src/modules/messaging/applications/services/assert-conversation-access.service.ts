import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';
import type { IUserRepository } from '@src/modules/user/contracts';
import { USER_REPOSITORY } from '@src/modules/user/contracts';
import type { Conversation } from '@src/modules/messaging/domain/entities/conversation.entity';
import {
  CONVERSATION_REPOSITORY,
  type IConversationRepository,
} from '@src/modules/messaging/domain/repositories/conversation.repository';

@Injectable()
export class AssertConversationAccessService {
  private readonly resolveAuthenticatedUser: ResolveAuthenticatedUserService;

  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,
    @Inject(USER_REPOSITORY) userRepository: IUserRepository,
  ) {
    this.resolveAuthenticatedUser = new ResolveAuthenticatedUserService(
      userRepository,
    );
  }

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
    const userId = await this.resolveAuthenticatedUser.resolveUserId(authId);

    if (userId === conversation.guestId || userId === conversation.hostId) {
      return userId;
    }

    throw new ForbiddenException('Accès refusé.');
  }
}
