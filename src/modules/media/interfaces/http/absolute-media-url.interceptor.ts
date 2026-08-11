import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { resolveMediaPublicUrl } from '@src/modules/media/utils/resolve-media-public-url';

/**
 * Transforme automatiquement tout chemin `uploads/...` en URL absolue
 * dans les réponses JSON (room, property, avatar, panier, etc.).
 * Aucun presenter / DTO à modifier pour les futures entités.
 */
@Injectable()
export class AbsoluteMediaUrlInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(map((data) => transformMediaUrls(data)));
  }
}

export function transformMediaUrls(value: unknown): unknown {
  if (typeof value === 'string') {
    return resolveMediaPublicUrl(value) ?? value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => transformMediaUrls(item));
  }

  if (value instanceof Date || value == null || typeof value !== 'object') {
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(
    value as Record<string, unknown>,
  )) {
    result[key] = transformMediaUrls(nested);
  }
  return result;
}
