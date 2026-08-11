import type { JwtPayload } from '../../../authentication/contracts';
import { CART_SESSION_HEADER } from '../../domain/constants/cart-item-type.constant';
import type { CartRequestContext } from '../../applications/services/resolve-cart.service';

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
