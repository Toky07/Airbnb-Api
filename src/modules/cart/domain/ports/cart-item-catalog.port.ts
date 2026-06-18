export const CART_ITEM_CATALOG_PORT = 'CART_ITEM_CATALOG_PORT';

export type ReservationCartItemDetails = {
  label: string;
  unitPrice: number;
  totalPrice: number;
  nights: number;
  propertyId: number | null;
  roomId: number;
};

export type ReservationCartItemInput = {
  roomId: number;
  startDate: string;
  endDate: string;
  guestCount: number;
};

export interface ICartItemCatalogPort {
  buildReservationItem(
    input: ReservationCartItemInput,
  ): Promise<ReservationCartItemDetails>;

  updateReservationItem(
    input: ReservationCartItemInput & { currentLabel: string },
  ): Promise<ReservationCartItemDetails>;
}
