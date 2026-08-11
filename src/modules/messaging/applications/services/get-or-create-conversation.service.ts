import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Conversation } from '@src/modules/messaging/domain/entities/conversation.entity';
import {
  CONVERSATION_REPOSITORY,
  type IConversationRepository,
} from '@src/modules/messaging/domain/repositories/conversation.repository';
import { ResolveReservationParticipantsService } from './resolve-reservation-participants.service';

@Injectable()
export class GetOrCreateConversationService {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,
    @Inject(ResolveReservationParticipantsService)
    private readonly resolveParticipants: ResolveReservationParticipantsService,
  ) {}

  async execute(reservationId: number): Promise<Conversation> {
    const existing =
      await this.conversationRepository.findByReservationId(reservationId);
    if (existing) {
      return existing;
    }

    const participants =
      await this.resolveParticipants.resolveFromReservationId(reservationId);

    return this.conversationRepository.create(
      new Conversation(
        participants.guestId,
        participants.hostId,
        reservationId,
      ),
    );
  }
}
