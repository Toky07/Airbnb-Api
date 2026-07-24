import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { GetOrCreateConversationService } from '../services/get-or-create-conversation.service';
import { ReservationConfirmedListener } from '../listeners/reservation-confirmed.listener';

@Injectable()
export class MessagingEvent implements OnModuleInit {
  constructor(
    @Inject(GetOrCreateConversationService)
    private readonly getOrCreateConversation: GetOrCreateConversationService,
  ) {}

  async onModuleInit(): Promise<void> {
    const listener = new ReservationConfirmedListener(
      this.getOrCreateConversation,
    );
    await listener.listen();
  }
}
