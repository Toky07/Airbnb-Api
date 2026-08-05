export type ReservationPaymentContext = {
  reservationId: number;
  propertyIds: number[];
  roomIds: number[];
  checkIn: string;
  checkOut: string;
};
