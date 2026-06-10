export const CART_ITEM_TYPE = {
  RESERVATION: 'reservation',
  SERVICE: 'service',
} as const;

export type CartItemType = (typeof CART_ITEM_TYPE)[keyof typeof CART_ITEM_TYPE];

export const CART_SESSION_HEADER = 'x-cart-session';
