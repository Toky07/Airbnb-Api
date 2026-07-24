import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { ConversationOutput } from '../../dto/conversation.output';
import type { GetOrCreateConversationService } from '../../services/get-or-create-conversation.service';
import type { ResolveReservationParticipantsService } from '../../services/resolve-reservation-participants.service';
import type { GetOrCreateConversationCommand } from '../commands/GetOrCreateConversationCommand';

export class GetOrCreateConversationCommandHandler implements ICommandHandler<
  GetOrCreateConversationCommand,
  ConversationOutput
> {
  constructor(
    private readonly getOrCreateConversation: GetOrCreateConversationService,
    private readonly resolveParticipants: ResolveReservationParticipantsService,
  ) {}

  async execute(
    command: GetOrCreateConversationCommand,
  ): Promise<ConversationOutput> {
    await this.resolveParticipants.assertParticipant(
      command.reservationId,
      command.authId,
    );

    const conversation = await this.getOrCreateConversation.execute(
      command.reservationId,
    );

    return ConversationOutput.fromDomain(conversation);
  }
}
