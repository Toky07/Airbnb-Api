import { Injectable } from '@nestjs/common';
import { RoomProductSummaryService } from '../../../rooms/applications/services/room-product-summary.service';
import { ReservationOutput } from '../dto/reservation.output';

@Injectable()
export class EnrichReservationOutputsService {
  constructor(
    private readonly roomProductSummary: RoomProductSummaryService,
  ) {}

  async enrich(outputs: ReservationOutput[]): Promise<ReservationOutput[]> {
    const summaries = await this.roomProductSummary.getByRoomIds(
      outputs.map((reservation) => reservation.roomId),
    );

    return outputs.map((reservation) =>
      ReservationOutput.enrich(
        reservation,
        summaries.get(reservation.roomId),
      ),
    );
  }
}
