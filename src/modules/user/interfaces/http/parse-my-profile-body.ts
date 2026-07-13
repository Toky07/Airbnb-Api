import {
  toOptionalScalarString,
  toScalarString,
} from '../../../../shared/http/to-scalar-string';
import type { UpdateMyProfileDto } from '../../applications/dto/update-my-profile.dto';

export function parseMyProfileBody(
  body: Record<string, unknown>,
): UpdateMyProfileDto {
  const dto: UpdateMyProfileDto = {
    firstName: toScalarString(body.firstName),
    lastName: toScalarString(body.lastName),
    phoneNumber: toScalarString(body.phoneNumber),
  };

  const avatar = toOptionalScalarString(body.avatar);
  if (avatar !== undefined) {
    dto.avatar = avatar;
  }

  return dto;
}
