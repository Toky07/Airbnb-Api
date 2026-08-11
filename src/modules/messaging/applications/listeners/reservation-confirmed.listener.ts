import type { GetOrCreateConversationService } from '@src/modules/messaging/applications/services/get-or-create-conversation.service';
import { EventBus } from '@src/shared/domain/event.bus';
import type { ReservationConfirmedEvent } from '@src/modules/reservation/contracts';

export class ReservationConfirmedListener {
  constructor(
    private readonly getOrCreateConversation: GetOrCreateConversationService,
  ) {}

  async listen(): Promise<void> {
    EventBus.getInstance().subscribe(
      'reservation.confirmed',
      async (event: ReservationConfirmedEvent) => {
        if (!event.reservation?.id) {
          return;
        }

        await this.getOrCreateConversation.execute(event.reservation.id);
      },
    );
  }
}
