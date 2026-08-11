import type { GetOrCreateConversationService } from '../services/get-or-create-conversation.service';
import { EventBus } from '../../../../shared/domain/event.bus';
import type { ReservationConfirmedEvent } from '../../../reservation/contracts';

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
