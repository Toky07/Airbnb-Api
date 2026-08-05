import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { SWAGGER_CART_SESSION, SWAGGER_JWT } from './swagger.constants';

export function ApiJwtAuth() {
  return applyDecorators(ApiBearerAuth(SWAGGER_JWT));
}

export function ApiCartSessionHeader() {
  return applyDecorators(
    ApiSecurity(SWAGGER_CART_SESSION),
    ApiHeader({
      name: 'X-Cart-Session',
      description:
        'Identifiant de session pour le panier anonyme (UUID). Ignoré si JWT présent.',
      required: false,
    }),
  );
}

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 20 }),
  );
}

export function ApiPermissionDocs(...permissions: string[]) {
  return applyDecorators(
    ApiJwtAuth(),
    ...(permissions.length > 0
      ? [
          ApiHeader({
            name: 'X-Required-Permissions',
            description: permissions.join(', '),
            required: false,
          }),
        ]
      : []),
  );
}
