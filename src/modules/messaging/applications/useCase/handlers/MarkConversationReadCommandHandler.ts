import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IMessageRepository } from '@src/modules/messaging/domain/repositories/message.repository';
import type { AssertConversationAccessService } from '@src/modules/messaging/applications/services/assert-conversation-access.service';
import type { MarkConversationReadCommand } from '@src/modules/messaging/applications/useCase/commands/MarkConversationReadCommand';

export class MarkConversationReadCommandHandler implements ICommandHandler<
  MarkConversationReadCommand,
  void
> {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly assertConversationAccess: AssertConversationAccessService,
  ) {}

  async execute(command: MarkConversationReadCommand): Promise<void> {
    const conversation =
      await this.assertConversationAccess.requireConversation(
        command.conversationId,
      );
    const readerId = await this.assertConversationAccess.assertCanAccess(
      conversation,
      command.authId,
    );

    await this.messageRepository.markAsRead(conversation.id!, readerId);
  }
}
