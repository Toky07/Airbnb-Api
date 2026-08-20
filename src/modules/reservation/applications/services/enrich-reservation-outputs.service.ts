import { Injectable } from '@nestjs/common';
import { RoomProductSummaryService } from '@src/modules/rooms/contracts';
import { RESERVATION_STATUS } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import { ReservationItemOutput } from '@src/modules/reservation/applications/dto/reservation-item.output';
import { ReservationOutput } from '@src/modules/reservation/applications/dto/reservation.output';

function includeArrivalSecrets(status: string): boolean {
  return (
    status === RESERVATION_STATUS.CONFIRMED ||
    status === RESERVATION_STATUS.NO_SHOW
  );
}

@Injectable()
export class EnrichReservationOutputsService {
  constructor(private readonly roomProductSummary: RoomProductSummaryService) {}

  async enrichItems(
    items: ReservationItemOutput[],
    includeSecrets = false,
  ): Promise<ReservationItemOutput[]> {
    const summaries = await this.roomProductSummary.getByRoomIds(
      items.map((item) => item.roomId),
    );

    return items.map((item) =>
      ReservationItemOutput.enrich(
        item,
        summaries.get(item.roomId),
        includeSecrets,
      ),
    );
  }

  async enrich(outputs: ReservationOutput[]): Promise<ReservationOutput[]> {
    const allItems = outputs.flatMap((reservation) => reservation.items);
    const summaries = await this.roomProductSummary.getByRoomIds(
      allItems.map((item) => item.roomId),
    );

    return outputs.map((reservation) => {
      const includeSecrets = includeArrivalSecrets(reservation.status);
      const items = reservation.items.map((item) =>
        ReservationItemOutput.enrich(
          item,
          summaries.get(item.roomId),
          includeSecrets,
        ),
      );

      return new ReservationOutput(
        reservation.id,
        reservation.userId,
        items,
        reservation.status,
        reservation.createdAt,
        reservation.updatedAt,
        reservation.holdUntil,
        reservation.paymentId,
      );
    });
  }
}
