/**
 * Surface publique du module cart.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf CartModule Nest et ORM).
 */
export {
  CART_USER_PORT,
  type ICartUserPort,
  type CartUserSnapshot,
} from '@src/modules/cart/domain/ports/cart-user.port';
export {
  CART_ITEM_CATALOG_PORT,
  type ICartItemCatalogPort,
  type ReservationCartItemInput,
  type ReservationCartItemDetails,
} from '@src/modules/cart/domain/ports/cart-item-catalog.port';
export {
  CART_PRODUCT_SUMMARY_PORT,
  type ICartProductSummaryPort,
  type CartProductSummary,
} from '@src/modules/cart/domain/ports/cart-product-summary.port';
export {
  CartCheckoutRequestedEvent,
  type CartCheckoutItemPayload,
} from '@src/modules/cart/domain/events/cart-checkout-requested.event';
export { CartCheckoutReservationCreatedEvent } from '@src/modules/cart/domain/events/cart-checkout-reservation-created.event';
