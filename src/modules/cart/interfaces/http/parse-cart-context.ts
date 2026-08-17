import { BadRequestException } from '@nestjs/common';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import { CART_SESSION_HEADER } from '@src/modules/cart/domain/constants/cart-item-type.constant';
import type { CartRequestContext } from '@src/modules/cart/applications/services/resolve-cart.service';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CartRequest = {
  user?: JwtPayload;
  headers: Record<string, string | string[] | undefined>;
};

export function parseCartContext(request: CartRequest): CartRequestContext {
  const rawHeader =
    request.headers[CART_SESSION_HEADER] ??
    request.headers[CART_SESSION_HEADER.toLowerCase()];

  const sessionId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  const trimmed = sessionId?.trim() || null;

  if (trimmed && !UUID_V4.test(trimmed)) {
    throw new BadRequestException('Session panier invalide.');
  }

  return {
    sessionId: trimmed,
    authId: request.user?.sub ?? null,
  };
}
