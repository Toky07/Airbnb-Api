export const CART_PRODUCT_SUMMARY_PORT = 'CART_PRODUCT_SUMMARY_PORT';

export type CartProductSummary = {
  roomName: string | null;
  roomSlug: string | null;
  propertyName: string | null;
  propertyCity: string | null;
  imageUrl: string | null;
};

export interface ICartProductSummaryPort {
  getByRoomIds(roomIds: number[]): Promise<Map<number, CartProductSummary>>;
}
