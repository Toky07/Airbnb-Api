import { toOptionalScalarString } from '@src/shared/http/to-scalar-string';
import type { CreateUserDto } from '@src/modules/user/domain/dtos/createUser.dto';

export function parseUserBody(body: Record<string, unknown>): CreateUserDto {
  const dto: CreateUserDto = {
    firstName: toOptionalScalarString(body.firstName) ?? '',
    lastName: toOptionalScalarString(body.lastName) ?? '',
    email: toOptionalScalarString(body.email) ?? '',
    phoneNumber: toOptionalScalarString(body.phoneNumber) ?? '',
  };

  const avatar = toOptionalScalarString(body.avatar);
  if (avatar !== undefined) {
    dto.avatar = avatar;
  }

  return dto;
}
