export const CART_EVENTS = {
  CHECKOUT_REQUESTED: 'cart.checkout.requested',
  CHECKOUT_RESERVATION_CREATED: 'cart.checkout.reservation.created',
  CHECKOUT_COMPLETED: 'cart.checkout.completed',
  CHECKOUT_COMPLETE_REQUESTED: 'cart.checkout.complete.requested',
  CHECKOUT_COMPLETE_VERIFIED: 'cart.checkout.complete.verified',
} as const;

export type CartEventName = (typeof CART_EVENTS)[keyof typeof CART_EVENTS];
