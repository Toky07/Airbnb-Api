import { Injectable } from '@nestjs/common';
import { RoomProductSummaryService } from '../../../rooms/applications/services/room-product-summary.service';
import { ReservationItemOutput } from '../dto/reservation-item.output';
import { ReservationOutput } from '../dto/reservation.output';

@Injectable()
export class EnrichReservationOutputsService {
  constructor(
    private readonly roomProductSummary: RoomProductSummaryService,
  ) {}

  async enrichItems(items: ReservationItemOutput[]): Promise<ReservationItemOutput[]> {
    const summaries = await this.roomProductSummary.getByRoomIds(
      items.map((item) => item.roomId),
    );

    return items.map((item) =>
      ReservationItemOutput.enrich(item, summaries.get(item.roomId)),
    );
  }

  async enrich(outputs: ReservationOutput[]): Promise<ReservationOutput[]> {
    const allItems = outputs.flatMap((reservation) => reservation.items);
    const enrichedItems = await this.enrichItems(allItems);
    const enrichedById = new Map(enrichedItems.map((item) => [item.id, item]));

    return outputs.map(
      (reservation) =>
        new ReservationOutput(
          reservation.id,
          reservation.userId,
          reservation.items.map(
            (item) => enrichedById.get(item.id) ?? item,
          ),
          reservation.status,
          reservation.createdAt,
          reservation.updatedAt,
        ),
    );
  }
}
