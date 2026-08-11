import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { Message } from '@src/modules/messaging/domain/entities/message.entity';
import type { IConversationRepository } from '@src/modules/messaging/domain/repositories/conversation.repository';
import type { IMessageRepository } from '@src/modules/messaging/domain/repositories/message.repository';
import { MessageOutput } from '@src/modules/messaging/applications/dto/message.output';
import type { AssertConversationAccessService } from '@src/modules/messaging/applications/services/assert-conversation-access.service';
import type { SendMessageCommand } from '@src/modules/messaging/applications/useCase/commands/SendMessageCommand';

export class SendMessageCommandHandler implements ICommandHandler<
  SendMessageCommand,
  MessageOutput
> {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly assertConversationAccess: AssertConversationAccessService,
  ) {}

  async execute(command: SendMessageCommand): Promise<MessageOutput> {
    const conversation =
      await this.assertConversationAccess.requireConversation(
        command.conversationId,
      );
    const senderId = await this.assertConversationAccess.assertCanAccess(
      conversation,
      command.authId,
    );

    const message = await this.messageRepository.create(
      new Message(conversation.id!, senderId, command.body.trim()),
    );

    await this.conversationRepository.updateLastMessageAt(
      conversation.id!,
      message.createdAt!,
    );

    return MessageOutput.fromDomain(message);
  }
}
