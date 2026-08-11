import type { JwtPayload } from '@src/modules/authentication/contracts';
import { CART_SESSION_HEADER } from '@src/modules/cart/domain/constants/cart-item-type.constant';
import type { CartRequestContext } from '@src/modules/cart/applications/services/resolve-cart.service';

type CartRequest = {
  user?: JwtPayload;
  headers: Record<string, string | string[] | undefined>;
};

export function parseCartContext(request: CartRequest): CartRequestContext {
  const rawHeader =
    request.headers[CART_SESSION_HEADER] ??
    request.headers[CART_SESSION_HEADER.toLowerCase()];

  const sessionId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  return {
    sessionId: sessionId?.trim() || null,
    authId: request.user?.sub ?? null,
  };
}
